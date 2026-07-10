#!/usr/bin/env bash
set -u

# Claude Code PreToolUse accident guard. It never logs tool input. A valid
# deny/ask response exits 0; an unexpected local failure exits 2 so Claude
# blocks the tool. Claude itself treats hook timeouts as non-blocking, so this
# is defense in depth, not a sandbox or release/security proof.
set +e
output="$(python3 -c '
import json
import os
import posixpath
import re
import shlex
import subprocess
import sys


def decision(kind, reason):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": kind,
            "permissionDecisionReason": reason,
        }
    }))
    raise SystemExit(0)


def deny(reason):
    decision("deny", f"ARDESIA guard: {reason}")


def ask(reason):
    decision("ask", f"ARDESIA guard: {reason}")


try:
    payload = json.load(sys.stdin)
except Exception:
    deny("input hook non valido; operazione bloccata.")

if not isinstance(payload, dict):
    deny("payload hook non valido; operazione bloccata.")

tool = payload.get("tool_name")
tool_input = payload.get("tool_input")
if not isinstance(tool, str) or not isinstance(tool_input, dict):
    deny("campi hook non validi; operazione bloccata.")

project = os.path.realpath(os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd())


def protected_path(value):
    normalized = str(value).strip().replace("\\", "/").lower()
    normalized = posixpath.normpath(normalized)
    normalized = normalized.removeprefix("./")
    name = normalized.rsplit("/", 1)[-1]
    if name.startswith(".env") and not name.endswith(".example"):
        return "secret"
    if name == "package.json":
        return "package"
    guardrails = (
        "/.claude/settings.json",
        "/scripts/guardrails/claude-pretool-safety.sh",
        "/bin/ci/secret_scan.py",
        "/.github/workflows/ci.yml",
    )
    padded = "/" + normalized
    if (
        any(padded.endswith(path) for path in guardrails)
        or "/.claude/agents/" in padded
        or "/.claude/skills/ardesia-regate/" in padded
        or name in {"agents.md", "claude.md", "autopilot.md"}
    ):
        return "guardrail"
    critical = (
        "/circuitsolver.js",
        "/avrbridge.js",
        "/placementengine.js",
        "/simulatorcanvas.jsx",
        "/src/services/api.js",
        "/supabase/functions/_shared/rag.ts",
        "/vite.config.js",
    )
    if any(padded.endswith(path) for path in critical):
        return "critical"
    return None


secret_patterns = (
    re.compile(r"-----BEGIN(?: [A-Z0-9]+)? PRIVATE KEY-----", re.I),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b"),
    re.compile(r"\bgh[pousr]_[0-9A-Za-z]{36,}\b"),
    re.compile(r"\bnpm_[0-9A-Za-z]{30,}\b"),
    re.compile(r"\bsb_secret_[0-9A-Za-z_-]{20,}\b"),
    re.compile(r"\bsk-[0-9A-Za-z_-]{32,}\b"),
    re.compile(r"\beyJ[0-9A-Za-z_-]{10,}\.[0-9A-Za-z_-]{10,}\.[0-9A-Za-z_-]{10,}\b"),
    re.compile(
        r"(?i)(?:^|[^0-9A-Za-z])(?:password|passwd|pwd)\s*[:=]\s*[\"\x27]?"
        r"(?!test\b|example\b|placeholder\b|redacted\b|dummy\b|changeme\b)"
        r"[0-9A-Za-z_!@#$%^&*+=-]{8,}"
    ),
    re.compile(
        r"(?i)(?:^|[^0-9A-Za-z])(?:[0-9A-Za-z]+[_-])*"
        r"(?:service[ _-]*role(?:[ _-]*key)?|private[ _-]*key|"
        r"api[ _-]*key|access[ _-]*token|client[ _-]*secret|password)"
        r"\s*[:=]\s*[\"\x27]?"
        r"(?!test\b|example\b|placeholder\b|redacted\b|dummy\b|"
        r"changeme\b|your[_-])[0-9A-Za-z_+/=-]{20,}"
    ),
)


def contains_secret_material(values):
    text = "\n".join(str(value) for value in values if value is not None)
    return any(pattern.search(text) for pattern in secret_patterns)


