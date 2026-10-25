#!/usr/bin/env python3
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock

import pr_contract_gate as gate


def contract():
    return {"version": 1, "owner": "AndreaMarro", "acceptance": "The student reopens the exact received activity.",
            "verification": [{"command": "npm run test:web", "evidence": "CI run and immutable receipt"}],
            "depends_on": [], "risk": "Authorization and version isolation require separate review."}


def body(value):
    return "Human explanation.\n<!-- ardesia-pr\n" + json.dumps(value) + "\n-->"


class Response(io.BytesIO):
    status = 200


def current_fixture(value=None):
    return {"number": 304, "head": {"sha": "a" * 40},
            "body": body(contract() if value is None else value)}


def event_fixture(value=None):
    return {"pull_request": current_fixture(value)}


def github_env():
    return {"GITHUB_REPOSITORY": "AndreaMarro/ardesia",
            "GITHUB_API_URL": "https://api.github.com",
            "GITHUB_TOKEN": "private-synthetic-token-do-not-echo"}


def response_for(value):
    return Response(json.dumps(value).encode())


class ContractTests(unittest.TestCase):
    def test_explicit_empty_dependencies_and_supported_contract(self):
        self.assertEqual(gate.validate(body(contract()), 304), contract())

    def test_missing_or_ambiguous_blocks_fail(self):
        for candidate in ("", "No metadata", body(contract()) * 2):
            with self.subTest(candidate=candidate[:20]), self.assertRaises(gate.ContractError):
                gate.validate(candidate, 304)

    def test_duplicate_json_keys_do_not_select_a_convenient_owner(self):
        duplicate = body(contract()).replace('"owner": "AndreaMarro"', '"owner": "TODO", "owner": "AndreaMarro"')
        with self.assertRaises(gate.ContractError):
            gate.validate(duplicate, 304)

    def test_empty_or_placeholder_text_is_not_evidence(self):
        for key in ("owner", "acceptance", "risk"):
            for invalid in (None, "", " \n", "TODO", "DA COMPILARE"):
                value = contract(); value[key] = invalid
                with self.subTest(key=key, invalid=invalid), self.assertRaises(gate.ContractError):
                    gate.validate(body(value), 304)

    def test_verification_has_both_command_and_reference(self):
        for invalid in ([], {}, ["passed"], [{"command": "pytest"}], [{"command": "pytest", "evidence": ""}]):
            value = contract(); value["verification"] = invalid
            with self.subTest(invalid=invalid), self.assertRaises(gate.ContractError):
                gate.validate(body(value), 304)

    def test_unknown_fields_cannot_claim_approval_or_terminal_state(self):
        for key in ("merged", "approved", "studentMastery"):
            value = contract(); value[key] = True
            with self.subTest(key=key), self.assertRaises(gate.ContractError):
                gate.validate(body(value), 304)

    def test_dependencies_are_real_identifiers_not_self_or_duplicates(self):
        for numbers in ([304], [0], [-1], [True], ["303"], [303, 303]):
            value = contract(); value["depends_on"] = [{"pr": n, "reason": "Shared source contract"} for n in numbers]
            with self.subTest(numbers=numbers), self.assertRaises(gate.ContractError):
                gate.validate(body(value), 304)
        value = contract(); value["depends_on"] = [{"pr": 303, "reason": "Shared source contract"}]
        self.assertEqual(gate.validate(body(value), 304)["depends_on"][0]["pr"], 303)

    def test_commands_are_inert_and_not_echoed_by_cli(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); marker = root / "must-not-exist"
            value = contract(); value["verification"][0]["command"] = "$(touch " + str(marker) + ")"
            event = root / "event.json"; event.write_text(json.dumps({"pull_request": {"number": 304, "body": body(value)}}))
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                self.assertEqual(gate.main(["--event", str(event)]), 0)
            self.assertFalse(marker.exists())
            self.assertNotIn("touch", output.getvalue())

    def test_malformed_event_fails_without_echoing_values(self):
        with tempfile.TemporaryDirectory() as directory:
            event = Path(directory) / "event.json"; event.write_text('{"secret": unquoted-private-marker}')
            output = io.StringIO()
            with contextlib.redirect_stderr(output):
                self.assertEqual(gate.main(["--event", str(event)]), 1)
            self.assertNotIn("private-marker", output.getvalue())

    def test_wrong_event_or_schema_version_is_rejected(self):
        for event in ({}, {"pull_request": None}, {"pull_request": {"number": True, "body": body(contract())}}):
            with self.subTest(event=event), self.assertRaises(gate.ContractError):
                gate.from_event(event)
        for version in (True, 2, "1"):
            value = contract(); value["version"] = version
            with self.subTest(version=version), self.assertRaises(gate.ContractError):
                gate.validate(body(value), 304)

    def test_owner_prefix_does_not_bypass_placeholder_or_login_rules(self):
        for owner in ("@OWNER", "@TODO", "a--b", "-owner", "owner-", "a" * 40, "@@valid-owner"):
            value = contract(); value["owner"] = owner
            with self.subTest(owner=owner), self.assertRaises(gate.ContractError):
                gate.validate(body(value), 304)
        value = contract(); value["owner"] = "@valid-owner"
        self.assertEqual(gate.validate(body(value), 304)["owner"], "@valid-owner")

    def test_current_mode_uses_fixed_api_repository_not_urls_in_the_event_or_body(self):
        event = event_fixture()
        event["pull_request"]["url"] = "https://untrusted.invalid/private-synthetic-token-do-not-echo"
        value = contract(); value["verification"][0]["evidence"] = "https://untrusted.invalid/receipt"
        opener = mock.Mock(return_value=response_for(current_fixture(value)))
        result = gate.from_current_github(event, github_env(), opener)
        request = opener.call_args.args[0]
        self.assertEqual(request.full_url, "https://api.github.com/repos/AndreaMarro/ardesia/pulls/304")
        self.assertEqual(request.get_header("Authorization"), "Bearer " + github_env()["GITHUB_TOKEN"])
        self.assertEqual(opener.call_args.kwargs, {"timeout": gate.GITHUB_TIMEOUT_SECONDS})
        self.assertEqual(result["head_sha"], "a" * 40)
        self.assertEqual(result["contract"]["verification"][0]["evidence"], "https://untrusted.invalid/receipt")
        self.assertRegex(result["body_sha256"], r"^[a-f0-9]{64}$")

    def test_old_valid_event_cannot_pass_after_current_body_loses_metadata(self):
        current = current_fixture(); current["body"] = "Metadata removed by a later edit"
        event = event_fixture(); event["pull_request"]["updated_at"] = "2026-10-25T00:00:00Z"
        with self.assertRaises(gate.ContractError):
            gate.from_current_github(event, github_env(), mock.Mock(return_value=response_for(current)))

    def test_out_of_order_invalid_event_reads_current_valid_body(self):
        event = event_fixture(); event["pull_request"]["body"] = "An older invalid snapshot"
        result = gate.from_current_github(event, github_env(), mock.Mock(return_value=response_for(current_fixture())))
        self.assertEqual(result["contract"], contract())

    def test_changed_head_or_wrong_number_is_rejected_without_snapshot_fallback(self):
        for change in ("head", "number", "boolean-number", "missing-head"):
            current = current_fixture()
            if change == "head": current["head"]["sha"] = "b" * 40
            elif change == "number": current["number"] = 305
            elif change == "boolean-number": current["number"] = True
            else: del current["head"]
            with self.subTest(change=change), self.assertRaises(gate.ContractError):
                gate.from_current_github(event_fixture(), github_env(), mock.Mock(return_value=response_for(current)))

    def test_current_mode_requires_a_valid_event_head_before_network(self):
        for head in (None, {}, {"sha": "missing"}, {"sha": 123}):
            event = event_fixture(); event["pull_request"]["head"] = head
            opener = mock.Mock()
            with self.subTest(head=head), self.assertRaises(gate.ContractError):
                gate.from_current_github(event, github_env(), opener)
            opener.assert_not_called()

    def test_untrusted_api_origin_or_repository_is_rejected_before_network(self):
        for key, invalid in (("GITHUB_API_URL", "http://api.github.com"),
                             ("GITHUB_API_URL", "https://api.github.com@untrusted.invalid"),
                             ("GITHUB_API_URL", "https://api.github.com/redirect"),
                             ("GITHUB_API_URL", "https://api.github.com?token=private"),
                             ("GITHUB_REPOSITORY", "owner/repo/../../elsewhere"),
                             ("GITHUB_REPOSITORY", "owner/.."),
                             ("GITHUB_REPOSITORY", "https://untrusted.invalid")):
            env = github_env(); env[key] = invalid
            opener = mock.Mock()
            with self.subTest(key=key, invalid=invalid), self.assertRaises(gate.ContractError):
                gate.from_current_github(event_fixture(), env, opener)
            opener.assert_not_called()

    def test_missing_or_header_unsafe_token_fails_before_network(self):
        for token in ("", "private\r\nUnsafe: header", "a" * 8193):
            env = github_env(); env["GITHUB_TOKEN"] = token
            opener = mock.Mock()
            with self.subTest(token_length=len(token)), self.assertRaises(gate.ContractError):
                gate.from_current_github(event_fixture(), env, opener)
            opener.assert_not_called()

    def test_api_response_size_is_bounded(self):
        response = Response(b"x" * (gate.MAX_RESPONSE_BYTES + 2))
        opener = mock.Mock(return_value=response)
        with self.assertRaisesRegex(gate.ContractError, "size limit"):
            gate.from_current_github(event_fixture(), github_env(), opener)
        self.assertTrue(response.closed)

    def test_redirects_are_refused_instead_of_forwarding_the_token(self):
        request = gate.Request("https://api.github.com/repos/AndreaMarro/ardesia/pulls/304")
        with self.assertRaisesRegex(gate.ContractError, "redirect refused"):
            gate.NoRedirects().redirect_request(request, None, 302, "redirect", {}, "https://untrusted.invalid")

    def test_api_errors_fail_closed_without_echoing_token_or_response_values(self):
        with tempfile.TemporaryDirectory() as directory:
            event = Path(directory) / "event.json"; event.write_text(json.dumps(event_fixture()))
            openers = [mock.Mock(side_effect=TimeoutError("private-synthetic-token-do-not-echo")),
                       mock.Mock(return_value=Response(b'{"private-response-marker": invalid}'))]
            for opener in openers:
                factory = mock.Mock(); factory.open = opener
                output = io.StringIO()
                with self.subTest(opener=opener), mock.patch.dict(gate.os.environ, github_env(), clear=True), \
                        mock.patch.object(gate, "build_opener", return_value=factory), \
                        contextlib.redirect_stderr(output):
                    self.assertEqual(gate.main(["--event", str(event), "--current-github"]), 1)
                self.assertNotIn("private-synthetic-token", output.getvalue())
                self.assertNotIn("private-response-marker", output.getvalue())
                self.assertIn("could not be read", output.getvalue())
                self.assertEqual(opener.call_count, 1)

    def test_current_cli_emits_only_pins_and_keeps_commands_inert(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); marker = root / "must-not-exist"
            value = contract(); value["verification"][0]["command"] = "$(touch " + str(marker) + ")"
            event = root / "event.json"; event.write_text(json.dumps(event_fixture()))
            factory = mock.Mock(); factory.open.return_value = response_for(current_fixture(value))
            output = io.StringIO()
            with mock.patch.dict(gate.os.environ, github_env(), clear=True), \
                    mock.patch.object(gate, "build_opener", return_value=factory), \
                    contextlib.redirect_stdout(output):
                self.assertEqual(gate.main(["--event", str(event), "--current-github"]), 0)
            self.assertFalse(marker.exists())
            self.assertIn("current GitHub metadata at fetch", output.getvalue())
            self.assertNotIn("touch", output.getvalue())
            self.assertNotIn("private-synthetic-token", output.getvalue())

    def test_event_size_and_body_size_are_bounded(self):
        with self.assertRaisesRegex(gate.ContractError, "bounded text"):
            gate.validate("x" * (gate.MAX_BODY_CHARACTERS + 1), 304)
        with tempfile.TemporaryDirectory() as directory:
            event = Path(directory) / "event.json"; event.write_bytes(b"x" * (gate.MAX_EVENT_BYTES + 1))
            output = io.StringIO()
            with contextlib.redirect_stderr(output):
                self.assertEqual(gate.main(["--event", str(event)]), 1)
            self.assertIn("event exceeds the size limit", output.getvalue())


if __name__ == "__main__":
    unittest.main()
