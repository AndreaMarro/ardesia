"""Check the index decisions with controlled page breaks at the Chromium boundary."""
import re
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.parse import unquote, urlsplit

from server import printing


class PrintedPageNumbers(unittest.TestCase):
    def prints(self, sections, detected):
        course = {"id": "Cdoc", "course": "Cdoc", "kind": "course", "version": 1,
                  "title": "Misure", "blocks": [], "order": 1}
        records = [course]
        for order in range(1, sections + 1):
            key = f"Cdoc-L{order}"
            records.append({**course, "id": key, "kind": "lesson", "skill": key,
                            "title": f"Misura {order}", "order": order})
        printed = []

        def renderer(command, **kwargs):
            page = Path(unquote(urlsplit(command[-1]).path)).read_text()
            printed.append(re.findall(r'<span class="folio">([^<]+)</span>', page))
            output = next(arg.removeprefix("--print-to-pdf=") for arg in command
                          if arg.startswith("--print-to-pdf="))
            Path(output).write_bytes(b"%PDF-" + bytes(4000))

        with tempfile.TemporaryDirectory() as tmp:
            with patch.object(printing, "chrome", return_value="chromium"), \
                 patch.object(printing.subprocess, "run", side_effect=renderer), \
                 patch.object(printing, "destination_pages", side_effect=detected):
                printing.generate(records, "Cdoc", "dispensa", Path(tmp))
        return printed

    def test_first_page_is_printed_once_when_confirmed(self):
        self.assertEqual(self.prints(1, [{"s0": 1}]), [["1"]])

    def test_additional_section_and_repagination_use_measured_destinations(self):
        pages = [{"s0": 2, "s1": 4}, {"s0": 2, "s1": 5}, {"s0": 2, "s1": 5}]
        self.assertEqual(self.prints(2, pages), [["1", "Vai"], ["2", "4"], ["2", "5"]])

    def test_unreadable_or_unstable_page_numbers_leave_section_links(self):
        self.assertEqual(self.prints(1, [{}]), [["1"], ["Vai"]])
        oscillating = [{"s0": 2}, {"s0": 1}, {"s0": 2}]
        self.assertEqual(self.prints(1, oscillating), [["1"], ["2"], ["1"], ["Vai"]])
