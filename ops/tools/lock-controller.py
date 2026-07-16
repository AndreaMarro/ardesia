import argparse
import datetime
import hashlib
import json
import os
import pathlib
import secrets
import select
import signal
import stat
import subprocess
import sys
import time


WORKTREE = pathlib.Path("/Users/andreamarro/VOLUME 3/ardesia-wt-ai-native-governance")
EXPECTED_COMMON = pathlib.Path("/Users/andreamarro/VOLUME 3/ardesia/.git")
EXPECTED_WORKTREE_LOCK = pathlib.Path(
    "/Users/andreamarro/VOLUME 3/ardesia/.git/worktrees/"
    "ardesia-wt-ai-native-governance/loop-writer.lock"
)
RUN_ROOT = pathlib.Path("/Users/andreamarro/VOLUME 3/.ardesia-loop/runs")
LOCKS = [
    pathlib.Path(
        "/Users/andreamarro/VOLUME 3/.ardesia-loop/locks/"
        "ardesia-continuous-60m.lock"
    ),
    pathlib.Path("/Users/andreamarro/VOLUME 3/ardesia/.git/ardesia-loop-writer.lock"),
    EXPECTED_WORKTREE_LOCK,
]

RUN_DURATION_NS = 3_600_000_000_000
SHUTDOWN_OFFSET_NS = 3_420_000_000_000
MAX_FUTURE_SKEW_NS = 5_000_000_000
CLOCK_DOMAIN = "controller-local-monotonic-rebased-from-utc-v1"
STDIN_CLOSED = "__STDIN_CLOSED__"


class ScheduleError(ValueError):
    def __init__(self, reason):
        super().__init__(reason)
        self.reason = reason


class Schedule:
    def __init__(
        self,
        *,
        start_wall,
        shutdown_wall,
        deadline_wall,
        start_ns,
        shutdown_ns,
        deadline_ns,
        rebase_elapsed_ns,
        anchor_wall,
        anchor_monotonic_ns,
    ):
        self.start_wall = start_wall
        self.shutdown_wall = shutdown_wall
        self.deadline_wall = deadline_wall
        self.start_ns = start_ns
        self.shutdown_ns = shutdown_ns
        self.deadline_ns = deadline_ns
        self.rebase_elapsed_ns = rebase_elapsed_ns
        self.anchor_wall = anchor_wall
        self.anchor_monotonic_ns = anchor_monotonic_ns


def parse_args(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--plan-version", required=True, type=int)
    parser.add_argument("--task-started-at", required=True)
    parser.add_argument(
        "--task-start-monotonic-ns",
        dest="reported_task_start_monotonic_ns",
        type=int,
        default=None,
        help=(
            "Deprecated audit-only launcher value. It is never used for deadline "
            "or lock control because Python 3.9 monotonic epochs differ by process "
            "on macOS."
        ),
    )
    return parser.parse_args(argv)


def git(*args, worktree=WORKTREE):
    env = os.environ.copy()
    env["GIT_OPTIONAL_LOCKS"] = "0"
    return subprocess.check_output(
        ["git", *args], cwd=worktree, env=env, text=True
    ).strip()


def iso(value):
    return value.astimezone(datetime.timezone.utc).isoformat().replace("+00:00", "Z")


def parse_task_started_at(value):
    try:
        parsed = datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (AttributeError, ValueError) as exc:
        raise ScheduleError("TASK_START_INVALID") from exc
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise ScheduleError("TASK_START_MUST_BE_TIMEZONE_AWARE")
    return parsed.astimezone(datetime.timezone.utc)


def timedelta_to_ns(value):
    return (
        value.days * 86_400_000_000_000
        + value.seconds * 1_000_000_000
        + value.microseconds * 1_000
    )


def build_schedule(task_started_at, *, now_wall, now_monotonic_ns):
    if task_started_at.tzinfo is None or task_started_at.utcoffset() is None:
        raise ScheduleError("TASK_START_MUST_BE_TIMEZONE_AWARE")
    if now_wall.tzinfo is None or now_wall.utcoffset() is None:
        raise ScheduleError("CLOCK_ANCHOR_MUST_BE_TIMEZONE_AWARE")

    start_wall = task_started_at.astimezone(datetime.timezone.utc)
    anchor_wall = now_wall.astimezone(datetime.timezone.utc)
    elapsed_ns = timedelta_to_ns(anchor_wall - start_wall)
    if elapsed_ns < -MAX_FUTURE_SKEW_NS:
        raise ScheduleError("TASK_START_IN_FUTURE")

    rebase_elapsed_ns = max(0, elapsed_ns)
    start_ns = now_monotonic_ns - rebase_elapsed_ns
    return Schedule(
        start_wall=start_wall,
        shutdown_wall=start_wall + datetime.timedelta(seconds=3420),
        deadline_wall=start_wall + datetime.timedelta(seconds=3600),
        start_ns=start_ns,
        shutdown_ns=start_ns + SHUTDOWN_OFFSET_NS,
        deadline_ns=start_ns + RUN_DURATION_NS,
        rebase_elapsed_ns=rebase_elapsed_ns,
        anchor_wall=anchor_wall,
        anchor_monotonic_ns=now_monotonic_ns,
    )


def wait_for_command(stdin, timeout):
    ready, _, _ = select.select([stdin], [], [], timeout)
    if not ready:
        return None
    line = stdin.readline()
    if not line:
        return STDIN_CLOSED
    return line.strip()


def emit_json(record):
    print(json.dumps(record, sort_keys=True), flush=True)


def process_start(pid):
    return subprocess.check_output(
        ["ps", "-p", str(pid), "-o", "lstart="], text=True
    ).strip()


def run_controller(
    args,
    *,
    lock_paths=LOCKS,
    run_root=RUN_ROOT,
    worktree=WORKTREE,
    expected_common=EXPECTED_COMMON,
    expected_worktree_lock=EXPECTED_WORKTREE_LOCK,
    git_fn=None,
    now_wall_fn=None,
    monotonic_ns_fn=None,
    wait_for_command_fn=wait_for_command,
    process_start_fn=process_start,
    token_fn=secrets.token_hex,
    emit_fn=emit_json,
    open_fn=None,
    open_read_fn=None,
    open_dir_fn=None,
    link_fn=None,
    read_fn=None,
    write_fn=None,
    fsync_fn=None,
    close_fn=None,
    unlink_fn=None,
    signal_setter_fn=None,
    install_signal_handlers=True,
    stdin=None,
):
    if git_fn is None:
        git_fn = lambda *values: git(*values, worktree=worktree)
    if now_wall_fn is None:
        now_wall_fn = lambda: datetime.datetime.now(datetime.timezone.utc)
    if monotonic_ns_fn is None:
        monotonic_ns_fn = time.monotonic_ns
    if stdin is None:
        stdin = sys.stdin
    open_fn = os.open if open_fn is None else open_fn
    open_read_fn = os.open if open_read_fn is None else open_read_fn
    open_dir_fn = os.open if open_dir_fn is None else open_dir_fn
    link_fn = os.link if link_fn is None else link_fn
    read_fn = os.read if read_fn is None else read_fn
    write_fn = os.write if write_fn is None else write_fn
    fsync_fn = os.fsync if fsync_fn is None else fsync_fn
    close_fn = os.close if close_fn is None else close_fn
    unlink_fn = pathlib.Path.unlink if unlink_fn is None else unlink_fn
    signal_setter_fn = signal.signal if signal_setter_fn is None else signal_setter_fn
    lock_paths = [pathlib.Path(path) for path in lock_paths]

    run_dir = pathlib.Path(run_root) / args.run_id
    if not run_dir.is_dir() or run_dir.is_symlink():
        emit_fn(
            {
                "status": "REPLAN_REQUIRED",
                "reason": "RUN_DIRECTORY_IDENTITY_MISMATCH",
                "run_id": args.run_id,
            }
        )
        return 44

    try:
        start_wall = parse_task_started_at(args.task_started_at)
        # Sample monotonic first so wall-clock sampling delay biases deadlines
        # earlier, never later.
        anchor_ns = monotonic_ns_fn()
        anchor_wall = now_wall_fn()
        schedule = build_schedule(
            start_wall,
            now_wall=anchor_wall,
            now_monotonic_ns=anchor_ns,
        )
    except ScheduleError as exc:
        emit_fn(
            {
                "status": "REPLAN_REQUIRED",
                "reason": exc.reason,
                "run_id": args.run_id,
            }
        )
        return 44

    if anchor_ns >= schedule.shutdown_ns:
        emit_fn(
            {
                "status": "BUDGET_EXHAUSTED",
                "reason": "SHUTDOWN_WINDOW_REACHED_BEFORE_LOCK",
                "run_id": args.run_id,
                "clock_domain": CLOCK_DOMAIN,
                "task_started_at": iso(schedule.start_wall),
                "task_shutdown_at": iso(schedule.shutdown_wall),
                "elapsed_seconds": (anchor_ns - schedule.start_ns) / 1e9,
                "locks_acquired": 0,
            }
        )
        return 75

    common = pathlib.Path(
        git_fn("rev-parse", "--path-format=absolute", "--git-common-dir")
    ).resolve()
    worktree_lock = pathlib.Path(
        git_fn("rev-parse", "--path-format=absolute", "--git-path", "loop-writer.lock")
    ).resolve()
    if (
        common != pathlib.Path(expected_common).resolve()
        or worktree_lock != pathlib.Path(expected_worktree_lock).resolve()
    ):
        emit_fn(
            {
                "status": "REPLAN_REQUIRED",
                "reason": "GIT_IDENTITY_DRIFT",
                "run_id": args.run_id,
                "common": str(common),
                "worktree_lock": str(worktree_lock),
            }
        )
        return 44

    branch = git_fn("branch", "--show-current")
    head = git_fn("rev-parse", "HEAD")
    owner_token = token_fn(32)
    pid = os.getpid()
    process_started_at = process_start_fn(pid)
    acquired_ns = monotonic_ns_fn()
    acquired_wall = now_wall_fn().astimezone(datetime.timezone.utc)
    owner = {
        "schema_version": "3.0",
        "run_id": args.run_id,
        "plan_version": args.plan_version,
        "owner_token": owner_token,
        "pid": pid,
        "process_start_time": process_started_at,
        "worktree": str(worktree),
        "branch": branch,
        "head": head,
        "clock_contract_version": 1,
        "clock_domain": CLOCK_DOMAIN,
        "clock_source": time.get_clock_info("monotonic").implementation,
        "monotonic_clock_scope": "controller-process",
        "monotonic_clock_pid": pid,
        "clock_anchor_at": iso(schedule.anchor_wall),
        "clock_anchor_monotonic_ns": schedule.anchor_monotonic_ns,
        "clock_rebase_elapsed_ns": schedule.rebase_elapsed_ns,
        "task_started_at": iso(schedule.start_wall),
        "task_start_monotonic_ns": schedule.start_ns,
        "task_start_monotonic_ns_source": "controller-local-utc-rebase",
        "reported_task_start_monotonic_ns": getattr(
            args, "reported_task_start_monotonic_ns", None
        ),
        "reported_task_start_monotonic_ns_control_authority": False,
        "lock_acquired_at": iso(acquired_wall),
        "lock_acquired_monotonic_ns": acquired_ns,
        "task_deadline_at": iso(schedule.deadline_wall),
        "task_deadline_monotonic_ns": schedule.deadline_ns,
        "task_shutdown_at": iso(schedule.shutdown_wall),
        "task_shutdown_monotonic_ns": schedule.shutdown_ns,
        "lock_primitive": "prepared-file-hardlink-v1",
    }
    owner_bytes = (
        json.dumps(owner, sort_keys=True, separators=(",", ":")) + "\n"
    ).encode()
    owned = []
    staged = []
    pending_publication = None
    terminal_release_emitted = False
    stopping = False
    stop_signal = None
    previous_signal_handlers = {}

    def identity(value):
        return (value.st_dev, value.st_ino)

    def fsync_parent(path):
        last_error = None
        for _attempt in range(2):
            descriptor = None
            try:
                descriptor = open_dir_fn(pathlib.Path(path).parent, os.O_RDONLY)
                fsync_fn(descriptor)
                return
            except Exception as exc:
                last_error = exc
            finally:
                if descriptor is not None:
                    close_fn(descriptor)
        raise last_error

    def safe_unlink_staged(entry):
        path = entry["path"]
        expected = entry.get("identity")
        try:
            observed = path.lstat()
        except FileNotFoundError:
            return None
        if expected is None or identity(observed) != expected or not stat.S_ISREG(observed.st_mode):
            return str(path) + ":staging-identity-mismatch"
        try:
            unlink_fn(path)
            fsync_parent(path)
            return None
        except Exception as exc:
            return str(path) + ":" + type(exc).__name__

    def cleanup_staged():
        failures = []
        for entry in list(reversed(staged)):
            failure = safe_unlink_staged(entry)
            if failure is None:
                staged.remove(entry)
            else:
                failures.append(failure)
        return failures

    def recover_pending_publication():
        nonlocal pending_publication
        if pending_publication is None:
            return
        lock = pending_publication["lock"]
        expected = pending_publication["identity"]
        try:
            observed = lock.lstat()
        except FileNotFoundError:
            pending_publication = None
            return False
        if identity(observed) == expected and stat.S_ISREG(observed.st_mode):
            if not any(entry["path"] == lock for entry in owned):
                owned.append({"path": lock, "identity": expected})
            recovered = True
        else:
            recovered = False
        pending_publication = None
        return recovered

    def verified_owner(path, expected):
        descriptor = open_read_fn(
            path,
            os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0),
        )
        try:
            observed = os.fstat(descriptor)
            if identity(observed) != expected or not stat.S_ISREG(observed.st_mode):
                return False
            chunks = []
            total = 0
            while True:
                chunk = read_fn(descriptor, 4096)
                if not chunk:
                    break
                total += len(chunk)
                if total > 65_536:
                    raise ValueError("owner-record-too-large")
                chunks.append(chunk)
            current = json.loads(b"".join(chunks))
        finally:
            close_fn(descriptor)
        return (
            current.get("run_id") == args.run_id
            and current.get("owner_token") == owner_token
            and current.get("pid") == pid
            and current.get("process_start_time") == process_started_at
            and current.get("lock_primitive") == "prepared-file-hardlink-v1"
        )

    def release():
        failures = []
        released_paths = []
        for entry in list(reversed(owned)):
            lock = entry["path"]
            expected = entry["identity"]
            released = False
            failure = None
            durability_failure = None
            for attempt in range(2):
                try:
                    observed = lock.lstat()
                    if identity(observed) != expected or not stat.S_ISREG(observed.st_mode):
                        failure = str(lock) + ":ownership-identity-mismatch"
                        break
                    if not verified_owner(lock, expected):
                        failure = str(lock) + ":ownership-mismatch"
                        break
                    before_unlink = lock.lstat()
                    if identity(before_unlink) != expected:
                        failure = str(lock) + ":ownership-identity-mismatch"
                        break
                    try:
                        unlink_fn(lock)
                    except Exception as exc:
                        try:
                            after = lock.lstat()
                        except FileNotFoundError:
                            after = None
                        if after is None:
                            try:
                                fsync_parent(lock)
                            except Exception as sync_exc:
                                durability_failure = (
                                    str(lock)
                                    + ":parent-fsync-"
                                    + type(sync_exc).__name__
                                )
                            released = True
                            break
                        if identity(after) != expected:
                            failure = str(lock) + ":ownership-identity-mismatch"
                            break
                        if attempt == 0:
                            continue
                        failure = str(lock) + ":" + type(exc).__name__
                        break
                    released = True
                    try:
                        fsync_parent(lock)
                    except Exception as exc:
                        durability_failure = (
                            str(lock) + ":parent-fsync-" + type(exc).__name__
                        )
                    break
                except Exception as exc:
                    if attempt == 0:
                        continue
                    else:
                        failure = str(lock) + ":" + type(exc).__name__
            if released:
                released_paths.append(str(lock))
                if entry in owned:
                    owned.remove(entry)
                if durability_failure is not None:
                    failures.append(durability_failure)
            elif failure is not None:
                failures.append(failure)
        return failures, released_paths

    def stop_handler(signum, _frame):
        nonlocal stopping, stop_signal
        stopping = True
        stop_signal = signum

    def signal_reason(suffix=""):
        try:
            name = signal.Signals(stop_signal).name
        except (TypeError, ValueError):
            name = "SIGNAL"
        return name + suffix

    def write_all(descriptor, payload):
        offset = 0
        while offset < len(payload):
            written = write_fn(descriptor, payload[offset:])
            if written is None or written <= 0:
                raise OSError("owner-record-short-write")
            offset += written

    if install_signal_handlers:
        try:
            previous_signal_handlers[signal.SIGTERM] = signal_setter_fn(
                signal.SIGTERM, stop_handler
            )
            previous_signal_handlers[signal.SIGINT] = signal_setter_fn(
                signal.SIGINT, stop_handler
            )
        except BaseException:
            for signum, previous in reversed(previous_signal_handlers.items()):
                try:
                    signal_setter_fn(signum, previous)
                except Exception:
                    pass
            raise

    try:
        collision_path = None
        try:
            for lock_value in lock_paths:
                lock = pathlib.Path(lock_value)
                now_before_lock = monotonic_ns_fn()
                if stopping:
                    failures, released_paths = release()
                    failures.extend(cleanup_staged())
                    emit_fn(
                        {
                            "status": "LOCKS_RELEASED" if not failures else "LOCK_RELEASE_FAILED",
                            "reason": signal_reason("_DURING_LOCK_ACQUISITION"),
                            "run_id": args.run_id,
                            "released": len(released_paths),
                            "released_paths": released_paths,
                            "failures": failures,
                        }
                    )
                    terminal_release_emitted = True
                    return 0 if not failures else 74
                if now_before_lock >= schedule.shutdown_ns:
                    locks_acquired = len(owned)
                    failures, released_paths = release()
                    failures.extend(cleanup_staged())
                    emit_fn(
                        {
                            "status": "BUDGET_EXHAUSTED" if not failures else "LOCK_RELEASE_FAILED",
                            "reason": "SHUTDOWN_WINDOW_REACHED_DURING_LOCK_ACQUISITION",
                            "run_id": args.run_id,
                            "clock_domain": CLOCK_DOMAIN,
                            "locks_acquired": locks_acquired,
                            "released": len(released_paths),
                            "released_paths": released_paths,
                            "failures": failures,
                            "elapsed_seconds": (now_before_lock - schedule.start_ns) / 1e9,
                        }
                    )
                    terminal_release_emitted = True
                    return 75 if not failures else 74

                digest = hashlib.sha256(
                    (owner_token + "\0" + str(lock)).encode()
                ).hexdigest()[:24]
                stage_path = lock.with_name(
                    "." + lock.name + ".candidate." + str(pid) + "." + digest
                )
                stage_entry = {"path": stage_path, "identity": None}
                staged.append(stage_entry)
                descriptor = open_fn(
                    stage_path,
                    os.O_WRONLY | os.O_CREAT | os.O_EXCL,
                    0o600,
                )
                try:
                    stage_entry["identity"] = identity(os.fstat(descriptor))
                    write_all(descriptor, owner_bytes)
                    fsync_fn(descriptor)
                    mode = os.fstat(descriptor).st_mode
                    if not stat.S_ISREG(mode) or (mode & 0o777) != 0o600:
                        raise RuntimeError("owner-record-mode-mismatch")
                finally:
                    close_fn(descriptor)

                pending_publication = {
                    "lock": lock,
                    "identity": stage_entry["identity"],
                }
                try:
                    link_fn(stage_path, lock)
                except FileExistsError:
                    collision_path = lock
                    pending_publication = None
                    raise
                if not recover_pending_publication():
                    raise RuntimeError("lock-publication-identity-mismatch")
                fsync_parent(lock)
                stage_failure = safe_unlink_staged(stage_entry)
                if stage_failure is not None:
                    raise OSError("staging-cleanup-failed")
                staged.remove(stage_entry)

                if stopping:
                    failures, released_paths = release()
                    failures.extend(cleanup_staged())
                    emit_fn(
                        {
                            "status": "LOCKS_RELEASED" if not failures else "LOCK_RELEASE_FAILED",
                            "reason": signal_reason("_DURING_LOCK_ACQUISITION"),
                            "run_id": args.run_id,
                            "released": len(released_paths),
                            "released_paths": released_paths,
                            "failures": failures,
                        }
                    )
                    terminal_release_emitted = True
                    return 0 if not failures else 74
            if len(owned) != len(lock_paths):
                raise RuntimeError("lock-set-incomplete")
            for entry in owned:
                observed = entry["path"].lstat()
                if (
                    identity(observed) != entry["identity"]
                    or not stat.S_ISREG(observed.st_mode)
                    or (observed.st_mode & 0o777) != 0o600
                    or not verified_owner(entry["path"], entry["identity"])
                ):
                    raise RuntimeError("lock-set-verification-failed")
        except FileExistsError:
            recover_pending_publication()
            failures, released_paths = release()
            failures.extend(cleanup_staged())
            status = "LOCK_COLLISION" if not failures else "LOCK_RELEASE_FAILED"
            emit_fn(
                {
                    "status": status,
                    "run_id": args.run_id,
                    "path": str(collision_path),
                    "released": len(released_paths),
                    "released_paths": released_paths,
                    "failures": failures,
                }
            )
            terminal_release_emitted = True
            return 73 if not failures else 74
        except Exception as exc:
            recover_pending_publication()
            failures, released_paths = release()
            failures.extend(cleanup_staged())
            emit_fn(
                {
                    "status": "LOCK_ACQUISITION_DEFECT",
                    "run_id": args.run_id,
                    "error": type(exc).__name__,
                    "released": len(released_paths),
                    "released_paths": released_paths,
                    "failures": failures,
                }
            )
            terminal_release_emitted = True
            return 74
        except BaseException:
            recover_pending_publication()
            release()
            cleanup_staged()
            raise

        safe = {key: value for key, value in owner.items() if key != "owner_token"}
        safe.update(
            {
                "status": "LOCKS_ACQUIRED",
                "count": len(owned),
                "owner_records": "byte-identical",
                "modes": "0600",
                "run_dir": str(run_dir),
            }
        )
        emit_fn(safe)

        reason = "REQUESTED"
        while not stopping:
            now = monotonic_ns_fn()
            if now >= schedule.shutdown_ns:
                reason = "SHUTDOWN_WINDOW"
                break
            timeout = min(5.0, max(0.0, (schedule.shutdown_ns - now) / 1e9))
            command = wait_for_command_fn(stdin, timeout)
            if command is None:
                continue
            if command == STDIN_CLOSED:
                reason = "STDIN_CLOSED"
                break
            if command == "status":
                emit_fn(
                    {
                        "status": "OWNED",
                        "run_id": args.run_id,
                        "elapsed_seconds": (monotonic_ns_fn() - schedule.start_ns) / 1e9,
                        "locks": len(owned),
                        "clock_domain": CLOCK_DOMAIN,
                    }
                )
            elif command == "release":
                reason = "REQUESTED"
                break
            else:
                emit_fn({"status": "IGNORED_COMMAND", "run_id": args.run_id})
        if stopping:
            reason = signal_reason()

        failures, released_paths = release()
        failures.extend(cleanup_staged())
        emit_fn(
            {
                "status": "LOCKS_RELEASED" if not failures else "LOCK_RELEASE_FAILED",
                "run_id": args.run_id,
                "reason": reason,
                "released": len(released_paths),
                "released_paths": released_paths,
                "failures": failures,
                "elapsed_seconds": (monotonic_ns_fn() - schedule.start_ns) / 1e9,
                "clock_domain": CLOCK_DOMAIN,
            }
        )
        terminal_release_emitted = True
        return 0 if not failures else 74
    finally:
        try:
            if (owned or staged) and not terminal_release_emitted:
                recover_pending_publication()
                failures, released_paths = release()
                failures.extend(cleanup_staged())
                try:
                    emit_fn(
                        {
                            "status": "LOCKS_RELEASED" if not failures else "LOCK_RELEASE_FAILED",
                            "run_id": args.run_id,
                            "reason": "UNHANDLED_CONTROLLER_ABORT",
                            "released": len(released_paths),
                            "released_paths": released_paths,
                            "failures": failures,
                        }
                    )
                except Exception:
                    pass
        finally:
            if install_signal_handlers:
                for signum, previous in previous_signal_handlers.items():
                    try:
                        signal_setter_fn(signum, previous)
                    except Exception:
                        pass


def main(argv=None):
    os.umask(0o077)
    return run_controller(parse_args(argv))


if __name__ == "__main__":
    raise SystemExit(main())
