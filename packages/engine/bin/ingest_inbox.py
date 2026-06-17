#!/usr/bin/env python3
"""ingest_inbox.py — drop-folder ingest: file (audio/text/pdf/vtt/srt/jsonl) -> grafo-metodo per-docente.

Ogni formato viene normalizzato a (start,end,text) e poi passa per il flusso TESTATO
ingest_asr_jsonl -> capsule -> graph (lo stesso che ha costruito il grafo reale Segnali-2021).
Parametrizzato per docente+materia (NIENTE hardcode fisica1_sim).

Usage: uv run python bin/ingest_inbox.py <teacher_id> "<materia>" [--inbox DIR] [--db DB] [--max-files N] [--min-chars N]
GDPR: il corpus resta sul Mini. LLM (DeepSeek) usato SOLO in questo step di build (lecito), mai nel prodotto.
"""
from __future__ import annotations
import argparse, glob, json, os, re, subprocess, sys, tempfile

ROOT = os.path.expanduser("~/lessonos")
os.chdir(ROOT); sys.path.insert(0, ROOT)
TEXT_EXT = {"md", "txt"}; AUDIO_EXT = {"wav", "m4a", "mp3"}


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_") or "x"


def _to_wav16k(path: str) -> str:
    """m4a/mp3 -> 16kHz mono wav via ffmpeg (clear error if ffmpeg absent)."""
    out = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
    try:
        subprocess.run(["ffmpeg", "-y", "-i", path, "-ar", "16000", "-ac", "1", out],
                       check=True, capture_output=True)
    except FileNotFoundError:
        raise SystemExit("audio non-wav richiede ffmpeg (brew install ffmpeg)")
    except subprocess.CalledProcessError as e:
        raise SystemExit(f"ffmpeg fallito su {path}: {e.stderr[-200:]!r}")
    return out


