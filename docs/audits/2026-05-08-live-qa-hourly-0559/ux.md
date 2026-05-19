# UX - ELAB live QA hourly session

Run: 2026-05-08T06:08:58Z

## Review

- partial: Homepage structure is covered by unit tests: 3 cards, no Glossario, inline video card, local video switching.
- partial: Lavagna libera scoping is covered by unit tests: free mode opens a clean whiteboard plus UNLIM and hides circuit/simulator entry points.
- blocked: Visual quality, layout clipping, iPad portrait, iPad landscape, Apple Pencil pointer drawing, touch targets, and screenshots could not be verified because Chromium/Chrome launch is blocked by sandbox permissions.

## UX Risk

blocked: Do not alias production until screenshots and pointer drawing checks run on an actual browser. The code currently has test coverage for free-mode scoping, but no visual evidence from this session.

