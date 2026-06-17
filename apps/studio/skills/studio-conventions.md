# SKILL: studio-conventions — checklist review MAESTRO-Studio

Applica OGNI item al diff:
- [ ] Test nuovi NON tautologici: asseriscono COMPORTAMENTO osservabile, non ciò che il codice fa per costruzione.
- [ ] Nessun `any` nuovo senza motivo; tipi importati con `import type`.
- [ ] Eventi journal: append-only, `t` epoch ms, nessun `Date.now()`/`Math.random()` nel percorso di REPLAY (solo nella cattura).
- [ ] Niente fetch/cloud/endpoint esterni in M0; niente video embed.
- [ ] Se package.json cambia, package-lock.json è committato insieme.
- [ ] Audio: default OFF, consenso esplicito; nessuna traccia di voci non-docente.
- [ ] localStorage usato solo come cache (fonte di verità = FSA/export).
