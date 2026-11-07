import os
from collections.abc import Generator
from typing import Any

from dotenv import load_dotenv
from fastapi import HTTPException, Request
from psycopg import Connection
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool, PoolTimeout

load_dotenv()


def get_database_settings() -> dict[str, str | int]:
    required = ("RDS_HOST", "RDS_DB", "RDS_USER", "RDS_PASSWORD", "RDS_PORT")
    missing = [name for name in required if not os.getenv(name)]
    if missing:
        raise ValueError(f"Missing database environment variables: {', '.join(missing)}")

    try:
        port = int(os.environ["RDS_PORT"])
    except ValueError as exc:
        raise ValueError("RDS_PORT must be an integer.") from exc

    if not 1 <= port <= 65535:
        raise ValueError("RDS_PORT must be between 1 and 65535.")

    return {
        "host": os.environ["RDS_HOST"],
        "port": port,
        "dbname": os.environ["RDS_DB"],
        "user": os.environ["RDS_USER"],
        "password": os.environ["RDS_PASSWORD"],
    }


def create_database_pool() -> ConnectionPool[dict[str, Any]]:
    return ConnectionPool(
        conninfo="",
        kwargs={**get_database_settings(), "row_factory": dict_row},
        min_size=1,
        max_size=5,
        open=False,
    )


def get_connection(
    request: Request,
) -> Generator[Connection[dict[str, Any]], None, None]:
    pool: ConnectionPool[dict[str, Any]] = request.app.state.db_pool
    try:
        with pool.connection() as connection:
            yield connection
    except PoolTimeout as exc:
        raise HTTPException(
            status_code=503,
            detail="The database is temporarily unavailable.",
        ) from exc
