import logging
from typing import Annotated, Any

import psycopg
from fastapi import APIRouter, Depends, HTTPException
from psycopg import Connection

from backend.database import get_connection
from backend.queries.analytics_queries import fetch_doctor_payments_analytics, fetch_company_payments_analytics, fetch_doctor_high_payments_analytics, fetch_presc_between_doctors_analytics

from backend.schema.response import DoctorHighPaymentsAnalyticsResponse, DoctorPaymentsAnalyticsResponse, CompanyPaymentsAnalyticsResponse, PrescriptionBetweenDoctorsAnalyticsResponse

logger = logging.getLogger(__name__)
router = APIRouter()

TAG = "Analytics"


@router.get(
    "/doctor-payments",
    tags=[TAG],
    response_model=list[DoctorPaymentsAnalyticsResponse],
    summary="Get doctor payment and prescribing analytics",
    description="Return payment totals and prescribing statistics for each doctor.",
)
def list_doctor_payments(
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[DoctorPaymentsAnalyticsResponse]:
    """Return all doctor payments analytics."""
    try:
        return fetch_doctor_payments_analytics(connection)
    except psycopg.Error as exc:
        logger.exception("Failed to query doctor payments analytics.")
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc



@router.get(
    "/company-payments",
    tags=[TAG],
    response_model=list[CompanyPaymentsAnalyticsResponse],
    summary="Get company payment analytics",
    description="Return payment totals and counts for each company, with payment-category breakdowns and associated drugs.",
)
def list_company_payments(
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[CompanyPaymentsAnalyticsResponse]:
    """Return all company payments analytics."""
    try:
        return fetch_company_payments_analytics(connection)
    except psycopg.Error as exc:
        logger.exception("Failed to query company payments analytics.")
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc



@router.get(
    "/doctor-high-payments",
    tags=[TAG],
    response_model=list[DoctorHighPaymentsAnalyticsResponse],
    summary="Find doctors with high payments",
    description="Return doctors whose total payments exceed the 95th percentile for their specialty, with specialty benchmarks.",
)
def list_doctor_high_payments(
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[DoctorHighPaymentsAnalyticsResponse]:
    """Return all doctor high payments analytics."""
    try:
        return fetch_doctor_high_payments_analytics(connection)
    except psycopg.Error as exc:
        logger.exception("Failed to query doctor high payments analytics.")
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc


@router.get(
    "/prescription-between-doctors",
    tags=[TAG],
    response_model=list[PrescriptionBetweenDoctorsAnalyticsResponse],
    summary="Compare prescribing by payment status",
    description="Compare prescription volume and drug costs by specialty, state, and whether doctors received payments.",
)
def list_prescription_between_doctors(
    connection: Annotated[
        Connection[dict[str, Any]],
        Depends(get_connection),
    ],
) -> list[PrescriptionBetweenDoctorsAnalyticsResponse]:
    """Return all prescription between doctors analytics."""
    try:
        return fetch_presc_between_doctors_analytics(connection)
    except psycopg.Error as exc:
        logger.exception("Failed to query prescription between doctors analytics.")
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc