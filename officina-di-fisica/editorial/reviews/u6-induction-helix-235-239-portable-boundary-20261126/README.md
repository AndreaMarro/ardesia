# Portable identity boundary test

The previous AST digest was tied to the interpreter serialization format. The failing remote run 45859734058 is preserved as a negative outcome; its Python 3.12 AST digest is recorded separately from the Python 3.13 digest.

The new guard pins SHA256 55ff6aaa71fd195322e44745a9f17762d6ac745a1abe7dac5e739d69e4c0e5ca of the exact UTF-8 function text extracted with ast.get_source_segment. The function text in A and ROOT was compared byte for byte. Exactly one top-level function must exist, inspect.getsource of the imported function must match, and the two ASTs must agree within the same interpreter. No alternate digest is accepted. Changing the ok guard changes the required source digest.

The target really ran 16 tests with exit 0 in 5.988 s on local Python 3.13. It now additionally rejects mutated ID, candidate/source identity, ok, verification mode, human approval, publication and a rebound candidate key. Existing independent mathematical adversarial tests are unchanged. Remote Python 3.12 validation remains PENDING_ROOT; no remote success is claimed.

No scientific verifier, saved scientific report, candidate, review contract, registry or runtime was changed. The old test is preserved verbatim in previous-test.py.txt. Human approval remains NOT_RUN.
