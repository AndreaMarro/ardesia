import argparse
import datetime
import hashlib
import importlib.util
import inspect
import io
import json
import os
import pathlib
import select
import signal
import stat
import subprocess
import sys
import tempfile
import unittest


CONTROLLER_PATH = pathlib.Path(__file__).with_name("lock-controller.py")
SPEC = importlib.util.spec_from_file_location("ardesia_lock_controller", CONTROLLER_PATH)
CONTROLLER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CONTROLLER)


class FakeClock:
    def __init__(self, wall_now, monotonic_ns):
        self.wall_now = wall_now
        self.value_ns = monotonic_ns

    def now_wall(self):
        return self.wall_now

    def monotonic_ns(self):
        return self.value_ns


class LockControllerTests(unittest.TestCase):
    def test_adversarial_suite_has_no_fail_open_skip_decorators(self):
        skipped = []
        for name, value in vars(type(self)).items():
            if not name.startswith("test_"):
                continue
            source_lines = inspect.getsource(value).splitlines()
            has_skip_decorator = any(
                line.strip().startswith("@unittest.skip") for line in source_lines
            )
            if getattr(value, "__unittest_skip__", False) or has_skip_decorator:
                skipped.append(name)
        skipped.sort()
        self.maxDiff = None
        self.assertEqual(skipped, [])

    def test_launcher_monotonic_is_not_control_authority(self):
        source = CONTROLLER_PATH.read_text()
        self.assertNotIn("start_ns = args.task_start_monotonic_ns", source)
        self.assertIn("build_schedule", source)

    def test_rebases_task_start_into_controller_local_clock(self):
        start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
        clock = FakeClock(start + datetime.timedelta(seconds=480), 125_000_000)
        schedule = CONTROLLER.build_schedule(
            start,
            now_wall=clock.now_wall(),
            now_monotonic_ns=clock.monotonic_ns(),
        )
        self.assertEqual(schedule.start_ns, -479_875_000_000)
        self.assertEqual(schedule.shutdown_ns - schedule.start_ns, 3_420_000_000_000)
        self.assertEqual(schedule.deadline_ns - schedule.start_ns, 3_600_000_000_000)

    def test_legacy_monotonic_flag_is_optional_and_audit_only(self):
        without_legacy = CONTROLLER.parse_args(
            ["--run-id", "test-run", "--plan-version", "1", "--task-started-at", "2026-07-16T01:00:00Z"]
        )
        with_legacy = CONTROLLER.parse_args(
            [
                "--run-id", "test-run", "--plan-version", "1",
                "--task-started-at", "2026-07-16T01:00:00Z",
                "--task-start-monotonic-ns", "147399054127922",
            ]
        )
        self.assertIsNone(without_legacy.reported_task_start_monotonic_ns)
        self.assertEqual(with_legacy.reported_task_start_monotonic_ns, 147399054127922)

    def test_exact_shutdown_boundary_before_lock_writes_nothing(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=3420), 10_000_000)
            code, records = self._run(paths, clock, start)
            self.assertEqual(code, 75)
            self.assertEqual(records[-1]["status"], "BUDGET_EXHAUSTED")
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_one_microsecond_before_shutdown_can_acquire_then_release(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(
                start + datetime.timedelta(seconds=3419, microseconds=999_999),
                10_000_000,
            )
            code, records = self._run(paths, clock, start)
            self.assertEqual(code, 0)
            self.assertEqual(records[-1]["status"], "LOCKS_RELEASED")
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_one_shot_collision_does_not_touch_later_locks(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            paths["locks"][0].mkdir()
            sentinel = paths["locks"][0] / "owner.json"
            sentinel.write_text('{"foreign":true}\n')
            before = sentinel.read_bytes()
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            code, records = self._run(paths, clock, start)
            self.assertEqual(code, 73)
            self.assertEqual(records[-1]["status"], "LOCK_COLLISION")
            self.assertEqual(sentinel.read_bytes(), before)
            self.assertFalse(paths["locks"][1].exists())
            self.assertFalse(paths["locks"][2].exists())

    def test_second_lock_collision_rolls_back_first_without_retrying_third(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            paths["locks"][1].mkdir()
            sentinel = paths["locks"][1] / "owner.json"
            sentinel.write_text('{"foreign":true}\n')
            before = sentinel.read_bytes()
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            code, records = self._run(paths, clock, start)
            self.assertEqual(code, 73)
            self.assertEqual(records[-1]["status"], "LOCK_COLLISION")
            self.assertEqual(records[-1]["released_paths"], [str(paths["locks"][0])])
            self.assertFalse(paths["locks"][0].exists())
            self.assertEqual(sentinel.read_bytes(), before)
            self.assertFalse(paths["locks"][2].exists())

    def test_minute_57_releases_owned_locks_in_reverse(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 100_000_000)

            def wait(_stdin, timeout):
                clock.value_ns += int(timeout * 1_000_000_000)
                return None

            code, records = self._run(paths, clock, start, wait=wait)
            self.assertEqual(code, 0)
            self.assertEqual(records[-1]["status"], "LOCKS_RELEASED")
            self.assertEqual(records[-1]["reason"], "SHUTDOWN_WINDOW")
            self.assertEqual(records[-1]["released"], 3)
            self.assertEqual(
                records[-1]["released_paths"],
                [str(path) for path in reversed(paths["locks"])],
            )
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_unverifiable_owner_variants_preserve_the_affected_lock(self):
        variants = ("owner_token", "run_id", "pid", "process_start_time", "malformed", "missing")
        for variant in variants:
            with self.subTest(variant=variant), tempfile.TemporaryDirectory() as temp:
                paths = self._paths(pathlib.Path(temp))
                start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
                clock = FakeClock(start + datetime.timedelta(seconds=10), 100_000_000)
                changed = False
                changed_bytes = None

                def wait(_stdin, timeout):
                    nonlocal changed, changed_bytes
                    if not changed:
                        owner_path = paths["locks"][2]
                        if variant == "missing":
                            owner_path.unlink()
                        elif variant == "malformed":
                            owner_path.write_text("{\n")
                        else:
                            owner = json.loads(owner_path.read_text())
                            owner[variant] = "foreign" if variant != "pid" else 999_999
                            owner_path.write_text(json.dumps(owner) + "\n")
                        changed_bytes = (
                            owner_path.read_bytes() if owner_path.exists() else None
                        )
                        changed = True
                    clock.value_ns += int(timeout * 1_000_000_000)
                    return None

                code, records = self._run(paths, clock, start, wait=wait)
                self.assertEqual(code, 74)
                self.assertEqual(records[-1]["status"], "LOCK_RELEASE_FAILED")
                self.assertFalse(paths["locks"][0].exists())
                self.assertFalse(paths["locks"][1].exists())
                owner_path = paths["locks"][2]
                if changed_bytes is None:
                    self.assertFalse(owner_path.exists())
                else:
                    self.assertTrue(owner_path.exists())
                    self.assertEqual(owner_path.read_bytes(), changed_bytes)

    def test_crossing_shutdown_between_locks_rolls_back_partial_acquisition(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start, 0)
            values = iter((0, 0, 3_419_999_999_999, 3_420_000_000_000))
            code, records = self._run(
                paths,
                clock,
                start,
                monotonic_fn=lambda: next(values),
            )
            self.assertEqual(code, 75)
            self.assertEqual(records[-1]["status"], "BUDGET_EXHAUSTED")
            self.assertEqual(records[-1]["locks_acquired"], 1)
            self.assertEqual(records[-1]["released_paths"], [str(paths["locks"][0])])
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_crossing_shutdown_during_preflight_writes_no_first_lock(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start, 0)
            values = iter((0, 0, 3_420_000_000_000))
            code, records = self._run(
                paths,
                clock,
                start,
                monotonic_fn=lambda: next(values),
            )
            self.assertEqual(code, 75)
            self.assertEqual(records[-1]["status"], "BUDGET_EXHAUSTED")
            self.assertEqual(records[-1]["locks_acquired"], 0)
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_monotonic_anchor_is_sampled_before_wall_anchor(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            calls = []

            def monotonic():
                calls.append("monotonic")
                return 0

            def wall():
                calls.append("wall")
                return start + datetime.timedelta(seconds=10)

            clock = FakeClock(start, 0)
            code, _records = self._run(
                paths,
                clock,
                start,
                monotonic_fn=monotonic,
                controller_kwargs={"now_wall_fn": wall},
            )
            self.assertEqual(code, 0)
            self.assertEqual(calls[:2], ["monotonic", "wall"])

    def test_owner_record_tags_local_clock_and_legacy_value_as_audit_only(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 100_000_000)
            code, records = self._run(paths, clock, start)
            self.assertEqual(code, 0)
            acquired = records[0]
            self.assertEqual(acquired["status"], "LOCKS_ACQUIRED")
            self.assertEqual(acquired["clock_domain"], CONTROLLER.CLOCK_DOMAIN)
            self.assertEqual(acquired["monotonic_clock_scope"], "controller-process")
            self.assertEqual(acquired["monotonic_clock_pid"], os.getpid())
            self.assertEqual(
                acquired["task_start_monotonic_ns_source"],
                "controller-local-utc-rebase",
            )
            self.assertEqual(
                acquired["reported_task_start_monotonic_ns"],
                999_999_999_999_999,
            )
            self.assertFalse(
                acquired["reported_task_start_monotonic_ns_control_authority"]
            )
            self.assertNotEqual(
                acquired["task_start_monotonic_ns"],
                acquired["reported_task_start_monotonic_ns"],
            )

    def test_wait_and_emit_exceptions_release_every_owned_lock(self):
        for failure in ("wait", "emit"):
            with self.subTest(failure=failure), tempfile.TemporaryDirectory() as temp:
                paths = self._paths(pathlib.Path(temp))
                start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
                clock = FakeClock(start + datetime.timedelta(seconds=10), 100_000_000)

                def wait(_stdin, _timeout):
                    raise RuntimeError("wait-failure")

                def emit(record):
                    if record.get("status") == "LOCKS_ACQUIRED":
                        raise RuntimeError("emit-failure")

                kwargs = {"emit_fn": emit} if failure == "emit" else {}
                with self.assertRaises(RuntimeError):
                    self._run(
                        paths,
                        clock,
                        start,
                        wait=wait if failure == "wait" else None,
                        controller_kwargs=kwargs,
                    )
                self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_signal_during_acquisition_releases_partial_lock_set(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start, 0)
            handlers = {}
            monotonic_calls = 0

            def set_signal(signum, handler):
                previous = handlers.get(signum, signal.SIG_DFL)
                handlers[signum] = handler
                return previous

            def monotonic():
                nonlocal monotonic_calls
                monotonic_calls += 1
                if monotonic_calls == 4:
                    handlers[signal.SIGTERM](signal.SIGTERM, None)
                return 0

            code, records = self._run(
                paths,
                clock,
                start,
                monotonic_fn=monotonic,
                controller_kwargs={
                    "install_signal_handlers": True,
                    "signal_setter_fn": set_signal,
                },
            )
            self.assertEqual(code, 0)
            self.assertEqual(records[-1]["status"], "LOCKS_RELEASED")
            self.assertEqual(
                records[-1]["reason"], "SIGTERM_DURING_LOCK_ACQUISITION"
            )
            self.assertEqual(records[-1]["released_paths"], [str(paths["locks"][0])])
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_open_failure_never_leaves_an_ownerless_canonical_lock(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)

            def fail_open(_path, _flags, _mode):
                raise OSError("injected-open-failure")

            code, records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={"open_fn": fail_open},
            )
            self.assertEqual(code, 74)
            self.assertEqual(records[-1]["status"], "LOCK_ACQUISITION_DEFECT")
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_link_interruption_after_publication_unwinds_and_reraises(self):
        for interruption in (KeyboardInterrupt, lambda: SystemExit(23)):
            with self.subTest(interruption=interruption), tempfile.TemporaryDirectory() as temp:
                paths = self._paths(pathlib.Path(temp))
                start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
                clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)

                def link_then_interrupt(source, target):
                    os.link(source, target)
                    raise interruption()

                with self.assertRaises((KeyboardInterrupt, SystemExit)):
                    self._run(
                        paths,
                        clock,
                        start,
                        controller_kwargs={"link_fn": link_then_interrupt},
                    )
                self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_transient_release_failure_is_retried_without_ownerless_residue(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            failed = False
            canonical_attempts = []

            def flaky_unlink(path):
                nonlocal failed
                candidate = pathlib.Path(path)
                is_canonical_release = candidate in paths["locks"]
                if is_canonical_release:
                    canonical_attempts.append(candidate)
                if is_canonical_release and not failed:
                    failed = True
                    raise InterruptedError("injected-transient-unlink")
                candidate.unlink()

            code, records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={"unlink_fn": flaky_unlink},
            )
            self.assertEqual(code, 0)
            self.assertEqual(records[-1]["status"], "LOCKS_RELEASED")
            self.assertEqual(
                canonical_attempts,
                [paths["locks"][2], paths["locks"][2], paths["locks"][1], paths["locks"][0]],
            )
            self.assertEqual(
                records[-1]["released_paths"],
                [str(path) for path in reversed(paths["locks"])],
            )
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_unlink_effect_then_exception_is_recognized_as_released(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            injected = False

            def unlink_then_raise(path):
                nonlocal injected
                candidate = pathlib.Path(path)
                candidate.unlink()
                if candidate in paths["locks"] and not injected:
                    injected = True
                    raise InterruptedError("injected-after-unlink")

            code, records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={"unlink_fn": unlink_then_raise},
            )
            self.assertEqual(code, 0)
            self.assertEqual(records[-1]["status"], "LOCKS_RELEASED")
            self.assertEqual(
                records[-1]["released_paths"],
                [str(path) for path in reversed(paths["locks"])],
            )
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_persistent_release_failure_preserves_complete_claim(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)

            def persistent_failure(path):
                candidate = pathlib.Path(path)
                if candidate == paths["locks"][2]:
                    raise OSError("injected-persistent-unlink")
                candidate.unlink()

            code, records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={"unlink_fn": persistent_failure},
            )
            self.assertEqual(code, 74)
            self.assertEqual(records[-1]["status"], "LOCK_RELEASE_FAILED")
            self.assertTrue(paths["locks"][2].is_file())
            owner = json.loads(paths["locks"][2].read_text())
            self.assertEqual(owner["run_id"], "test-run")
            self.assertFalse(paths["locks"][1].exists())
            self.assertFalse(paths["locks"][0].exists())

    def test_publication_loss_or_replacement_never_claims_acquisition(self):
        for variant in ("missing", "replaced"):
            with self.subTest(variant=variant), tempfile.TemporaryDirectory() as temp:
                paths = self._paths(pathlib.Path(temp))
                start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
                clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
                foreign = b'{"foreign":true}\n'

                def link_then_mutate(source, target):
                    os.link(source, target)
                    pathlib.Path(target).unlink()
                    if variant == "replaced":
                        pathlib.Path(target).write_bytes(foreign)

                code, records = self._run(
                    paths,
                    clock,
                    start,
                    controller_kwargs={"link_fn": link_then_mutate},
                )
                self.assertEqual(code, 74)
                self.assertEqual(records[-1]["status"], "LOCK_ACQUISITION_DEFECT")
                self.assertNotIn("LOCKS_ACQUIRED", [record["status"] for record in records])
                if variant == "missing":
                    self.assertFalse(paths["locks"][0].exists())
                else:
                    self.assertEqual(paths["locks"][0].read_bytes(), foreign)
                self.assertFalse(paths["locks"][1].exists())
                self.assertFalse(paths["locks"][2].exists())

    def test_transient_parent_fsync_after_release_is_retried(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            release_started = False
            failed = False

            def mark_unlink(path):
                nonlocal release_started
                candidate = pathlib.Path(path)
                candidate.unlink()
                if candidate in paths["locks"]:
                    release_started = True

            def flaky_fsync(descriptor):
                nonlocal failed
                if release_started and not failed:
                    failed = True
                    raise InterruptedError("injected-parent-fsync")
                os.fsync(descriptor)

            code, records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={"unlink_fn": mark_unlink, "fsync_fn": flaky_fsync},
            )
            self.assertEqual(code, 0)
            self.assertEqual(records[-1]["status"], "LOCKS_RELEASED")
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_collision_rollback_failure_is_not_reported_as_plain_collision(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            paths["locks"][1].mkdir()
            (paths["locks"][1] / "owner.json").write_text('{"foreign":true}\n')
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)

            def fail_first_release(path):
                candidate = pathlib.Path(path)
                if candidate == paths["locks"][0]:
                    raise OSError("persistent-release-failure")
                candidate.unlink()

            code, records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={"unlink_fn": fail_first_release},
            )
            self.assertEqual(code, 74)
            self.assertEqual(records[-1]["status"], "LOCK_RELEASE_FAILED")
            self.assertTrue(paths["locks"][0].is_file())
            self.assertTrue(paths["locks"][1].is_dir())
            self.assertFalse(paths["locks"][2].exists())

    def test_partial_signal_handler_install_restores_the_installed_handler(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            calls = []
            previous_term = object()

            def fail_second_install(signum, handler):
                calls.append((signum, handler))
                if signum == signal.SIGTERM and handler is not previous_term:
                    return previous_term
                if signum == signal.SIGINT:
                    raise RuntimeError("injected-signal-install-failure")
                return signal.SIG_DFL

            with self.assertRaises(RuntimeError):
                self._run(
                    paths,
                    clock,
                    start,
                    controller_kwargs={
                        "install_signal_handlers": True,
                        "signal_setter_fn": fail_second_install,
                    },
                )
            self.assertIn((signal.SIGTERM, previous_term), calls)
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_cleanup_baseexception_cannot_skip_signal_restoration(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            calls = []
            previous = {
                signal.SIGTERM: object(),
                signal.SIGINT: object(),
            }

            def set_signal(signum, handler):
                calls.append((signum, handler))
                return previous[signum]

            def abort_cleanup(path):
                candidate = pathlib.Path(path)
                if candidate in paths["locks"]:
                    raise SystemExit(91)
                candidate.unlink()

            with self.assertRaises(SystemExit) as raised:
                self._run(
                    paths,
                    clock,
                    start,
                    controller_kwargs={
                        "install_signal_handlers": True,
                        "signal_setter_fn": set_signal,
                        "unlink_fn": abort_cleanup,
                    },
                )
            self.assertEqual(raised.exception.code, 91)
            self.assertIn((signal.SIGTERM, previous[signal.SIGTERM]), calls)
            self.assertIn((signal.SIGINT, previous[signal.SIGINT]), calls)

    def test_signal_during_final_publication_is_attributed_and_never_claims_success(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            handlers = {}
            opened = 0

            def set_signal(signum, handler):
                previous = handlers.get(signum, signal.SIG_DFL)
                handlers[signum] = handler
                return previous

            def open_and_signal(path, flags, mode):
                nonlocal opened
                descriptor = os.open(path, flags, mode)
                opened += 1
                if opened == 3:
                    handlers[signal.SIGTERM](signal.SIGTERM, None)
                return descriptor

            code, records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={
                    "install_signal_handlers": True,
                    "signal_setter_fn": set_signal,
                    "open_fn": open_and_signal,
                },
            )
            self.assertEqual(code, 0)
            self.assertNotIn("LOCKS_ACQUIRED", [record["status"] for record in records])
            self.assertEqual(records[-1]["status"], "LOCKS_RELEASED")
            self.assertEqual(
                records[-1]["reason"],
                "SIGTERM_DURING_LOCK_ACQUISITION",
            )
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_signal_during_final_verification_never_claims_readiness(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            handlers = {}
            signaled = False

            def set_signal(signum, handler):
                previous = handlers.get(signum, signal.SIG_DFL)
                handlers[signum] = handler
                return previous

            def open_read_and_signal(path, flags):
                nonlocal signaled
                descriptor = os.open(path, flags)
                if not signaled:
                    signaled = True
                    handlers[signal.SIGTERM](signal.SIGTERM, None)
                return descriptor

            code, records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={
                    "install_signal_handlers": True,
                    "signal_setter_fn": set_signal,
                    "open_read_fn": open_read_and_signal,
                },
            )
            self.assertTrue(signaled)
            self.assertEqual(code, 0)
            self.assertNotIn("LOCKS_ACQUIRED", [record["status"] for record in records])
            self.assertEqual(records[-1]["status"], "LOCKS_RELEASED")
            self.assertEqual(
                records[-1]["reason"],
                "SIGTERM_DURING_LOCK_ACQUISITION",
            )
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_readiness_is_emitted_while_termination_signals_are_blocked(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            handlers = {}
            timeline = []
            previous_mask = frozenset({signal.SIGUSR1})

            def set_signal(signum, handler):
                previous = handlers.get(signum, signal.SIG_DFL)
                handlers[signum] = handler
                return previous

            def mask_signals(how, mask):
                if how == signal.SIG_BLOCK:
                    self.assertEqual(set(mask), {signal.SIGTERM, signal.SIGINT})
                    timeline.append("mask:block")
                    return previous_mask
                self.assertEqual(how, signal.SIG_SETMASK)
                self.assertIs(mask, previous_mask)
                timeline.append("mask:restore")
                return frozenset()

            def emit(record):
                timeline.append("emit:" + record["status"])

            code, _records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={
                    "install_signal_handlers": True,
                    "signal_setter_fn": set_signal,
                    "signal_mask_fn": mask_signals,
                    "emit_fn": emit,
                },
            )
            self.assertEqual(code, 0)
            self.assertEqual(
                timeline,
                [
                    "mask:block",
                    "emit:LOCKS_ACQUIRED",
                    "mask:restore",
                    "emit:LOCKS_RELEASED",
                ],
            )
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_missing_signal_mask_support_fails_closed_before_publication(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            handlers = {}

            def set_signal(signum, handler):
                previous = handlers.get(signum, signal.SIG_DFL)
                handlers[signum] = handler
                return previous

            code, records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={
                    "install_signal_handlers": True,
                    "signal_setter_fn": set_signal,
                    "signal_mask_fn": None,
                },
            )
            self.assertEqual(code, 44)
            self.assertEqual(records[-1]["status"], "REPLAN_REQUIRED")
            self.assertEqual(records[-1]["reason"], "SIGNAL_MASK_UNAVAILABLE")
            self.assertNotIn("LOCKS_ACQUIRED", [record["status"] for record in records])
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_restore_failure_after_observed_signal_emits_one_defect_terminal(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            handlers = {}
            signaled = False
            previous_mask = frozenset({signal.SIGUSR1})

            def set_signal(signum, handler):
                previous = handlers.get(signum, signal.SIG_DFL)
                handlers[signum] = handler
                return previous

            def open_read_and_signal(path, flags):
                nonlocal signaled
                descriptor = os.open(path, flags)
                if not signaled:
                    signaled = True
                    handlers[signal.SIGTERM](signal.SIGTERM, None)
                return descriptor

            def fail_restore(how, mask):
                if how == signal.SIG_BLOCK:
                    return previous_mask
                self.assertEqual(how, signal.SIG_SETMASK)
                self.assertIs(mask, previous_mask)
                raise RuntimeError("injected-mask-restore-failure")

            code, records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={
                    "install_signal_handlers": True,
                    "signal_setter_fn": set_signal,
                    "signal_mask_fn": fail_restore,
                    "open_read_fn": open_read_and_signal,
                },
            )
            self.assertTrue(signaled)
            self.assertEqual(code, 74)
            self.assertEqual(
                [record["status"] for record in records],
                ["LOCK_ACQUISITION_DEFECT"],
            )
            self.assertEqual(records[0]["reason"], "SIGNAL_MASK_RESTORE_FAILED")
            self.assertEqual(records[0]["released"], 3)
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_inherited_blocked_termination_signal_fails_closed_before_readiness(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            handlers = {}
            previous_mask = frozenset({signal.SIGTERM, signal.SIGUSR1})
            restored = False

            def set_signal(signum, handler):
                previous = handlers.get(signum, signal.SIG_DFL)
                handlers[signum] = handler
                return previous

            def mask_signals(how, mask):
                nonlocal restored
                if how == signal.SIG_BLOCK:
                    return previous_mask
                self.assertEqual(how, signal.SIG_SETMASK)
                self.assertIs(mask, previous_mask)
                restored = True
                return frozenset()

            code, records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={
                    "install_signal_handlers": True,
                    "signal_setter_fn": set_signal,
                    "signal_mask_fn": mask_signals,
                },
            )
            self.assertTrue(restored)
            self.assertEqual(code, 74)
            self.assertEqual(
                [record["status"] for record in records],
                ["LOCK_ACQUISITION_DEFECT"],
            )
            self.assertEqual(
                records[0]["reason"],
                "TERMINATION_SIGNAL_ALREADY_BLOCKED",
            )
            self.assertEqual(records[0]["released"], 3)
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_inherited_blocked_signal_restore_failure_emits_only_restore_defect(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            handlers = {}
            previous_mask = frozenset({signal.SIGINT})

            def set_signal(signum, handler):
                previous = handlers.get(signum, signal.SIG_DFL)
                handlers[signum] = handler
                return previous

            def fail_restore(how, mask):
                if how == signal.SIG_BLOCK:
                    return previous_mask
                self.assertEqual(how, signal.SIG_SETMASK)
                self.assertIs(mask, previous_mask)
                raise RuntimeError("injected-inherited-mask-restore-failure")

            code, records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={
                    "install_signal_handlers": True,
                    "signal_setter_fn": set_signal,
                    "signal_mask_fn": fail_restore,
                },
            )
            self.assertEqual(code, 74)
            self.assertEqual(
                [record["status"] for record in records],
                ["LOCK_ACQUISITION_DEFECT"],
            )
            self.assertEqual(records[0]["reason"], "SIGNAL_MASK_RESTORE_FAILED")
            self.assertEqual(records[0]["released"], 3)
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_published_claims_are_complete_regular_files(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            observed = False

            def inspect_then_release(_stdin, _timeout):
                nonlocal observed
                for path in paths["locks"]:
                    mode = path.lstat().st_mode
                    self.assertTrue(stat.S_ISREG(mode))
                    self.assertEqual(mode & 0o777, 0o600)
                    owner = json.loads(path.read_text())
                    self.assertEqual(owner["run_id"], "test-run")
                    self.assertEqual(owner["lock_primitive"], "prepared-file-hardlink-v1")
                observed = True
                return "release"

            code, records = self._run(paths, clock, start, wait=inspect_then_release)
            self.assertEqual(code, 0)
            self.assertTrue(observed)
            self.assertEqual(records[-1]["status"], "LOCKS_RELEASED")
            self.assertTrue(all(not path.exists() for path in paths["locks"]))

    def test_owner_preparation_io_faults_publish_no_canonical_claim(self):
        cases = ("write-zero", "partial-write", "fsync")
        for case in cases:
            with self.subTest(case=case), tempfile.TemporaryDirectory() as temp:
                root = pathlib.Path(temp)
                paths = self._paths(root)
                start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
                clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
                writes = 0

                def failing_write(descriptor, payload):
                    nonlocal writes
                    writes += 1
                    if case == "write-zero":
                        return 0
                    if writes == 1:
                        os.write(descriptor, payload[:1])
                        return 1
                    raise OSError("injected-partial-write-failure")

                def failing_fsync(_descriptor):
                    raise OSError("injected-fsync-failure")

                kwargs = (
                    {"fsync_fn": failing_fsync}
                    if case == "fsync"
                    else {"write_fn": failing_write}
                )
                code, records = self._run(
                    paths,
                    clock,
                    start,
                    controller_kwargs=kwargs,
                )
                self.assertEqual(code, 74)
                self.assertEqual(records[-1]["status"], "LOCK_ACQUISITION_DEFECT")
                self.assertTrue(all(not path.exists() for path in paths["locks"]))
                self.assertFalse(
                    any(".candidate." in path.name for path in root.rglob("*"))
                )
                self.assertNotIn("owner-token", json.dumps(records, sort_keys=True))

    def test_baseexceptions_during_owner_fsync_unwind_and_reraise(self):
        interruptions = (KeyboardInterrupt, lambda: SystemExit(23))
        for interruption in interruptions:
            with self.subTest(interruption=interruption), tempfile.TemporaryDirectory() as temp:
                root = pathlib.Path(temp)
                paths = self._paths(root)
                start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
                clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)

                def interrupt_fsync(_descriptor):
                    raise interruption()

                with self.assertRaises((KeyboardInterrupt, SystemExit)):
                    self._run(
                        paths,
                        clock,
                        start,
                        controller_kwargs={"fsync_fn": interrupt_fsync},
                    )
                self.assertTrue(all(not path.exists() for path in paths["locks"]))
                self.assertFalse(
                    any(".candidate." in path.name for path in root.rglob("*"))
                )

    def test_two_process_collision_preserves_winner_then_sigterm_releases(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            (paths["run_root"] / "holder").mkdir()
            (paths["run_root"] / "contender").mkdir()
            base = {
                "lock_paths": [str(path) for path in paths["locks"]],
                "run_root": str(paths["run_root"]),
                "worktree": str(paths["worktree"]),
                "common": str(paths["common"]),
                "worktree_lock": str(paths["worktree_lock"]),
            }
            holder = None
            contender = None
            try:
                holder = self._spawn_controller_helper({**base, "run_id": "holder"})
                holder_first = self._read_json_line(holder, timeout=5)
                self.assertEqual(holder_first["status"], "LOCKS_ACQUIRED")
                before = [path.read_bytes() for path in paths["locks"]]

                contender = self._spawn_controller_helper(
                    {**base, "run_id": "contender"},
                    stdin=subprocess.DEVNULL,
                )
                contender_out, contender_err = contender.communicate(timeout=5)
                self.assertEqual(contender.returncode, 73, contender_err)
                contender_records = [
                    json.loads(line) for line in contender_out.splitlines() if line.strip()
                ]
                self.assertEqual(contender_records[-1]["status"], "LOCK_COLLISION")
                self.assertEqual([path.read_bytes() for path in paths["locks"]], before)

                holder.send_signal(signal.SIGTERM)
                holder_out, holder_err = holder.communicate(timeout=8)
                self.assertEqual(holder.returncode, 0, holder_err)
                holder_records = [holder_first] + [
                    json.loads(line) for line in holder_out.splitlines() if line.strip()
                ]
                self.assertEqual(holder_records[-1]["status"], "LOCKS_RELEASED")
                self.assertEqual(holder_records[-1]["reason"], "SIGTERM")
                self.assertTrue(all(not path.exists() for path in paths["locks"]))
            finally:
                for process in (contender, holder):
                    if process is not None and process.poll() is None:
                        process.kill()
                        process.communicate(timeout=5)

    def test_injected_fixture_guards_every_write_primitive_and_release_order(self):
        with tempfile.TemporaryDirectory() as temp:
            paths = self._paths(pathlib.Path(temp))
            start = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
            clock = FakeClock(start + datetime.timedelta(seconds=10), 20_000_000)
            root = pathlib.Path(temp).resolve()
            canonical = {path.resolve() for path in CONTROLLER.LOCKS}
            writes = []

            def guard(operation, path):
                resolved = pathlib.Path(path).resolve()
                self.assertNotIn(resolved, canonical)
                self.assertTrue(resolved == root or root in resolved.parents)
                writes.append((operation, str(resolved)))

            def guarded_open(path, flags, mode):
                guard("open", path)
                self.assertTrue(flags & os.O_WRONLY)
                self.assertTrue(flags & os.O_CREAT)
                return os.open(path, flags, mode)

            def guarded_link(source, target):
                guard("link-source", source)
                guard("link-target", target)
                return os.link(source, target)

            def guarded_unlink(path):
                guard("unlink", path)
                return pathlib.Path(path).unlink()

            code, _records = self._run(
                paths,
                clock,
                start,
                controller_kwargs={
                    "open_fn": guarded_open,
                    "link_fn": guarded_link,
                    "unlink_fn": guarded_unlink,
                },
            )
            self.assertEqual(code, 0)
            expected = []
            for path in paths["locks"]:
                digest = hashlib.sha256(
                    ("owner-token\0" + str(path)).encode()
                ).hexdigest()[:24]
                stage = path.with_name(
                    "." + path.name + ".candidate." + str(os.getpid()) + "." + digest
                )
                expected.extend(
                    (
                        ("open", str(stage.resolve())),
                        ("link-source", str(stage.resolve())),
                        ("link-target", str(path.resolve())),
                        ("unlink", str(stage.resolve())),
                    )
                )
            for path in reversed(paths["locks"]):
                expected.append(("unlink", str(path.resolve())))
            self.assertEqual(writes, expected)

    def test_naive_and_future_wall_starts_fail_closed(self):
        with self.assertRaises(CONTROLLER.ScheduleError) as naive:
            CONTROLLER.parse_task_started_at("2026-07-16T01:00:00")
        self.assertEqual(naive.exception.reason, "TASK_START_MUST_BE_TIMEZONE_AWARE")

        now = datetime.datetime(2026, 7, 16, 1, 0, tzinfo=datetime.timezone.utc)
        with self.assertRaises(CONTROLLER.ScheduleError) as future:
            CONTROLLER.build_schedule(
                now + datetime.timedelta(seconds=6),
                now_wall=now,
                now_monotonic_ns=0,
            )
        self.assertEqual(future.exception.reason, "TASK_START_IN_FUTURE")

    def _paths(self, root):
        worktree = root / "worktree"
        common = root / "common.git"
        worktree_git = common / "worktrees" / "candidate"
        run_root = root / "runs"
        run_dir = run_root / "test-run"
        worktree.mkdir()
        worktree_git.mkdir(parents=True)
        run_dir.mkdir(parents=True)
        return {
            "worktree": worktree,
            "common": common,
            "worktree_lock": worktree_git / "loop-writer.lock",
            "run_root": run_root,
            "locks": [root / "global.lock", common / "writer.lock", worktree_git / "loop-writer.lock"],
        }

    def _run(
        self,
        paths,
        clock,
        start,
        wait=None,
        monotonic_fn=None,
        controller_kwargs=None,
    ):
        args = argparse.Namespace(
            run_id="test-run",
            plan_version=1,
            task_started_at=start.isoformat().replace("+00:00", "Z"),
            reported_task_start_monotonic_ns=999_999_999_999_999,
        )
        records = []

        def git_fn(*git_args):
            if git_args[-1] == "--git-common-dir":
                return str(paths["common"])
            if git_args[-1] == "loop-writer.lock":
                return str(paths["worktree_lock"])
            if git_args == ("branch", "--show-current"):
                return "repair/test"
            if git_args[-1] == "HEAD":
                return "a" * 40
            raise AssertionError(git_args)

        kwargs = {
            "lock_paths": paths["locks"],
            "run_root": paths["run_root"],
            "worktree": paths["worktree"],
            "expected_common": paths["common"],
            "expected_worktree_lock": paths["worktree_lock"],
            "git_fn": git_fn,
            "now_wall_fn": clock.now_wall,
            "monotonic_ns_fn": monotonic_fn or clock.monotonic_ns,
            "wait_for_command_fn": wait or (lambda _stdin, _timeout: "release"),
            "process_start_fn": lambda _pid: "Thu Jul 16 03:00:00 2026",
            "token_fn": lambda _bytes: "owner-token",
            "emit_fn": records.append,
            "install_signal_handlers": False,
            "stdin": io.StringIO(),
        }
        kwargs.update(controller_kwargs or {})
        code = CONTROLLER.run_controller(
            args,
            **kwargs,
        )
        return code, records

    def _spawn_controller_helper(self, payload, stdin=subprocess.PIPE):
        environment = os.environ.copy()
        environment["PYTHONDONTWRITEBYTECODE"] = "1"
        return subprocess.Popen(
            [sys.executable, "-B", str(pathlib.Path(__file__)), "--controller-helper", json.dumps(payload)],
            stdin=stdin,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=environment,
        )

    def _read_json_line(self, process, timeout):
        ready, _, _ = select.select([process.stdout], [], [], timeout)
        if not ready:
            process.kill()
            stdout, stderr = process.communicate(timeout=5)
            self.fail("controller helper handshake timeout: " + stdout + stderr)
        line = process.stdout.readline()
        self.assertTrue(line)
        return json.loads(line)


def run_controller_helper(payload):
    start = datetime.datetime.now(datetime.timezone.utc)
    args = argparse.Namespace(
        run_id=payload["run_id"],
        plan_version=1,
        task_started_at=start.isoformat().replace("+00:00", "Z"),
        reported_task_start_monotonic_ns=None,
    )
    common = pathlib.Path(payload["common"])
    worktree_lock = pathlib.Path(payload["worktree_lock"])

    def git_fn(*git_args):
        if git_args[-1] == "--git-common-dir":
            return str(common)
        if git_args[-1] == "loop-writer.lock":
            return str(worktree_lock)
        if git_args == ("branch", "--show-current"):
            return "repair/subprocess"
        if git_args[-1] == "HEAD":
            return "b" * 40
        raise AssertionError(git_args)

    def responsive_wait(stdin, timeout):
        return CONTROLLER.wait_for_command(stdin, min(timeout, 0.1))

    return CONTROLLER.run_controller(
        args,
        lock_paths=[pathlib.Path(path) for path in payload["lock_paths"]],
        run_root=pathlib.Path(payload["run_root"]),
        worktree=pathlib.Path(payload["worktree"]),
        expected_common=common,
        expected_worktree_lock=worktree_lock,
        git_fn=git_fn,
        wait_for_command_fn=responsive_wait,
        process_start_fn=lambda _pid: "Thu Jul 16 03:00:00 2026",
        stdin=sys.stdin,
    )


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--controller-helper":
        raise SystemExit(run_controller_helper(json.loads(sys.argv[2])))
    unittest.main()
