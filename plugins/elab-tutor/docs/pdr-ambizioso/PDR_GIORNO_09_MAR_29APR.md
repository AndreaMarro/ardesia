# PDR Giorno 9 — Martedì 29/04/2026

**Sett 2** (INFRA) | Andrea 8h + Tea 3h | Goal: **Hetzner Cloud CX31 setup base + hardening**.

## Pre-flight (9:00)
```bash
git status; git pull; npx vitest run --reporter=dot | tail -3
```

## Task del giorno
1. **(P0) Andrea: signup Hetzner Cloud + crea progetto "elab-prod" + SSH key** (45 min)
2. **(P0) Andrea: deploy CX31 server Ubuntu 24.04 LTS Falkenstein/Helsinki** (30 min)
3. **(P0) DEV: ansible playbook base (firewall, fail2ban, docker, nginx)** (3h)
4. **(P0) DEV: docker-compose.yml stub (postgres, redis, traefik)** (1.5h)
5. **(P0) AUDITOR: live verify hardening (nmap, port closed, fail2ban active)** (1h)
6. **(P1) Tea: PR esperimenti vol1 cap 4 (auto-merge test)** (Tea 3h)
7. **(P1) ARCHITECT: ADR-005 VPS provider scelta (Hetzner vs alt)** (1h)

## Multi-agent dispatch (10:00)
```
@team-architect "ADR-005 Hetzner CX31 vs DigitalOcean/Linode/Scaleway. Output docs/decisions/ADR-005-vps-provider.md."
@team-dev "Ansible playbook base Hetzner. Files: infra/ansible/playbooks/base.yml + roles/. Idempotent."
@team-tester "Bash test infra: ssh-port-only, https-forced, healthchecks. infra/tests/base-hardening.sh."
@team-auditor "Live verify post-setup: nmap port scan, curl /health, ssh hardening. docs/audits/2026-04-29-hetzner-setup-onesto.md."
```

## PTC use case
Multi-host ansible parallel run (futuro scaling, sett 2 single host).

## DoD
- [ ] CX31 running + IP assigned
- [ ] Ansible playbook PASS idempotent 2x
- [ ] Docker-compose stub up
- [ ] AUDITOR verify: ports 22+443 only, fail2ban active, https forced
- [ ] ADR-005 scritto
- [ ] Tea PR auto-merged
- [ ] Handoff doc

## Rischi
- Hetzner CX31 sold out preferita region → fallback Helsinki/Nuremberg
- Ansible primo run errori → debug + retry, scrivere fix in role

## Handoff
`docs/handoff/2026-04-29-end-day.md`
