# S17 Living Lesson implementation plan

Goal: teacher and student recover the same explicitly linked recording and historical scientific object in a runnable local consumer.
Architecture: compose canonical WorkspaceStore, JournalRecorder, SessionAudioRecorder, LessonOS and ReplayEngine. Vendor Wavesurfer 7.11.1 core/Regions/Timeline (BSD), never its recorder. A versioned scene extension holds editorial markers, chapter titles and optional supplied captions; private notes live through a host-provided authorized port. This is local metadata, never an identity or permission authority. Missing exact revisions/media fail closed.
Spec: user S17 mandate, PRODUCT-CANON and ADR-0004, base a00f2f40091aecf69e58ebaba42cf70d748e4066.
Constraints: only this namespace; no Room/root/storage/schema/lock edits. `.lesson` transports the existing scene envelope, so metadata is included without another journal. S00 owns final mount/merge; prepare a SHA-pinned minimal patch and append-only RUNLOG/NEXT handoff here.

- [ ] Model + tests: exact source/session/digest/version validation, pause boundaries, missing binary file, corrupt media, stale async resolution, scene extension integrity and round-trip through real .lesson.
- [ ] Playback + tests: real Wavesurfer waveform/Timeline/Regions; media clock maps to epoch, seek restores ReplayEngine scene; lifecycle destroys URLs/listeners, stop on revoked permission/logout; no capture at mount.
- [ ] Consumer + tests: real Excalidraw and canonical recorder/journal; create/open, two takes and different object references, markers/chapters, correction, student replay, private note and cold reopen; explicit consent UI reused.
- [ ] Verify: unit suite/typecheck/build, real Chromium fake-device recording, 390/820/1440, keyboard/touch, negative cases, export/import and checksum sample. Hardware and human listening remain NOT_RUN.
- [ ] Deliver: one PR, exact head/CI record and S00/S08/S20 handoff, upstream evidence/provenance and minimal integration patch. No merge/deploy.

Review focus: rapid passage switches cannot deliver stale audio; revision absence cannot select current scene; permission change stops media; scene saves preserve all binary files; import cannot silently relabel a lesson.