def sensitive_query(value):
    return bool(re.search(
        r"(?i)(?:api[ _.-]*key|service[ _.-]*role|private[ _.-]*key|"
        r"access[ _.-]*token|client[ _.-]*secret|password|begin.*private.*key)",
        str(value),
    ))


def local_file_risk(value, cwd):
    if not value or not isinstance(value, str) or "\n" in value or value.startswith("-"):
        return None
    expanded = os.path.expanduser(value)
    path = os.path.realpath(expanded if os.path.isabs(expanded) else os.path.join(cwd or project, expanded))
    if protected_path(path) == "secret":
        return "secret"
    if not os.path.isfile(path):
        return None
    try:
        if os.path.getsize(path) > 5 * 1024 * 1024:
            return "oversize"
        with open(path, "rb") as handle:
            text = handle.read().decode("utf-8", errors="ignore")
    except OSError:
        return "unknown"
    return "secret" if contains_secret_material([text]) else None


def current_branch(target):
    if not target:
        return None
    try:
        result = subprocess.run(
            ["git", "-C", target, "branch", "--show-current"],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=2,
            check=False,
        )
    except Exception:
        return None
    branch = result.stdout.strip()
    return branch if result.returncode == 0 and branch else None


def split_segments(tokens):
    segments = []
    current = []
    for token in tokens:
        if re.fullmatch(r"[;&|(){}\n]+", token):
            if current:
                segments.append(current)
                current = []
        else:
            current.append(token)
    if current:
        segments.append(current)
    return segments


def executable_index(segment):
    index = 0
    wrappers = {"!", "builtin", "command", "do", "elif", "else", "env", "exec", "if", "nohup", "sudo", "then", "time", "until", "while"}
    wrapper_values = {
        "env": {"-u", "--unset", "-C", "--chdir", "-S", "--split-string"},
        "sudo": {"-C", "--close-from", "-D", "--chdir", "-g", "--group", "-h", "--host", "-p", "--prompt", "-R", "--chroot", "-r", "--role", "-t", "--type", "-u", "--user", "-T", "--command-timeout"},
        "time": {"-f", "--format", "-o", "--output"},
    }
    while index < len(segment):
        token = segment[index]
        base = os.path.basename(token).lower()
        if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*=.*", token):
            index += 1
            continue
        if base in wrappers:
            index += 1
            while index < len(segment):
                option = segment[index]
                if option == "--":
                    index += 1
                    break
                if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*=.*", option):
                    index += 1
                elif option in wrapper_values.get(base, set()):
                    index += 2
                elif any(
                    option.startswith(prefix + "=")
                    for prefix in wrapper_values.get(base, set())
                    if prefix.startswith("--")
                ):
                    index += 1
                elif option.startswith("-"):
                    index += 1
                else:
                    break
            continue
        return index
    return None


def git_invocation(args):
    index = 0
    options_with_value = {"-C", "-c", "--config-env", "--git-dir", "--work-tree", "--namespace"}
    while index < len(args):
        token = args[index]
        if token in options_with_value:
            index += 2
        elif token.startswith(("--git-dir=", "--work-tree=", "--namespace=")):
            index += 1
        elif token.startswith("-"):
            index += 1
        else:
            return token.lower(), args[index + 1:]
    return "", []


def short_flag(token, letter):
    return token.startswith("-") and not token.startswith("--") and letter in token[1:]


def long_option(token, full):
    name = token.split("=", 1)[0]
    return name.startswith("--") and len(name) >= 4 and full.startswith(name)


def git_target(args, shell_cwd):
    target = shell_cwd
    index = 0
    while index < len(args):
        token = args[index]
        if token == "-C":
            if index + 1 >= len(args):
                return None
            value = args[index + 1]
            if "$" in value or value in {"", "-"}:
                return None
            expanded = os.path.expanduser(value)
            target = os.path.realpath(expanded if os.path.isabs(expanded) else os.path.join(target or project, expanded))
            index += 2
            continue
        if token.startswith("-C") and token != "-C":
            value = token[2:]
            if "$" in value or value in {"", "-"}:
                return None
            expanded = os.path.expanduser(value)
            target = os.path.realpath(expanded if os.path.isabs(expanded) else os.path.join(target or project, expanded))
            index += 1
            continue
        if token in {"--git-dir", "--work-tree", "--namespace"} or token.startswith(("--git-dir=", "--work-tree=", "--namespace=")):
            return None
        if token in {"-c", "--config-env"}:
            index += 2
            continue
        if token.startswith(("-c", "--config-env=")):
            index += 1
            continue
        if token.startswith("-"):
            index += 1
            continue
        break
    return target


def handle_git(args, shell_cwd):
    for index, arg in enumerate(args):
        lowered_arg = arg.lower()
        previous = args[index - 1].lower() if index else ""
        temporary_config = lowered_arg if previous in {"-c", "--config-env"} else ""
        if lowered_arg.startswith("-c") and lowered_arg != "-c":
            temporary_config = lowered_arg[2:]
        if lowered_arg.startswith("--config-env="):
            temporary_config = lowered_arg.removeprefix("--config-env=")
        if temporary_config.startswith("core.hookspath="):
            deny("override temporaneo di core.hooksPath vietato.")
        if temporary_config.startswith("alias."):
            deny("alias Git temporaneo può eludere i guardrail; operazione vietata.")
        if temporary_config.startswith(("include.path=", "includeif.")):
            deny("include Git temporaneo può eludere i guardrail; operazione vietata.")

    subcommand, subargs = git_invocation(args)
    lowered = [arg.lower() for arg in subargs]
    git_read_candidates = list(subargs)
    git_read_candidates.extend(arg.split(":", 1)[1] for arg in subargs if ":" in arg)
    if subcommand in {"blame", "diff", "grep", "log", "show"} and any(
        protected_path(arg) == "secret" for arg in git_read_candidates
    ):
        deny("lettura Git di file .env/segreto vietata per evitare log sensibili.")

    if subcommand == "push":
        dry_run = any(arg == "--dry-run" or long_option(arg, "--dry-run") or short_flag(arg, "n") for arg in lowered)
        if dry_run:
            return
        branch = current_branch(git_target(args, shell_cwd))
        if branch is None:
            deny("branch corrente non determinabile; push bloccato.")
        if branch.lower() in {"main", "master"}:
            deny("push dalla branch main/master vietato.")
        if any(
            long_option(arg, "--force")
            or long_option(arg, "--force-with-lease")
            or long_option(arg, "--mirror")
            or long_option(arg, "--all")
            or short_flag(arg, "f")
            for arg in lowered
        ):
            deny("force/all/mirror push vietato.")

        option_values = {"--repo", "--receive-pack", "--exec", "--push-option", "-o"}
        positional = []
        repo_option = False
        index = 0
        while index < len(lowered):
            arg = lowered[index]
            if arg == "--":
                positional.extend(lowered[index + 1:])
                break
            if arg in option_values:
                repo_option = repo_option or arg == "--repo"
                index += 2
                continue
            if arg.startswith("--repo="):
                repo_option = True
                index += 1
                continue
            if arg.startswith("-"):
                index += 1
                continue
            positional.append(arg)
            index += 1

        if any(arg.startswith("+") for arg in positional):
            deny("refspec forzata vietata.")
        if any(arg in {"--no-verify"} or long_option(arg, "--no-verify") for arg in lowered):
            deny("bypass hook di push vietato.")
        if any(arg == "--prune" or long_option(arg, "--prune") for arg in lowered):
            ask("push --prune può cancellare riferimenti remoti; serve conferma Andrea.")
        deleting = any(arg == "-d" or long_option(arg, "--delete") for arg in lowered)
        if deleting:
            refs = positional[1:] if positional and not repo_option else positional
            if any(ref.lstrip("+") in {"main", "master", "refs/heads/main", "refs/heads/master"} for ref in refs):
                deny("cancellazione/push diretto di main/master vietato.")
            ask("push --delete modifica il remoto; serve conferma Andrea.")

        if len(positional) >= 2:
            refspecs = positional[1:]
        elif len(positional) == 1 and (repo_option or ":" in positional[0]):
            refspecs = positional
        else:
            refspecs = []
        if not refspecs:
            ask("push senza refspec esplicita: destinazione remota non provata; serve conferma Andrea.")
        for refspec in refspecs:
            if refspec == ":" or "*" in refspec:
                deny("refspec matching/wildcard può includere main/master; vietata.")
            destination = refspec.split(":", 1)[-1].lstrip("+")
            if destination in {"main", "master", "refs/heads/main", "refs/heads/master"}:
                deny("push diretto su main/master vietato.")
            if refspec.startswith(":"):
                ask("refspec push cancella un riferimento remoto; serve conferma Andrea.")
            if ":" not in refspec and refspec not in {branch.lower(), f"refs/heads/{branch.lower()}"} and not refspec.startswith("refs/tags/"):
                ask("refspec push non dimostrata equivalente alla branch corrente; serve conferma Andrea.")

    elif subcommand == "reset" and any(long_option(arg, "--hard") for arg in lowered):
        deny("git reset --hard vietato.")
    elif subcommand == "reset":
        ask("git reset modifica indice o riferimenti; serve conferma Andrea.")
    elif subcommand == "clean":
        dry_run = any(arg == "-n" or long_option(arg, "--dry-run") or short_flag(arg, "n") for arg in lowered)
        forced = any(long_option(arg, "--force") or short_flag(arg, "f") for arg in lowered)
        if forced and not dry_run:
            deny("git clean distruttivo vietato.")
    elif subcommand == "add":
        paths = [arg for arg in lowered if not arg.startswith("-") and arg != "--"]
        if any(long_option(arg, "--pathspec-from-file") or long_option(arg, "--pathspec-file-nul") for arg in lowered):
            deny("pathspec Git da file/stdin non prova file espliciti; operazione vietata.")
        stage_candidates = [re.sub(r"^:\([^)]*\)", "", path).removeprefix(":/") for path in paths]
        if any(protected_path(path) == "secret" for path in stage_candidates):
            deny("staging di file .env/segreto vietato.")
        exclude_only = bool(paths) and all(arg.startswith((":(exclude)", ":!", ":^")) for arg in paths)
        global_path = any(
            arg in {".", "./", ":/", ":(top)", "*", "**"}
            or any(char in arg for char in "*?[]")
            or (arg.startswith(":(") and ("top" in arg or "glob" in arg))
            for arg in paths
        )
        all_flag = any(arg == "-a" or long_option(arg, "--all") or short_flag(arg, "a") for arg in lowered)
        update_without_paths = any(arg in {"-u", "--update"} for arg in lowered) and not paths
        if global_path or exclude_only or all_flag or update_without_paths:
            deny("git add globale vietato; aggiungere file espliciti.")
    elif subcommand == "commit" and any(
        long_option(arg, "--no-verify") or short_flag(arg, "n") for arg in lowered
    ):
        deny("bypass hook di commit vietato.")
    elif subcommand == "commit" and any(
        long_option(arg, "--all") or short_flag(arg, "a") for arg in lowered
    ):
        deny("git commit -a può includere file non revisionati; staging esplicito obbligatorio.")
    elif subcommand == "commit" and any(
        protected_path(re.sub(r"^:\([^)]*\)", "", arg).removeprefix(":/")) == "secret"
        for arg in subargs
    ):
        deny("commit con pathspec .env/segreto vietato.")
    elif subcommand == "commit" and any(
        long_option(arg, "--pathspec-from-file") or long_option(arg, "--pathspec-file-nul")
        for arg in lowered
    ):
        deny("pathspec commit da file/stdin non prova file espliciti; operazione vietata.")
    elif subcommand == "apply" and any(arg in {"--check", "--stat", "--numstat", "--summary"} for arg in lowered):
        return
    elif subcommand == "config" and any(arg in {"--get", "--get-all", "--get-regexp", "--list", "-l", "get", "list"} for arg in lowered):
        return
    elif subcommand in {"apply", "am", "merge", "rebase", "cherry-pick", "revert", "stash", "restore", "checkout", "switch", "config"}:
        ask("operazione Git mutante può sovrascrivere lavoro o configurazione; serve conferma Andrea.")
    elif subcommand == "worktree" and any(arg in {"remove", "move", "prune"} for arg in lowered):
        ask("mutazione/rimozione worktree; serve conferma Andrea.")
    elif subcommand == "branch" and any(arg in {"-d", "-D", "--delete"} or short_flag(arg, "d") for arg in subargs):
        ask("cancellazione branch; serve conferma Andrea.")
    elif subcommand == "remote" and any(arg in {"add", "remove", "rename", "set-head", "set-url", "update"} for arg in lowered):
        ask("configurazione/rimozione remote Git; serve conferma Andrea.")
    elif subcommand == "fetch" and any(arg == "--update-head-ok" or long_option(arg, "--update-head-ok") for arg in lowered):
        ask("fetch può aggiornare la branch corrente; serve conferma Andrea.")
    elif subcommand not in {
        "add", "annotate", "blame", "branch", "cat-file", "check-attr",
        "check-ignore", "check-ref-format", "clean", "commit", "describe",
        "diff", "diff-tree", "fetch", "for-each-ref", "grep", "hash-object",
        "help", "log", "ls-files", "ls-remote", "ls-tree", "merge-base",
        "name-rev", "notes", "push", "remote", "rev-list", "rev-parse",
        "shortlog", "show", "show-ref", "status", "symbolic-ref", "version",
        "worktree",
    }:
        ask("sottocomando Git mutante o alias non classificato; serve conferma Andrea.")


def handle_rm(args):
    lowered = [arg.lower() for arg in args]
    recursive = any(arg == "--recursive" or short_flag(arg, "r") for arg in lowered)
    forced = any(arg == "--force" or short_flag(arg, "f") for arg in lowered)
    if recursive and forced:
        deny("rm ricorsivo forzato vietato.")
    ask("cancellazione filesystem; serve conferma Andrea.")


def handle_gh(args):
    lowered = [arg.lower() for arg in args]
    if lowered in (["--help"], ["-h"], ["pr", "merge", "--help"], ["pr", "merge", "-h"]):
        return
    if any(lowered[pos:pos + 2] == ["pr", "merge"] for pos in range(len(lowered) - 1)):
        deny("merge PR automatico vietato.")
    if lowered and lowered[0] == "api":
        method = "GET"
        for pos, arg in enumerate(args[:-1]):
            if arg.lower() in {"-x", "--method"}:
                method = args[pos + 1].upper()
        if any(arg.lower().startswith(("--method=",)) for arg in args):
            method = next(arg.split("=", 1)[1].upper() for arg in args if arg.lower().startswith("--method="))
        fields = any(arg in {"-f", "-F", "--field", "--raw-field"} or arg.startswith(("--field=", "--raw-field=")) for arg in args)
        merge_endpoint = any(arg.lower().rstrip("/").endswith("/merge") for arg in args)
        graphql_merge = any("mergepullrequest" in arg.lower() for arg in args)
        if merge_endpoint and (method != "GET" or fields) or graphql_merge:
            deny("merge PR via gh api vietato.")
        if method not in {"GET", "HEAD"} or fields:
            ask("gh api mutante; serve conferma Andrea.")
        return
    safe_top = {"browse", "help", "issue", "pr", "release", "repo", "run", "search", "status", "workflow"}
    if not lowered or lowered[0] not in safe_top:
        ask("sottocomando gh o alias non classificato; serve conferma Andrea.")
    external_actions = {"cancel", "close", "comment", "create", "delete", "edit", "ready", "reopen", "rerun", "review", "run"}
    if any(arg in external_actions for arg in lowered[1:]):
        ask("azione GitHub esterna/mutante; serve conferma Andrea.")


def handle_bash(command):
    if contains_secret_material([command]):
        deny("materiale simile a un segreto nel comando; usare riferimenti env senza valori.")
    if re.search(r"\bGIT_CONFIG_(?:COUNT|KEY_|VALUE_|SYSTEM|GLOBAL|NOSYSTEM)\b", command, re.I):
        deny("override GIT_CONFIG può eludere i hook; operazione vietata.")
    if re.search(r"(?:^|[;&|\s])GIT_(?:DIR|WORK_TREE)=", command):
        ask("target Git da variabile ambiente non classificabile; serve conferma Andrea.")
    if "${" in command or re.search(r"\$IFS\b", command, re.I):
        ask("espansione shell dinamica non classificabile; serve conferma Andrea.")
    try:
        lexer = shlex.shlex(command, posix=True, punctuation_chars=";&|<>(){}\n")
        lexer.whitespace = " \t\r"
        lexer.whitespace_split = True
        lexer.commenters = ""
        tokens = list(lexer)
    except (TypeError, ValueError):
        deny("comando non analizzabile in sicurezza.")

    if "$(" in command or "`" in command or re.search(r"(^|[;&|\s])eval(?:\s|$)", command):
        ask("shell dinamica non classificabile automaticamente; serve conferma Andrea.")

    segments = split_segments(tokens)
    shell_cwd = project
    for segment in segments:
        if not segment:
            continue
        segment_bases = {os.path.basename(token).lower() for token in segment}
        if "env" in segment_bases and any(
            token == "-S" or token == "--split-string" or token.startswith("--split-string=")
            for token in segment
        ):
            ask("env split-string esegue una command line annidata; serve conferma Andrea.")
        index = executable_index(segment)
        if index is None:
            if segment and os.path.basename(segment[0]).lower() == "env":
                deny("dump ambiente completo vietato per evitare segreti nei log.")
            continue
        executable = "." if segment[index] == "." else os.path.basename(segment[index]).lower()
        args = segment[index + 1:]
        lowered = [arg.lower() for arg in args]

        if executable.startswith("$"):
            ask("comando costruito da variabile shell; serve conferma Andrea.")

        if executable == "printenv" or (executable == "set" and not args) or (
            executable in {"declare", "export", "typeset"} and "-p" in lowered
        ):
            deny("dump variabili ambiente/shell vietato per evitare segreti nei log.")

        if executable == "cd":
            paths = [arg for arg in args if not arg.startswith("-")]
            target = paths[-1] if paths else None
            if not target or "$" in target or target == "-":
                shell_cwd = None
            else:
                expanded = os.path.expanduser(target)
                shell_cwd = os.path.realpath(expanded if os.path.isabs(expanded) else os.path.join(shell_cwd or project, expanded))
            continue

        if lowered in (["--help"], ["--version"]):
            continue

        if executable == "git":
            handle_git(args, shell_cwd)
        elif executable == "gh":
            handle_gh(args)
        elif executable == "rm":
            handle_rm(args)
        elif executable in {"source", "."}:
            ask("source/dot esegue shell non ispezionata; serve conferma Andrea.")
        elif executable in {"busybox", "toybox"} and lowered and lowered[0] == "rm":
            handle_rm(args[1:])
        elif executable in {"find", "xargs"}:
            if "rm" in lowered:
                rm_index = lowered.index("rm")
                nested = args[rm_index + 1:]
                nested_lower = lowered[rm_index + 1:]
                recursive = any(arg == "--recursive" or short_flag(arg, "r") for arg in nested_lower)
                forced = any(arg == "--force" or short_flag(arg, "f") for arg in nested_lower)
                if recursive and forced:
                    deny("rm ricorsivo forzato annidato vietato.")
            if executable == "xargs" or any(arg in {"-delete", "-exec", "-execdir", "-ok", "-okdir"} for arg in lowered):
                ask("comando dinamico/cancellazione filesystem; serve conferma Andrea.")

        readers = {"awk", "base64", "bat", "cat", "cut", "egrep", "fgrep", "grep", "head", "hexdump", "jq", "less", "more", "od", "rg", "sed", "sort", "strings", "tail", "uniq", "xxd", "yq"}
        if executable in readers:
            read_candidates = list(args)
            read_candidates.extend(arg.split("=", 1)[1] for arg in args if "=" in arg)
            if any(protected_path(arg) == "secret" for arg in read_candidates):
                deny("lettura shell di file .env/segreto vietata per evitare log sensibili.")
            risks = {local_file_risk(arg, shell_cwd) for arg in read_candidates}
            if "secret" in risks:
                deny("file con materiale simile a credenziale non stampabile nei log.")
            if risks & {"oversize", "unknown"}:
                ask("file non scansionabile in sicurezza prima della lettura; serve conferma Andrea.")
            if sensitive_query(" ".join(args)):
                ask("ricerca sensibile può stampare credenziali; usare solo nomi file/redazione o conferma Andrea.")

        if executable in {"psql", "mysql", "sqlite3", "duckdb"} and re.search(r"\bdrop\s+table\b", command, re.I):
            deny("DROP TABLE vietato senza decisione umana esplicita.")

        publish = (
            executable in {"npm", "pnpm", "yarn", "bun"}
            and "publish" in lowered
        )
        production = (
            (executable == "vercel" and any(arg in {"--prod", "--production"} for arg in lowered))
            or (
                executable == "supabase"
                and any(
                    lowered[pos:pos + width] in (
                        ["functions", "deploy"],
                        ["db", "push"],
                        ["db", "reset"],
                        ["migration", "up"],
                        ["secrets", "set"],
                    )
                    for pos in range(len(lowered))
                    for width in (2,)
                )
            )
        )
        if publish or production:
            ask("azione esterna/production; serve conferma Andrea.")

        package_runner = (
            executable in {"npx", "bunx"}
            or (executable in {"pnpm", "yarn"} and lowered and lowered[0] in {"dlx", "exec"})
        )
        if package_runner:
            ask("package runner può scaricare/eseguire codice o fare deploy; serve conferma Andrea.")

        package_mutations = {
            "add", "ci", "exec", "i", "import", "install", "link", "pack",
            "pkg", "publish", "remove", "rm", "set", "uninstall", "unlink",
            "up", "update", "upgrade", "x",
        }
        if executable in {"npm", "pnpm", "yarn", "bun"} and any(arg in package_mutations for arg in lowered):
            ask("package manager mutante può cambiare dipendenze o pubblicare; serve conferma Andrea.")
        if executable in {"npm", "pnpm", "yarn", "bun"} and any(arg in {"deploy", "publish", "release"} for arg in lowered):
            ask("script package esterno/release; serve conferma Andrea.")

        download_targets = []
        if executable in {"curl", "wget"}:
            for pos, arg in enumerate(args):
                if arg in {"-o", "--output", "-O"} and pos + 1 < len(args):
                    download_targets.append(args[pos + 1])
                elif arg.startswith("--output="):
                    download_targets.append(arg.split("=", 1)[1])
                elif arg.startswith("-o") and len(arg) > 2:
                    download_targets.append(arg[2:])
                elif executable == "wget" and arg.startswith("-O") and len(arg) > 2:
                    download_targets.append(arg[2:])
            if any(arg in {"-O", "--remote-name"} for arg in args):
                ask("download con nome remoto scrive su disco; serve conferma Andrea.")
        for target in download_targets:
            kind = protected_path(target)
            if kind == "secret":
                deny("download verso file .env/segreto vietato.")
            if kind in {"package", "critical", "guardrail"}:
                ask("download verso file protetto; serve conferma Andrea.")
        if download_targets:
            ask("download verso filesystem; serve conferma Andrea.")
        if executable == "wget" and not any(arg in {"--spider", "-qO-"} for arg in args):
            ask("wget scrive su disco per default; serve conferma Andrea.")

        redirect_targets = [
            segment[pos + 1]
            for pos, token in enumerate(segment[:-1])
            if re.fullmatch(r"[<>&]+", token) and (">" in token or token == "<>")
        ]
        redirect_targets = [target for target in redirect_targets if target not in {"/dev/null", "/dev/stdout", "/dev/stderr"}]
        for target in redirect_targets:
            kind = protected_path(target)
            if kind == "secret":
                deny("scrittura shell verso file .env/segreto vietata.")
            if kind == "package":
                ask("scrittura shell verso package.json; serve conferma Andrea.")
            if kind == "critical":
                ask("scrittura shell verso file critico; servono graph/regate e autorizzazione dedicata.")
            if kind == "guardrail":
                ask("scrittura shell verso governance/guardrail; serve conferma Andrea.")
        if redirect_targets:
            ask("scrittura shell tramite redirezione; usare Edit/Write o chiedere conferma.")

        mutators = {"touch", "tee", "truncate", "cp", "mv", "ln", "unlink", "install", "mkdir", "chmod", "chown", "dd", "rsync", "patch", "apply_patch", "busybox", "toybox"}
        inplace = (
            executable == "sed" and any(arg == "--in-place" or arg.startswith("-i") for arg in lowered)
        ) or (
            executable == "perl" and any(arg.startswith("-") and "i" in arg[1:] for arg in lowered)
        )
        interpreter = executable in {"python", "python3", "node", "ruby", "perl", "bash", "sh", "zsh"}
        inline_interpreter = interpreter and (
            any(arg in {"-", "-c", "-e", "-p", "--eval", "--print"} for arg in lowered)
            or any(
                (arg.startswith(("-c", "-e", "-p")) and len(arg) > 2)
                or arg.startswith(("--eval=", "--print="))
                for arg in lowered
            )
            or not args
            or any(token in {"<", "<<", "<<-", "<<<"} for token in segment)
        )
        command_launcher = executable in {"nice", "timeout", "stdbuf", "ionice", "chrt"}
        if executable in mutators or inplace or inline_interpreter or command_launcher:
            path_candidates = list(args)
            path_candidates.extend(arg.split("=", 1)[1] for arg in args if "=" in arg)
            kinds = {protected_path(arg) for arg in path_candidates}
            if "secret" in kinds:
                deny("scrittura shell verso file .env/segreto vietata.")
            if "package" in kinds:
                ask("mutazione shell di package.json; serve conferma Andrea.")
            if "critical" in kinds:
                ask("mutazione shell di file critico; servono graph/regate e autorizzazione dedicata.")
            if "guardrail" in kinds:
                ask("mutazione shell di governance/guardrail; serve conferma Andrea.")
            ask("comando shell mutante/non ispezionabile; usare Edit/Write o chiedere conferma.")


if tool == "Bash":
    command = tool_input.get("command")
    if not isinstance(command, str):
        deny("comando Bash mancante o non valido.")
    handle_bash(command)

elif tool in {"Edit", "Write", "NotebookEdit"}:
    candidate_paths = (
        tool_input.get("file_path"),
        tool_input.get("path"),
        tool_input.get("notebook_path"),
    )
    for candidate in candidate_paths:
        resolved = None
        if candidate:
            expanded = os.path.expanduser(str(candidate))
            resolved = os.path.realpath(expanded if os.path.isabs(expanded) else os.path.join(project, expanded))
        kind = protected_path(candidate) if candidate else None
        kind = kind or (protected_path(resolved) if resolved else None)
        if kind == "secret":
            deny("file .env/segreto non modificabile dal modello.")
        if kind == "package":
            ask("package.json può introdurre dipendenze; serve conferma Andrea.")
        if kind == "critical":
            ask("file critico; richiede graph/regate e autorizzazione dedicata.")
        if kind == "guardrail":
            ask("governance/guardrail; serve conferma Andrea e review dedicata.")

    new_content = (
        tool_input.get("content"),
        tool_input.get("new_string"),
        tool_input.get("new_source"),
        tool_input.get("cell_source"),
    )
    if contains_secret_material(new_content):
        deny("contenuto simile a credenziale/chiave privata; non scrivere segreti nel repository.")

elif tool in {"Read", "Grep", "Glob"}:
    candidate_paths = (
        tool_input.get("file_path"),
        tool_input.get("path"),
    )
    resolved_paths = []
    for candidate in candidate_paths:
        if candidate:
            expanded = os.path.expanduser(str(candidate))
            resolved_paths.append(os.path.realpath(expanded if os.path.isabs(expanded) else os.path.join(project, expanded)))
    if any(protected_path(candidate) == "secret" for candidate in (*candidate_paths, *resolved_paths) if candidate):
        deny("lettura di file .env/segreto vietata per evitare esposizione nei log.")
    if tool == "Read":
        risks = {local_file_risk(candidate, project) for candidate in candidate_paths if candidate}
        if "secret" in risks:
            deny("file con materiale simile a credenziale non stampabile nei log.")
        if risks & {"oversize", "unknown"}:
            ask("file non scansionabile in sicurezza prima della lettura; serve conferma Andrea.")
    pattern = tool_input.get("pattern")
    glob_filter = tool_input.get("glob")
    if any(
        value and re.search(r"(?i)(?:^|[/\\])\.env(?:[.*?]|$)", str(value))
        for value in (pattern, glob_filter)
    ):
        deny("pattern rivolto a file .env/segreto vietato.")
    if tool == "Grep" and pattern and sensitive_query(pattern):
        output_mode = str(tool_input.get("output_mode", "content"))
        if output_mode != "files_with_matches":
            ask("Grep sensibile può stampare credenziali; usare output_mode files_with_matches o conferma Andrea.")
')"
status=$?
set -e

if [[ $status -ne 0 ]]; then
  printf '%s\n' 'ARDESIA guard: errore interno; operazione bloccata.' >&2
  exit 2
fi

if [[ -n "$output" ]]; then
  printf '%s\n' "$output"
fi
