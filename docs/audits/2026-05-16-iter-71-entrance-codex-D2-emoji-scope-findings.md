# Iter 71 Entrance — Codex Pattern V D2 HomePage Emoji Scope Findings

**Date**: 2026-05-16 PM (Codex GPT-5.5 high single sequential dispatch ~3min 75KB output)
**Methodology**: Codex Pattern V (read-only sandbox + file:line citations) — `scripts/dev/codex-bg.sh verify-team-D2-emoji-scope-iter71 --profile verify`
**Status**: ✅ COMPLETE (alive=0 size=74910 bytes)

## Key correction Codex D2 vs original assumption

`src/components/ElabIcons.jsx` does **NOT exist**. Actual path: `src/components/common/ElabIcons.jsx`. Iter 71 Task 8 file ownership matrix must use correct path.

## Emoji audit complete table

| File:line | Emoji | Context | Recommended ElabIcons mapping |
|---|---|---|---|
| `HomePage.jsx:9` | 🧠 | Comment, old Chatbot UNLIM card | Existing `UNLIMCardIcon` |
| `HomePage.jsx:10` | 📚 | Comment, Glossario Tea | Existing `GlossarioCardIcon` OR `BookIcon` |
| `HomePage.jsx:11` | ⚡ | Comment, Lavagna | Existing `LavagnaCardIcon` |
| `HomePage.jsx:12` | 🐒 | Comment, Chi siamo | **NEW** `ScimpanzeIcon` / `AboutEasterIcon` |
| `HomePage.jsx:14` | 🐒 | Comment, footer link | **NEW** `ScimpanzeIcon` |
| `HomePage.jsx:17-20` | ✅❌ | Comment status (DONE/DEFERRED) | Plain text DONE/DEFERRED |
| `HomePage.jsx:29` | ⚡🐒 | Comment icon list | `LavagnaCardIcon` + NEW `ScimpanzeIcon` |
| `HomePage.jsx:30-33` | ✅ | Comment status | Plain text |
| **`HomePage.jsx:393`** | ⚡ | `CARDS[lavagna].emoji` fallback **RUNTIME** | Existing `LavagnaCardIcon`; remove fallback field after verify no consumer |
| **`HomePage.jsx:408`** | 📚 | `CARDS[tutor].emoji` fallback **RUNTIME** | Existing `TutorCardIcon`; remove fallback field after verify no consumer |
| **`HomePage.jsx:429`** | 🎬 | `CARDS[videolezioni].emoji` **VISIBLE** (`IconComponent: null`) | **NEW** `VideoLessonsCardIcon` required |
| `HomePage.jsx:633` | 🐒 | Comment describing fallback | **NEW** `ScimpanzeIcon` OR remove fallback wording |
| **`HomePage.jsx:1086`** | 🐒 | Footer runtime fallback emoji **VISIBLE** | **NEW** `ScimpanzeIcon` required, OR replace fallback with textless SVG |

**Priority**: 3 RUNTIME visible emoji (393 ⚡ + 408 📚 + 429 🎬 + 1086 🐒). Comments (lines 9-33 + 633) low priority cosmetic cleanup.

## Existing ElabIcons inventory (40 icons available)

`src/components/common/ElabIcons.jsx` exports:
`MicrophoneIcon`, `StopIcon`, `SpeakerOnIcon`, `SpeakerOffIcon`, `SendIcon`, `LoadingIcon`, `ReportIcon`, `RobotIcon`, `CircuitIcon`, `LightbulbIcon`, `WrenchIcon`, `BookIcon`, `CameraIcon`, `PrintIcon`, `StarIcon`, `ErrorIcon`, `SuccessIcon`, `QuestionIcon`, `SearchIcon`, `WarningIcon`, `CloseIcon`, `TrophyIcon`, `AntennaIcon`, `LetterIcon`, `ScreenshotIcon`, `HandWaveIcon`, `SettingsIcon`, `RefreshIcon`, `PartyIcon`, `FlaskIcon`, `FootstepsIcon`, `PaletteIcon`, `LavagnaCardIcon`, `TutorCardIcon`, `UNLIMCardIcon`, `GlossarioCardIcon`, `DownloadIcon`, `CheckIcon`, `DesktopIcon`, `CronologiaCardIcon`.

## NEW icons needed iter 71 Task 8

### 1. `VideoLessonsCardIcon` (P0 RUNTIME visible)

- Suggested visual: video player frame + play triangle + small film strip
- Palette: ELAB navy/orange/lime
- Wire: replace `🎬` at `HomePage.jsx:429`
- Effort: 0.75-1.25h SVG design + JSX export

### 2. `ScimpanzeIcon` / `AboutEasterIcon` (P0 RUNTIME visible footer)

- Suggested visual: 48px static SVG fallback for primary animated GIF asset
- Palette: ELAB navy/orange/lime
- Wire: replace `🐒` at `HomePage.jsx:1086` (footer runtime fallback)
- Effort: 0.5-0.75h SVG design + JSX export + wire fallback

## Effort estimate iter 71 Task 8

| Task | Effort |
|---|---|
| Remove/normalize comment emojis (lines 9-33 + 633) | 0.5h |
| Add `VideoLessonsCardIcon` + wire HomePage.jsx:429 | 0.75-1.25h |
| Add `ScimpanzeIcon` + wire HomePage.jsx:1086 footer + 633 comment | 0.5-0.75h |
| Targeted grep + tests verify (Touch 44px + ARIA + WCAG AA contrast) | 0.25h |
| **Total iter 71 TEAM D2 emoji scope** | **1.5-2.5 hours** |

## Honesty caveats

1. **3 RUNTIME visible emoji P0 priority** (393 ⚡ + 408 📚 + 429 🎬 + 1086 🐒) — these are what user actually sees on HomePage.
2. **9+ comment emojis low priority cosmetic** — defer iter 72+ if scope too large iter 71.
3. **NEW VideoLessonsCardIcon required** — `IconComponent: null` for videolezioni card means emoji 🎬 actually renders. Not optional.
4. **NEW ScimpanzeIcon required** — footer fallback animated GIF may not load all environments. Need static SVG backup.
5. **Codex D2 does NOT audit Album scaffold** (separate iter 71 Task 8 sub-scope: AlbumStudente.jsx + Supabase wire-up = additional 3-4h). Combined Task 8 = 5-6h total (1.5-2.5h emoji + 3-4h Album).

## Files refs

- Source code: `src/components/HomePage.jsx` (1086+ LOC, 14 emoji refs)
- Existing icons: `src/components/common/ElabIcons.jsx` (40 exports)
- Codex Pattern V raw output: `/tmp/codex-verify-team-D2-emoji-scope-iter71.txt` (75KB final 2026-05-16T20:38)
- Iter 71 detailed plan Task 8: `docs/plans/2026-05-16-iter-71-DETAILED-PLAN.md:Task 8` (TEAM D worktree subagent BG 4h estimated — REVISED 5-6h post Codex D2 + Album scope)

**Iter 71 entrance gate**: this audit READY for Task 8 dispatch. Subagent BG can consume this verbatim + Codex D2 raw output for full context.
