#!/usr/bin/env python3
"""Check PR traceability metadata, never execution, approval or merge authority.

The GitHub event is data. Commands in the body are not executed and neither the
body nor its field values are echoed in diagnostics. Current mode reads one
bounded GitHub response and pins it to the event head. Its assurance ends at that
fetch: CI/reviews remain separate and a later edit requires another check.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
from urllib.request import HTTPRedirectHandler, Request, build_opener


MAX_BODY_CHARACTERS = 65536
MAX_EVENT_BYTES = 2 * 1024 * 1024
MAX_RESPONSE_BYTES = 1024 * 1024
GITHUB_TIMEOUT_SECONDS = 10
LOGIN_PATTERN = r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?"


class ContractError(ValueError):
    pass


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ContractError("duplicate JSON key")
        result[key] = value
    return result


def fields(value, expected, where):
    if not isinstance(value, dict) or set(value) != set(expected):
        raise ContractError(where + ": missing or unsupported fields")


def text(value, where):
    if not isinstance(value, str) or not value.strip():
        raise ContractError(where + ": nonempty text required")
    if value.strip().casefold() in {"todo", "tbd", "changeme", "owner", "inserire", "da compilare", "..."}:
        raise ContractError(where + ": replace the placeholder")


def validate(body, number):
    if not isinstance(body, str) or len(body) > MAX_BODY_CHARACTERS:
        raise ContractError("body: bounded text required")
    blocks = re.findall(r"<!--\s*ardesia-pr\s*\n(.*?)-->", body, re.DOTALL)
    if len(blocks) != 1:
        raise ContractError("exactly one ardesia-pr metadata block required")
    try:
        value = json.loads(blocks[0], object_pairs_hook=unique_object)
    except (ValueError, RecursionError) as error:
        raise ContractError("invalid or ambiguous metadata JSON") from error
    fields(value, {"version", "owner", "acceptance", "verification", "depends_on", "risk"}, "contract")
    if type(value["version"]) is not int or value["version"] != 1:
        raise ContractError("unsupported contract version")
    if not isinstance(value["owner"], str):
        raise ContractError("owner: GitHub login required")
    owner = value["owner"][1:] if value["owner"].startswith("@") else value["owner"]
    text(owner, "owner")
    if not re.fullmatch(LOGIN_PATTERN, owner) or "--" in owner:
        raise ContractError("owner: GitHub login required")
    text(value["acceptance"], "acceptance")
    text(value["risk"], "risk")
    if not isinstance(value["verification"], list) or not value["verification"]:
        raise ContractError("verification: at least one command and evidence reference required")
    for item in value["verification"]:
        fields(item, {"command", "evidence"}, "verification")
        text(item["command"], "verification.command")
        text(item["evidence"], "verification.evidence")
    if not isinstance(value["depends_on"], list):
        raise ContractError("depends_on: explicit list required, including when empty")
    seen = set()
    for item in value["depends_on"]:
        fields(item, {"pr", "reason"}, "depends_on")
        dependency = item["pr"]
        if type(dependency) is not int or dependency <= 0 or dependency == number or dependency in seen:
            raise ContractError("depends_on: positive, unique, non-self PR numbers required")
        text(item["reason"], "depends_on.reason")
        seen.add(dependency)
    return value


def event_pull_request(event):
    if not isinstance(event, dict) or not isinstance(event.get("pull_request"), dict):
        raise ContractError("pull_request event required")
    pr = event["pull_request"]
    number = pr.get("number")
    if type(number) is not int or number <= 0:
        raise ContractError("positive PR number required")
    return pr


def from_event(event):
    """Validate an offline event snapshot; this does not establish freshness."""
    pr = event_pull_request(event)
    number = pr["number"]
    return validate(pr.get("body"), number)


class NoRedirects(HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, newurl):
        # Do not forward the authorization header to any redirected destination.
        raise ContractError("GitHub API redirect refused")


def current_pull_request(number, environ, opener=None):
    repository = environ.get("GITHUB_REPOSITORY", "")
    parts = repository.split("/")
    if (len(parts) != 2 or not re.fullmatch(LOGIN_PATTERN, parts[0]) or "--" in parts[0]
            or not re.fullmatch(r"[A-Za-z0-9_.-]{1,100}", parts[1])
            or parts[1] in {".", ".."}):
        raise ContractError("validated GITHUB_REPOSITORY required")
    if environ.get("GITHUB_API_URL", "https://api.github.com") not in {
        "https://api.github.com", "https://api.github.com/",
    }:
        raise ContractError("supported GitHub API origin required")
    token = environ.get("GITHUB_TOKEN", "")
    if not token or len(token) > 8192 or any(c in token for c in "\r\n"):
        raise ContractError("GitHub read token required")
    request = Request(
        "https://api.github.com/repos/" + repository + "/pulls/" + str(number),
        headers={"Accept": "application/vnd.github+json",
                 "Authorization": "Bearer " + token,
                 "X-GitHub-Api-Version": "2022-11-28",
                 "User-Agent": "ardesia-pr-contract"},
    )
    try:
        if opener is None:
            opener = build_opener(NoRedirects()).open
        with opener(request, timeout=GITHUB_TIMEOUT_SECONDS) as response:
            if response.status != 200:
                raise ContractError("GitHub API response was not successful")
            raw = response.read(MAX_RESPONSE_BYTES + 1)
        if len(raw) > MAX_RESPONSE_BYTES:
            raise ContractError("GitHub API response exceeds the size limit")
        return json.loads(raw.decode("utf-8"), object_pairs_hook=unique_object)
    except ContractError:
        raise
    except Exception:
        # Network, HTTP, header and JSON errors can contain URLs or credentials.
        # A failed request is red; there is no fallback to the event snapshot.
        raise ContractError("GitHub API request or response could not be read") from None


def from_current_github(event, environ=None, opener=None):
    pr = event_pull_request(event)
    head = pr.get("head")
    if not isinstance(head, dict) or not isinstance(head.get("sha"), str) or not re.fullmatch(r"[0-9a-f]{40}", head["sha"]):
        raise ContractError("event head commit required")
    current = current_pull_request(pr["number"], os.environ if environ is None else environ, opener)
    if not isinstance(current, dict) or type(current.get("number")) is not int or current["number"] != pr["number"]:
        raise ContractError("current GitHub PR number does not match the event")
    current_head = current.get("head")
    if not isinstance(current_head, dict) or current_head.get("sha") != head["sha"]:
        raise ContractError("event head is stale or current GitHub head is unavailable")
    body = current.get("body")
    value = validate(body, pr["number"])
    return {"contract": value, "number": pr["number"], "head_sha": head["sha"],
            "body_sha256": hashlib.sha256(body.encode("utf-8")).hexdigest()}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--event", type=Path, default=os.environ.get("GITHUB_EVENT_PATH"))
    parser.add_argument("--current-github", action="store_true",
                        help="Read the current GitHub body and pin its head; otherwise validate only the offline event snapshot")
    args = parser.parse_args(argv)
    try:
        if args.event is None:
            raise ContractError("event file required")
        with args.event.open("rb") as stream:
            raw = stream.read(MAX_EVENT_BYTES + 1)
        if len(raw) > MAX_EVENT_BYTES:
            raise ContractError("event exceeds the size limit")
        event = json.loads(raw.decode("utf-8"), object_pairs_hook=unique_object)
        current = from_current_github(event) if args.current_github else None
        if current is None:
            from_event(event)
    except (OSError, ValueError, RecursionError) as error:
        message = str(error) if isinstance(error, ContractError) else "event could not be decoded"
        print("PR contract: FAIL — " + message, file=sys.stderr)
        return 1
    if current is None:
        print("PR contract: OK (offline event snapshot only; execution, review and integration remain separate)")
    else:
        print("PR contract: OK (current GitHub metadata at fetch; head " + current["head_sha"]
              + "; body sha256 " + current["body_sha256"]
              + "; execution, review and integration remain separate)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
