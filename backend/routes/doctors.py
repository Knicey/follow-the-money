import logging
from typing import Annotated, Any

import psycopg
from fastapi import APIRouter, Depends, HTTPException, Path
from psycopg import Connection

from backend.database import get_connection
from backend.queries.doctor_queries import fetch_doctor_payments, fetch_doctors

logger = logging.getLogger(__name__)
router = APIRouter()



@router.get("/doctors")
def list_doctors(
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[dict[str, Any]]:
    try:
        return fetch_doctors(connection)
    except psycopg.Error as exc:
        logger.exception("Failed to query the PostgreSQL database.")
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc


@router.get("/doctors/{npi}/payments")
def list_doctor_payments(
    npi: Annotated[int, Path(ge=1_000_000_000, le=9_999_999_999)],
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[dict[str, Any]]:
    """Return payment records associated with one doctor."""
    try:
        return fetch_doctor_payments(connection, npi)
    except psycopg.Error as exc:
        logger.exception("Failed to query payment records for doctor NPI %s.", npi)
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc
