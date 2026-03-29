from __future__ import annotations

import os
from typing import Any

import psycopg


def _build_conn_kwargs() -> dict[str, Any]:
    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_url:
        return {"conninfo": database_url}

    host = os.getenv("DB_HOST", "").strip()
    port = os.getenv("DB_PORT", "5432").strip()
    dbname = os.getenv("DB_NAME", "").strip()
    user = os.getenv("DB_USER", "").strip()
    password = os.getenv("DB_PASSWORD", "").strip()
    sslmode = os.getenv("DB_SSLMODE", "require").strip() or "require"
    connect_timeout = int(os.getenv("DB_CONNECT_TIMEOUT", "10"))

    missing = [
        name
        for name, value in (
            ("DB_HOST", host),
            ("DB_NAME", dbname),
            ("DB_USER", user),
            ("DB_PASSWORD", password),
        )
        if not value
    ]
    if missing:
        raise ValueError(
            "Missing required database environment variable(s): " + ", ".join(missing)
        )

    return {
        "host": host,
        "port": int(port),
        "dbname": dbname,
        "user": user,
        "password": password,
        "sslmode": sslmode,
        "connect_timeout": connect_timeout,
    }


def _connect() -> psycopg.Connection:
    kwargs = _build_conn_kwargs()
    conninfo = kwargs.pop("conninfo", None)
    if conninfo:
        return psycopg.connect(conninfo)
    return psycopg.connect(**kwargs)


def _ensure_table(cur: psycopg.Cursor) -> None:
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS early_access_subscribers (
            id BIGSERIAL PRIMARY KEY,
            email VARCHAR(254) NOT NULL UNIQUE,
            source VARCHAR(128) NOT NULL DEFAULT 'landingpage',
            subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            email_sent_at TIMESTAMPTZ
        )
        """
    )


def record_early_access_subscriber(email: str, source: str) -> int:
    normalized_source = (source or "landingpage").strip()[:128] or "landingpage"

    with _connect() as conn:
        with conn.cursor() as cur:
            _ensure_table(cur)
            cur.execute(
                """
                INSERT INTO early_access_subscribers (email, source, email_sent_at)
                VALUES (%s, %s, NOW())
                ON CONFLICT (email)
                DO UPDATE SET
                    source = EXCLUDED.source,
                    updated_at = NOW(),
                    email_sent_at = EXCLUDED.email_sent_at
                RETURNING id
                """,
                (email, normalized_source),
            )
            row = cur.fetchone()

    if not row:
        raise RuntimeError("Failed to persist subscriber record.")
    return int(row[0])


def check_early_access_db_connection() -> tuple[bool, str]:
    try:
        with _connect() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT version()")
                version_row = cur.fetchone()
                _ensure_table(cur)
    except Exception as exc:  # pragma: no cover - connectivity depends on runtime env
        return False, str(exc)

    version = str(version_row[0]) if version_row else "unknown"
    return True, f"Connected. PostgreSQL version: {version}"
