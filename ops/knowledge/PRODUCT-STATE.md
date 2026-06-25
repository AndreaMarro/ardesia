# PRODUCT-STATE

last-verified 2026-06-25 · served-SHA 20560ec
source: WF1 audit (w2xk3ra9f.output) — GitHub deep, Vercel deep

## What ships today (canonical platform)

ARDESIA = didactic OS, plugin-native. Canonical code lives in three repos:
- **ardesia** — monorepo / platform hub (engine + studio + tools + docs nav). Default `main`, latest `2b7c08e`.
- **lessonos** — headless teaching engine ("la fabbrica"). Default `auto/main` (factory line), latest **`20560ec`** (= served-SHA). `main` ratified line at `92e393d`.
- **ardesia-studio** — whiteboard / ToolHost (mini-local name `maestro-studio`). Default `main` at `839e009`.

Support/content repos: ardesia-vault (SoT directives), ardesia-tools (factory loop tooling), ardesia-wiki (auto-timestamp dump). Legacy/parallel product: **elab-tutor** (pre-ARDESIA React+Vite+AVR-sim+Galileo app, now parallel/legacy).

## Live web surfaces (Vercel, team andreas-projects-6d4e9791)

| Surface | URL | State |
|---|---|---|
| moat read-path API (ardesia-api-vercel) | `…-andreas-projects-….vercel.app` | **prod 404 DEPLOYMENT_NOT_FOUND** (failed build); only working build is preview `neaicikfq` ● Ready but **SSO-gated** |
| ardesia-lavagna | `ardesia-lavagna.vercel.app` | 200 (static) |
| ardesia-workspace | `ardesia-workspace.vercel.app` | 200 (static) |
| elab-tutor | `www.elabtutor.school` | 200, git-linked auto-deploy `main`; **VITE_-prefixed secrets browser-inlined** (gate-Andrea) |

## Bottom line

The ARDESIA moat API is **not publicly reachable**: prod deploy `ct10aohku` is ● Error (vercel.json `functions:{index.py}` matched a non-existent `api/` dir → zero functions → 404). The vercel.json fix exists **on-disk only**, never redeployed to prod. The product the teacher would touch (public moat API) is therefore offline; static front-ends and the legacy elab-tutor app are the only public 200s.

## Gate-Andrea
- Authorized `vercel --prod` redeploy of ardesia-api-vercel (clears 404).
- Attach custom/exempt domain to make moat API public (SSO exempts custom domains only).
