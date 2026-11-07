import logging
from typing import Annotated, Any

import psycopg
from fastapi import APIRouter, Depends, HTTPException, Path
from backend.schema.response import DoctorSummaryResponse, DoctorPaymentResponse
from psycopg import Connection

from backend.database import get_connection
from backend.queries.doctor_queries import fetch_doctor_payments, fetch_doctors

logger = logging.getLogger(__name__)
router = APIRouter()

TAG = "Doctors"


@router.get("/doctors", tags=[TAG], response_model=list[DoctorSummaryResponse])
def list_doctors(
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[DoctorSummaryResponse]:
    try:
        return fetch_doctors(connection)
    except psycopg.Error as exc:
        logger.exception("Failed to query the PostgreSQL database.")
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc


@router.get("/doctors/{npi}/payments", tags=[TAG], response_model=list[DoctorPaymentResponse])
def list_doctor_payments(
    npi: Annotated[int, Path(ge=1_000_000_000, le=9_999_999_999)],
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[DoctorPaymentResponse]:
    """Return payment records associated with one doctor."""
    try:
        return fetch_doctor_payments(connection, npi)
    except psycopg.Error as exc:
        logger.exception("Failed to query payment records for doctor NPI %s.", npi)
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc
