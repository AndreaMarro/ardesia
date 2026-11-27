"""Opt-in resource view composed from the existing, versioned physics bench.

The physics entry point and its scientific files are unchanged. These hooks are
checked exactly once; a new bench runtime must pass the composition and browser
tests before the resource view can be served. No physical model is duplicated.
"""

from functools import lru_cache
from pathlib import Path
import posixpath
import re


_BENCH = Path(__file__).resolve().parent.parent / "static/js/banchi/banco.js"
_IMPORT = re.compile(r"""(\bfrom\s+|\bimport\(\s*)(['"])(\.\.?/[^'"]+)(\2)""")
_HOOKS = (
    ('<label class="bench-param" data-row="${a.key}">',
     '<label class="bench-param" for="bp-${a.key}" data-row="${a.key}">'),
    ('<select name="${a.key}">', '<select id="bp-${a.key}" name="${a.key}">'),
    ('export async function benchPage(id, origin, topicIndex) {',
     'export async function benchPage(id, origin, topicIndex, options = {}) {'),
    ("  const leaveFocus = concentrazione(get('.bench-instrument'));",
     "  const leaveFocus = concentrazione(get(options.explore ? '.bench-work' : '.bench-instrument'));"),
    ('    answered = false;', '    answered = !!options.explore;'),
    ('  let p = defaults(model.params),',
     '  let p = options.initialCase ? { ...options.initialCase.parameters } : defaults(model.params),'),
    ('    t = 0,', '    t = options.initialCase?.time ?? 0,'),
    ("    desiredView = 'orbit',", "    desiredView = options.initialCase?.view ?? 'orbit',"),
    ('  function goStep(next) {',
     '  function goStep(next) {\n    if (options.explore && next < 0) next = 0;'),
    ('    segnaMomento(root, stage + 1, !answered);',
     "    segnaMomento(root, stage + 1, !answered);\n"
     "    if (options.explore) {\n"
     "      get('[data-predict]').hidden = true;\n"
     "      get('.initial-choice').hidden = true;\n"
     "    }"),
    ('  initialize3D();\n  return dispose;',
     "  if (options.explore) {\n"
     "    root.classList.add('resource-bench');\n"
     "    get('.lab-path').hidden = true;\n"
     "    get('[data-assess]').hidden = true;\n"
     "    goStep(1);\n"
     "  }\n"
     "  initialize3D();\n"
     "  if (options.initialCase?.view === 'diagram') chooseView('diagram');\n"
     "  options.onReady?.({\n"
     "    getState() { stop(); return { parameters: { ...p }, time: t, view }; },\n"
     "    dispose,\n"
     "  });\n"
     "  return dispose;"),
)


def compose_resource_bench(source=None):
    """Accept source in tests to verify hooks against the exact scientific head."""
    source = _BENCH.read_text(encoding="utf-8") if source is None else source
    for anchor, replacement in _HOOKS:
        if source.count(anchor) != 1:
            raise ValueError(f"Resource bench hook needs review: {anchor[:80]!r}")
        source = source.replace(anchor, replacement, 1)

    def absolute(match):
        prefix, quote, relative, _ = match.groups()
        trailing = "/" if relative.endswith("/") else ""
        path = posixpath.normpath("/js/banchi/" + relative) + trailing
        return prefix + quote + path + quote

    return _IMPORT.sub(absolute, source).encode("utf-8")


@lru_cache(maxsize=1)
def resource_bench_asset():
    return compose_resource_bench()
