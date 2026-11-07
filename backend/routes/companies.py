import logging
from typing import Annotated, Any

import psycopg
from fastapi import APIRouter, Depends, HTTPException
from psycopg import Connection

from backend.database import get_connection
from backend.queries.company_queries import fetch_companies

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/companies")
def list_companies(
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[dict[str, Any]]:
    """Return all companies and their total payments."""
    try:
        return fetch_companies(connection)
    except psycopg.Error as exc:
        logger.exception("Failed to query companies.")
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc