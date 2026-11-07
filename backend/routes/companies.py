import logging
from typing import Annotated, Any

import psycopg
from fastapi import APIRouter, Depends, HTTPException
from psycopg import Connection

from backend.database import get_connection
from backend.queries.company_queries import fetch_companies, fetch_company_payments

from backend.schema.response import CompanySummaryResponse, CompanyPaymentDoctorResponse, CompanyPaymentDrugResponse

logger = logging.getLogger(__name__)
router = APIRouter()

TAG = "Companies"


@router.get("/companies", tags=[TAG], response_model=list[CompanySummaryResponse])
def list_companies(
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[CompanySummaryResponse]:
    """Return all companies and their total payments."""
    try:
        return fetch_companies(connection)
    except psycopg.Error as exc:
        logger.exception("Failed to query companies.")
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc


@router.get("/companies/{company_id}/payments", tags=[TAG], response_model=list[CompanyPaymentDoctorResponse])
def list_company_payments(
    company_id: str,
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[CompanyPaymentDoctorResponse]:
    """Return all payments for a specific company."""
    try:
        return fetch_company_payments(connection, company_id)
    except psycopg.Error as exc:
        logger.exception("Failed to query company payments.")
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc


@router.get("/companies/{company_id}/drug-payments", tags=[TAG], response_model=list[CompanyPaymentDrugResponse])
def list_company_drug_payments(
    company_id: str,
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[CompanyPaymentDrugResponse]:
    """Return all drug-related payments for a specific company."""
    try:
        from backend.queries.company_queries import fetch_company_drug_payments
        return fetch_company_drug_payments(connection, company_id)
    except psycopg.Error as exc:
        logger.exception("Failed to query company drug payments.")
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc