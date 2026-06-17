#!/usr/bin/env python3
"""
ELAB Autoresearch — Persistent Context Database (SQLite)
Accumulates knowledge, findings, scores, and decisions across cycles.
Searchable, queryable, persistent.
"""

import json
import sqlite3
import time
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "state" / "context.db"


def get_db() -> sqlite3.Connection:
    """Get or create the context database."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")

    # Create tables
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS knowledge (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            cycle INTEGER,
            category TEXT NOT NULL,  -- research, improvement, bug, article, decision, metric
            topic TEXT NOT NULL,
            content TEXT NOT NULL,
            source TEXT,             -- semantic_scholar, deepseek, gemini, kimi, playwright, manual
            score REAL,              -- relevance/quality score 0-1
            metadata TEXT             -- JSON blob for extra data
        );

        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            cycle INTEGER,
            composite REAL NOT NULL,
            metrics TEXT NOT NULL     -- JSON blob of all metrics
        );

        CREATE TABLE IF NOT EXISTS experiments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            cycle INTEGER,
            git_hash TEXT,
            mode TEXT,
            status TEXT,             -- keep, discard, crash
            composite_before REAL,
            composite_after REAL,
            description TEXT,
            files_changed TEXT,       -- JSON array
            tools_used TEXT           -- JSON array
        );

        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            cycle INTEGER,
            title TEXT NOT NULL,
            path TEXT,
            quality_score REAL,
            validated_by TEXT,
            feedback TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge(category);
        CREATE INDEX IF NOT EXISTS idx_knowledge_topic ON knowledge(topic);
        CREATE INDEX IF NOT EXISTS idx_scores_timestamp ON scores(timestamp);
    """)
    conn.commit()
    return conn


# ─── Write Operations ────────────────────────────

def add_knowledge(category: str, topic: str, content: str,
                  source: str = "manual", cycle: int = 0, score: float = 0.5,
                  metadata: dict = None):
    """Add a knowledge entry."""
    conn = get_db()
    conn.execute(
        "INSERT INTO knowledge (timestamp, cycle, category, topic, content, source, score, metadata) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (datetime.now().isoformat(), cycle, category, topic, content, source, score,
         json.dumps(metadata or {}))
    )
    conn.commit()
    conn.close()


def add_score(cycle: int, composite: float, metrics: dict):
    """Record a score measurement."""
    conn = get_db()
    conn.execute(
        "INSERT INTO scores (timestamp, cycle, composite, metrics) VALUES (?, ?, ?, ?)",
        (datetime.now().isoformat(), cycle, composite, json.dumps(metrics))
    )
    conn.commit()
    conn.close()


def add_experiment(cycle: int, git_hash: str, mode: str, status: str,
                   composite_before: float, composite_after: float,
                   description: str, files_changed: list = None, tools_used: list = None):
    """Record an experiment result."""
    conn = get_db()
    conn.execute(
        "INSERT INTO experiments (timestamp, cycle, git_hash, mode, status, "
        "composite_before, composite_after, description, files_changed, tools_used) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (datetime.now().isoformat(), cycle, git_hash, mode, status,
         composite_before, composite_after, description,
         json.dumps(files_changed or []), json.dumps(tools_used or []))
    )
    conn.commit()
    conn.close()


def add_article(cycle: int, title: str, path: str, quality_score: float,
                validated_by: str, feedback: str):
    """Record an article."""
    conn = get_db()
    conn.execute(
        "INSERT INTO articles (timestamp, cycle, title, path, quality_score, validated_by, feedback) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (datetime.now().isoformat(), cycle, title, path, quality_score, validated_by, feedback)
    )
    conn.commit()
    conn.close()


# ─── Read Operations ─────────────────────────────

