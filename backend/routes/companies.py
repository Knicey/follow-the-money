import logging
from typing import Annotated, Any

import psycopg
from fastapi import APIRouter, Depends, HTTPException, Path
from psycopg import Connection

from backend.database import get_connection
from backend.queries.company_queries import fetch_companies, fetch_company_payments

from backend.schema.response import CompanySummaryResponse, CompanyPaymentDoctorResponse, CompanyPaymentDrugResponse

logger = logging.getLogger(__name__)
router = APIRouter()

TAG = "Companies"


@router.get(
    "/companies",
    tags=[TAG],
    response_model=list[CompanySummaryResponse],
    summary="List companies",
    description="Return each company and the total amount of payments attributed to it.",
)
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


@router.get(
    "/companies/{company_id}/payments",
    tags=[TAG],
    response_model=list[CompanyPaymentDoctorResponse],
    summary="List a company's payments to doctors",
    description="Return payment records made by the specified company to doctors.",
)
def list_company_payments(
    company_id: Annotated[
        str,
        Path(description="The database identifier of the company."),
    ],
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


@router.get(
    "/companies/{company_id}/drug-payments",
    tags=[TAG],
    response_model=list[CompanyPaymentDrugResponse],
    summary="List a company's drug-related payments",
    description="Return drugs associated with payments made by the specified company, with payment counts and totals for each drug.",
)
def list_company_drug_payments(
    company_id: Annotated[
        str,
        Path(description="The database identifier of the company."),
    ],
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