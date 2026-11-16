import logging
from typing import Annotated, Any

import psycopg
from fastapi import APIRouter, Depends, HTTPException, Path
from backend.schema.response import DoctorSummaryResponse, DoctorPaymentResponse, DoctorPaidPrescribedDrugResponse
from psycopg import Connection

from backend.database import get_connection
from backend.queries.doctor_queries import fetch_doctor_payments, fetch_doctors, fetch_doctor, fetch_doctor_paid_prescribed_drugs

logger = logging.getLogger(__name__)
router = APIRouter()

TAG = "Doctors"


@router.get(
    "/doctors",
    tags=[TAG],
    response_model=list[DoctorSummaryResponse],
    summary="List doctors",
    description="Return each doctor with their location, specialty, total reported payments, and total prescription drug costs.",
)
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


@router.get(
    "/doctors/{npi}/",
    tags=[TAG],
    response_model=DoctorSummaryResponse,
    summary="One doctor's summary information.",
    description="Return summary information associated with the specified doctor.",
)
def get_doctor(
    npi: Annotated[
        int,
        Path(
            ge=1_000_000_000,
            le=9_999_999_999,
            description="The doctor's 10-digit National Provider Identifier (NPI).",
        ),
    ],
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> DoctorSummaryResponse:
    """Return summary information associated with one doctor."""
    try:
        return fetch_doctor(connection, npi)
    except psycopg.Error as exc:
        logger.exception("Failed to query summary info for doctor NPI %s.", npi)
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc


@router.get(
    "/doctors/{npi}/payments",
    tags=[TAG],
    response_model=list[DoctorPaymentResponse],
    summary="List a doctor's payments",
    description="Return payment records associated with the specified doctor, ordered by payment amount.",
)
def list_doctor_payments(
    npi: Annotated[
        int,
        Path(
            ge=1_000_000_000,
            le=9_999_999_999,
            description="The doctor's 10-digit National Provider Identifier (NPI).",
        ),
    ],
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


@router.get(
    "/doctors/{npi}/paid-prescribed-drugs",
    tags=[TAG],
    response_model=list[DoctorPaidPrescribedDrugResponse],
    summary="List drugs a doctor was paid for and prescribed",
    description="Return drugs linked to the doctor's payments that the doctor also prescribed, with payment and prescription totals.",
)
def list_doctor_paid_prescribed_drugs(
    npi: Annotated[
        int,
        Path(
            ge=1_000_000_000,
            le=9_999_999_999,
            description="The doctor's 10-digit National Provider Identifier (NPI).",
        ),
    ],
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[DoctorPaidPrescribedDrugResponse]:
    """Return drugs a doctor was paid for and prescribed."""
    try:
        return fetch_doctor_paid_prescribed_drugs(connection, npi)
    except psycopg.Error as exc:
        logger.exception("Failed to query payment records for doctor NPI %s.", npi)
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc
