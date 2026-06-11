#!/usr/bin/env python3
"""Generate ONE dispensa LIVE (M1-6 Fase F) — invoked by bin/run_dispensa.sh.

Pipeline: generate_dispensa -> verify_and_clean_dispensa -> render_dispensa_md.
The CLEANED doc is rendered, so dropped paragraphs are declared in the footer
(acceptance §4 ORDERS-M1-4). Prints a one-line JSON report (incl. cost_usd)
on stdout for the shell wrapper / STATUS.
"""

from __future__ import annotations

import argparse
import json
import sys

from lessonos.dispensa import (
    generate_dispensa,
    render_dispensa_md,
    verify_and_clean_dispensa,
)
from lessonos.graph.resolution import load_resolution
from lessonos.llm.deepseek import DeepSeekProvider, estimate_deepseek_api_cost
from lessonos.llm.router import LLMResponse, Router
from lessonos.store.sqlite import SQLiteStore


class _UsageRecorder:
    """Provider wrapper that records the usage dict of every call."""

    def __init__(self, inner) -> None:
        self._inner = inner
        self.name = inner.name
        self.usages: list[dict] = []

    def complete(self, prompt: str, *, model: str | None = None) -> LLMResponse:
        resp = self._inner.complete(prompt, model=model)
        if resp.usage:
            self.usages.append(resp.usage)
        return resp


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", required=True, help="SQLite DB path")
    parser.add_argument("--teacher", required=True, help="teacher_id")
    parser.add_argument("--out", required=True, help="output markdown path")
    parser.add_argument(
        "--resolution", default=None,
        help="optional GlobalResolution JSON (M1-1c mapping) for this teacher",
    )
    parser.add_argument("--model", default="deepseek-chat")
    args = parser.parse_args(argv)

    store = SQLiteStore(args.db)
    resolution = load_resolution(args.resolution) if args.resolution else None

    provider = _UsageRecorder(DeepSeekProvider(model=args.model))
    router = Router()
    router.register(provider)

    doc = generate_dispensa(
        store,
        args.teacher,
        router,
        provider="deepseek",
        model=args.model,
        resolution=resolution,
    )
    cleaned, report = verify_and_clean_dispensa(doc, store)
    md = render_dispensa_md(cleaned, report)
    with open(args.out, "w", encoding="utf-8") as f:
        f.write(md + "\n")

    cost = sum(estimate_deepseek_api_cost(u, model=args.model) for u in provider.usages)
    print(json.dumps({
        "teacher": args.teacher,
        "out": args.out,
        "total_claims": report.total_claims,
        "verified": report.verified,
        "dropped_claims": report.dropped,
        "dropped_paragraphs": len(cleaned.dropped_paragraphs),
        "unverified_ratio": round(report.unverified_ratio, 4),
        "passed": report.passed,
        "cost_usd": round(cost, 6),
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