def to_segments(path: str) -> list[dict]:
    """Qualsiasi file -> [{start,end,text}]. Errore CHIARO se manca una dipendenza."""
    ext = path.rsplit(".", 1)[-1].lower()
    if ext == "jsonl":
        return [json.loads(l) for l in open(path, encoding="utf-8") if l.strip()]
    if ext in TEXT_EXT:
        from lessonos.ingest.chunker import chunk_raw_text
        items = chunk_raw_text(open(path, encoding="utf-8").read()).items
        return [{"start": float(i), "end": float(i) + 1, "text": it.text} for i, it in enumerate(items)]
    if ext in ("vtt", "srt"):
        from lessonos.ingest.chunker import chunk_vtt, chunk_srt
        raw = open(path, encoding="utf-8").read()
        items = (chunk_vtt if ext == "vtt" else chunk_srt)(raw).items
        return [{"start": float(i), "end": float(i) + 1, "text": it.text} for i, it in enumerate(items)]
    if ext in AUDIO_EXT:
        from lessonos.asr.transcribe import transcribe_audio
        wav = path if ext == "wav" else _to_wav16k(path)
        segs = transcribe_audio(wav, language="it")
        return [{"start": float(s.start), "end": float(s.end), "text": s.text} for s in segs]
    if ext == "pdf":
        try:
            import pypdf
        except ImportError:
            raise SystemExit("PDF richiede pypdf: cd ~/lessonos && uv add pypdf")
        text = "\n\n".join((p.extract_text() or "") for p in pypdf.PdfReader(path).pages)
        from lessonos.ingest.chunker import chunk_raw_text
        items = chunk_raw_text(text).items
        return [{"start": float(i), "end": float(i) + 1, "text": it.text} for i, it in enumerate(items)]
    raise SystemExit(f"formato non supportato: .{ext}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("teacher"); ap.add_argument("subject")
    ap.add_argument("--inbox", default=os.path.expanduser("~/maestro-data/inbox"))
    ap.add_argument("--db", default=None)
    ap.add_argument("--max-files", type=int, default=0)
    ap.add_argument("--min-chars", type=int, default=120)
    a = ap.parse_args()

    pid = slug(a.subject); sid = pid + "_source"
    db = a.db or os.path.expanduser(f"~/maestro-data/{pid}/derived/db/lessonos.db")
    os.makedirs(os.path.dirname(db), exist_ok=True)
    if os.path.isfile(".env"):
        for kv in (l.strip() for l in open(".env") if l.startswith("DEEPSEEK_API_KEY=")):
            os.environ.setdefault("DEEPSEEK_API_KEY", kv.split("=", 1)[1])
    if not os.environ.get("DEEPSEEK_API_KEY"):
        raise SystemExit("manca DEEPSEEK_API_KEY (.env)")

    from lessonos.store.sqlite import SQLiteStore
    from lessonos.models.entities import Lesson, Path, Source
    from lessonos.asr.adapter import ingest_asr_jsonl
    from lessonos.capsule.assembly import assemble_lesson_capsule
    from lessonos.graph.writer import GraphWriter
    from lessonos.llm.deepseek import DeepSeekProvider
    from lessonos.llm.router import Router
    from lessonos.retrieval.teacher import retrieve_teacher_context, teacher_lesson_ids

    store = SQLiteStore(db)
    if store.get_path(pid) is None:
        store.save_path(Path(path_id=pid, title=a.subject, subject=a.subject,
                             lesson_ids=(), source_ids=(sid,), teacher_id=a.teacher))
    if store.get_source(sid) is None:
        store.save_source(Source(source_id=sid, title=f"inbox: {a.subject}", kind="inbox"))
    router = Router(); router.register(DeepSeekProvider(model="deepseek-chat"))

    files = sorted(f for f in glob.glob(a.inbox + "/*") if os.path.isfile(f))
    if a.max_files:
        files = files[:a.max_files]
    if not files:
        print(f"[ingest] inbox vuota: {a.inbox}"); return 0
    print(f"[ingest] teacher={a.teacher} materia='{a.subject}' db={db}  ({len(files)} file)")

    tot_n = tot_e = 0
    for order, f in enumerate(files, start=1):
        lid = slug(os.path.splitext(os.path.basename(f))[0])
        try:
            segs = to_segments(f)
        except SystemExit as e:
            print(f"  SKIP {os.path.basename(f)}: {e}"); continue
        if not segs:
            print(f"  SKIP {os.path.basename(f)}: 0 segmenti"); continue
        tmp = tempfile.NamedTemporaryFile("w", suffix=".jsonl", delete=False)
        for s in segs:
            tmp.write(json.dumps(s, ensure_ascii=False) + "\n")
        tmp.close()
        if store.get_lesson(lid) is None:
            store.save_lesson(Lesson(lesson_id=lid, path_id=pid, title=lid, order=order, source_id=sid))
        store.delete_segments_for_lesson(lid)
        ing = ingest_asr_jsonl(store, tmp.name, lid, min_chars=a.min_chars)
        os.unlink(tmp.name)
        cap = assemble_lesson_capsule(store, lid, router, provider="deepseek",
                                      model="deepseek-chat", defensive=True, save=True)
        e = GraphWriter(store).write_capsule_graph(cap)
        n = len(store.get_graph_nodes_for_lesson(lid))
        tot_n += n; tot_e += e
        print(f"  [{os.path.basename(f)}] -> {lid}: {len(ing)} seg · {n} nodi · {e} archi · cap(dropped={len(cap.dropped)})")

    print(f"[ingest] TOTALE: {tot_n} nodi · {tot_e} archi · teacher-lessons={len(teacher_lesson_ids(store, a.teacher))}")
    labels = []
    for lid in sorted(teacher_lesson_ids(store, a.teacher)):
        for nd in store.get_graph_nodes_for_lesson(lid):
            if getattr(nd, "node_type", "") == "concept" and getattr(nd, "label", None):
                labels.append(nd.label)
    print("[smoke] retrieval teacher-scoped (query = concetti estratti dal grafo):")
    for q in (labels[:3] or ["lezione"]):
        res = retrieve_teacher_context(store, a.teacher, q, top_k=3)
        hits = ", ".join(r.source_id for r in res) or "(nessun risultato)"
        print(f"    q={q!r} -> {hits}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
