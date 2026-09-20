# Stack disposition plan — PR #248–#255 (NO closures applied in this session)

Future goal: main comprehensible without seven stacked PRs forever. Closure
happens only after review + integration. Do NOT close before the stated gate.

| PR | Role | Source commits used in candidate | Unique evidence | Absorbed? | Close when | Do not close before |
|---|---|---|---|---|---|---|
| #248 | D2-J1 bundle contract (2 commits f45b01cf, 5a040b6b atop foreign ancestry) | both | canonical-bundle hardening | YES (transplanted) | integration PR merged | integration merged; ancestry still carries 64 hidden commits |
| #250 | D2-J3A snapshot projector | f2c9563a | digest projection | YES | integration merged | integration merged |
| #251 | J3A.1 parity | 415bc116 | concept parity | YES | integration merged | integration merged |
| #252 | J3A.2 hardening | 86cdfe6e, bfc09878 | identity/labels/roles | YES | integration merged | integration merged |
| #253 | J3A.3 re-ingest + readiness doc | 3efe9d66, 671cbfcf, 6a5b44d0, 0794f8e0, 36649003 | compensation semantics, S16 truth | YES | integration merged | integration merged |
| #254 | J3B hybrid material | a131bd8a, dfb801cf | appendix + guards | YES | integration merged | integration merged |
| #255 | J3C PDF + hardening + closure | 8a7e487d..7af8f51c (7 commits) | export/compose/retention/R1/R2 | YES | integration merged | integration merged |

Note: #248's ancestry contains the 64 hidden commits (review scope 2 commits
vs merge scope 66). Never merge #248 whole. The integration candidate carries
only the 20 D2 commits; hidden work stays out by construction.