def search_knowledge(query: str, category: str = None, limit: int = 10) -> list:
    """Search knowledge base. Simple LIKE search (no vector DB needed for <1000 entries)."""
    conn = get_db()
    if category:
        rows = conn.execute(
            "SELECT * FROM knowledge WHERE category=? AND (topic LIKE ? OR content LIKE ?) "
            "ORDER BY score DESC, timestamp DESC LIMIT ?",
            (category, f"%{query}%", f"%{query}%", limit)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM knowledge WHERE topic LIKE ? OR content LIKE ? "
            "ORDER BY score DESC, timestamp DESC LIMIT ?",
            (f"%{query}%", f"%{query}%", limit)
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_recent_knowledge(category: str = None, limit: int = 10) -> list:
    """Get most recent knowledge entries."""
    conn = get_db()
    if category:
        rows = conn.execute(
            "SELECT * FROM knowledge WHERE category=? ORDER BY timestamp DESC LIMIT ?",
            (category, limit)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM knowledge ORDER BY timestamp DESC LIMIT ?",
            (limit,)
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_score_trend(limit: int = 20) -> list:
    """Get score trend (most recent first)."""
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM scores ORDER BY timestamp DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_experiment_history(limit: int = 20) -> list:
    """Get experiment history."""
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM experiments ORDER BY timestamp DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_context_summary() -> str:
    """Generate a compact context summary for injection into agent prompt."""
    conn = get_db()

    # Stats
    knowledge_count = conn.execute("SELECT COUNT(*) FROM knowledge").fetchone()[0]
    score_count = conn.execute("SELECT COUNT(*) FROM scores").fetchone()[0]
    exp_count = conn.execute("SELECT COUNT(*) FROM experiments").fetchone()[0]
    article_count = conn.execute("SELECT COUNT(*) FROM articles").fetchone()[0]

    # Latest score
    latest_score = conn.execute("SELECT composite, timestamp FROM scores ORDER BY timestamp DESC LIMIT 1").fetchone()

    # Score trend (last 5)
    trend = conn.execute("SELECT cycle, composite FROM scores ORDER BY timestamp DESC LIMIT 5").fetchall()

    # Recent research (last 5)
    recent_research = conn.execute(
        "SELECT topic, content FROM knowledge WHERE category='research' ORDER BY timestamp DESC LIMIT 5"
    ).fetchall()

    # Recent experiments (last 5)
    recent_exp = conn.execute(
        "SELECT mode, status, description FROM experiments ORDER BY timestamp DESC LIMIT 5"
    ).fetchall()

    conn.close()

    parts = [f"DB: {knowledge_count} knowledge, {score_count} scores, {exp_count} experiments, {article_count} articles"]

    if latest_score:
        parts.append(f"Latest score: {latest_score[0]:.4f} ({latest_score[1][:10]})")

    if trend:
        parts.append("Trend: " + " → ".join(f"c{r[0]}:{r[1]:.3f}" for r in trend))

    if recent_research:
        parts.append("Recent research:")
        for r in recent_research:
            parts.append(f"  - {r[0]}: {r[1][:100]}")

    if recent_exp:
        parts.append("Recent experiments:")
        for r in recent_exp:
            parts.append(f"  - [{r[0]}] {r[1]}: {r[2][:80]}")

    return "\n".join(parts)


# ─── Initialize with baseline ────────────────────

def init_baseline():
    """Initialize DB with baseline data from existing files."""
    conn = get_db()
    if conn.execute("SELECT COUNT(*) FROM scores").fetchone()[0] > 0:
        conn.close()
        return "DB already has data"

    # Add baseline score
    add_score(0, 0.8872, {
        "build_pass": 1.0, "galileo_tag_accuracy": 0.90,
        "galileo_gulpease": 0.80, "galileo_identity": 1.0,
        "content_integrity": 1.0, "ipad_compliance": 0.675,
        "lighthouse_perf": 0.62,
    })

    # Import existing knowledge files
    knowledge_dir = Path(__file__).parent / "knowledge"
    if knowledge_dir.exists():
        for f in knowledge_dir.glob("*.md"):
            content = f.read_text()[:2000]
            category = "research" if "research" in f.stem else "brainstorm" if "brainstorm" in f.stem else "audit"
            add_knowledge(category, f.stem, content, source="imported", score=0.6)

    conn.close()
    return "Baseline initialized"


if __name__ == "__main__":
    print("Initializing ELAB Context DB...")
    result = init_baseline()
    print(result)
    print()
    print("Context summary:")
    print(get_context_summary())
