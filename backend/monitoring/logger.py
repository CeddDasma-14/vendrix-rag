import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path

DB_PATH = os.getenv("MONITORING_DB_PATH", "./monitoring.db")


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = _get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS chat_logs (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp   TEXT    NOT NULL,
            session_id  TEXT,
            user_message    TEXT NOT NULL,
            agent_response  TEXT NOT NULL,
            tool_calls      TEXT,
            sources         TEXT,
            response_time_ms INTEGER,
            success     INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS evaluations (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            log_id      INTEGER NOT NULL REFERENCES chat_logs(id),
            relevance   INTEGER,
            accuracy    INTEGER,
            hallucination INTEGER,
            completeness  INTEGER,
            evaluated_at  TEXT NOT NULL
        );
    """)
    conn.commit()
    conn.close()
    print(f"[Monitoring] DB initialized at {DB_PATH}")


def log_chat(
    user_message: str,
    agent_response: str,
    tool_calls: list[str] | None = None,
    sources: list[dict] | None = None,
    response_time_ms: int | None = None,
    session_id: str | None = None,
    success: bool = True,
) -> int:
    conn = _get_conn()
    cursor = conn.execute(
        """INSERT INTO chat_logs
           (timestamp, session_id, user_message, agent_response, tool_calls, sources, response_time_ms, success)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            datetime.utcnow().isoformat(),
            session_id,
            user_message,
            agent_response,
            json.dumps(tool_calls or []),
            json.dumps(sources or []),
            response_time_ms,
            1 if success else 0,
        ),
    )
    log_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return log_id


def save_evaluation(log_id: int, scores: dict) -> None:
    conn = _get_conn()
    conn.execute(
        """INSERT INTO evaluations
           (log_id, relevance, accuracy, hallucination, completeness, evaluated_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            log_id,
            scores.get("relevance"),
            scores.get("accuracy"),
            1 if scores.get("hallucination") else 0,
            scores.get("completeness"),
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()
    conn.close()


def get_stats() -> dict:
    conn = _get_conn()

    total = conn.execute("SELECT COUNT(*) FROM chat_logs").fetchone()[0]
    success_rate = conn.execute(
        "SELECT ROUND(AVG(success) * 100, 1) FROM chat_logs"
    ).fetchone()[0] or 0
    avg_latency = conn.execute(
        "SELECT ROUND(AVG(response_time_ms)) FROM chat_logs WHERE response_time_ms IS NOT NULL"
    ).fetchone()[0] or 0
    avg_scores = conn.execute(
        """SELECT
            ROUND(AVG(relevance), 2),
            ROUND(AVG(accuracy), 2),
            ROUND(AVG(completeness), 2),
            ROUND(AVG(hallucination) * 100, 1)
           FROM evaluations"""
    ).fetchone()
    recent_logs = conn.execute(
        """SELECT cl.timestamp, cl.user_message, cl.agent_response,
                  cl.tool_calls, cl.response_time_ms, cl.success,
                  e.relevance, e.accuracy, e.hallucination, e.completeness
           FROM chat_logs cl
           LEFT JOIN evaluations e ON e.log_id = cl.id
           ORDER BY cl.id DESC LIMIT 20"""
    ).fetchall()

    conn.close()

    return {
        "total_queries": total,
        "success_rate": success_rate,
        "avg_latency_ms": avg_latency,
        "avg_relevance": avg_scores[0],
        "avg_accuracy": avg_scores[1],
        "avg_completeness": avg_scores[2],
        "hallucination_rate": avg_scores[3],
        "recent_logs": [dict(r) for r in recent_logs],
    }
