"""Parameterize the already independently reviewed transport; no ETL changes."""
import ast
import hashlib
import io
import json
from pathlib import Path
import tokenize

workspace = Path(__file__).resolve().parent
base = workspace / 'adopt-458491-verified-artifact.py'
source = base.read_text()
assert hashlib.sha256(source.encode()).hexdigest() == '5f98f2d806d27338e9521a3a6433832a7fbcf1070dc3bde28a5c43314ee9e040'
values = {
    '/private/tmp/cric-preintegration-45849149030.zip': '/private/tmp/cric-preintegration-45865245464.zip',
    'editorial/reviews/preintegration-45849149030-root-adoption-20261125': 'editorial/reviews/preintegration-45865245464-root-adoption-20261126',
    'var/recovered-45849149030': 'var/recovered-45865245464',
    '6208db65c22f07080e5088097e63671c6bb6ceb10e1fcb7cf7e12465192a4606': '42d000e748c4240fc294f4247be9954fd1311a77bef91152c1df6bb8937f17e2',
    '68c9553132877606f0cb957267ae31c5f3359a08': '4e403a89a95947d4b537c4a3ff5e2dc09646fff1',
    '15fd424f7bf89e47896b8dd0440283276b34f5cc5aab1aeaa2feb8fe1fd85ab5': '36eb16c1d84e660bc27622a9bd9c30f65abb10a94ec8983d8280d102146a7a11',
    45849149030: 45865245464,
    140010597083: 140077237398,
    15133498938: 15143421272,
    3472: 3632,
    229: 239,
    10467: 10947,
    957: 1015,
    604.148: 532.456,
    b'Ran 957 tests in 604.148s\n\nOK': b'Ran 1015 tests in 532.456s\n\nOK',
}
lines = source.splitlines(keepends=True)
offsets = [0]
for line in lines:
    offsets.append(offsets[-1] + len(line))
edits, changes = [], []
for token in tokenize.generate_tokens(io.StringIO(source).readline):
    if token.type not in (tokenize.STRING, tokenize.NUMBER):
        continue
    try:
        value = ast.literal_eval(token.string)
    except (ValueError, SyntaxError):
        continue
    if value not in values:
        continue
    replacement = values[value]
    start = offsets[token.start[0] - 1] + token.start[1]
    end = offsets[token.end[0] - 1] + token.end[1]
    edits.append((start, end, repr(replacement)))
    changes.append({'line': token.start[0], 'before': repr(value), 'after': repr(replacement)})
updated = source
for start, end, replacement in reversed(edits):
    updated = updated[:start] + replacement + updated[end:]
needle = "'laterScientificQuestionsAwaitingRegistration':0"
assert updated.count(needle) == 1
updated = updated.replace(needle, "'laterScientificQuestionsAwaitingRegistration':160")


class NormalizeConstants(ast.NodeTransformer):
    def visit_Constant(self, node):
        return ast.copy_location(ast.Constant(value=type(node.value).__name__), node)


assert ast.dump(NormalizeConstants().visit(ast.parse(source))) == ast.dump(NormalizeConstants().visit(ast.parse(updated)))
target = workspace / 'adopt-458652-verified-artifact.py'
target.write_text(updated)
(workspace / 'adopt-458652-parameter-provenance.json').write_text(json.dumps({
    'baseScriptSha256': hashlib.sha256(source.encode()).hexdigest(),
    'scriptSha256': hashlib.sha256(updated.encode()).hexdigest(),
    'constantChanges': changes,
    'additionalExactReceiptConstant': {'laterScientificQuestionsAwaitingRegistration': [0, 160]},
    'astUnchangedApartFromDeclaredConstants': True,
    'scope': 'Exact successful3632 transport. Does not register or compile the newer160 U701 records.',
}, indent=2) + '\n')
print('Prepared', target.name, 'with unchanged control flow and', len(changes), 'typed literal replacements.')
