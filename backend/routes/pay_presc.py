import logging
from typing import Annotated, Any

import psycopg
from fastapi import APIRouter, Depends, HTTPException, Path
from psycopg import Connection

from backend.database import get_connection
from backend.queries.pay_presc_queries import fetch_payment_by_drug, fetch_prescription_by_doctor

from backend.schema.response import  PaymentByDrugResponse, PrescriptionByDoctorResponse

logger = logging.getLogger(__name__)
router = APIRouter()

TAG = "Payments and Prescriptions"


@router.get(
    "/payment-by-drug/{record_id}",
    tags=[TAG],
    response_model=list[PaymentByDrugResponse],
    summary="List drugs linked to a payment",
    description="Return the drugs associated with the specified payment record.",
)
def get_payment_by_drug(
        record_id: Annotated[
            int,
            Path(description="The unique identifier of the payment record."),
        ],
        connection: Annotated[
                Connection[dict[str, Any]],
                Depends(get_connection),
            ],
    ) -> list[PaymentByDrugResponse]:
    try:
        return fetch_payment_by_drug(connection, record_id)
    except Exception as exc:
        logger.error(f"Error fetching payment by drug for record_id {record_id}: {exc}")
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc
    

@router.get(
    "/prescription-by-doctor/{npi}",
    tags=[TAG],
    response_model=list[PrescriptionByDoctorResponse],
    summary="List a doctor's prescriptions",
    description="Return prescription totals by drug for the specified doctor, ordered by claim volume.",
)
def get_prescription_by_doctor(
        npi: Annotated[
            int,
            Path(description="The doctor's National Provider Identifier (NPI)."),
        ],
        connection: Annotated[
                Connection[dict[str, Any]],
                Depends(get_connection),
            ],
    ) -> list[PrescriptionByDoctorResponse]:
    try:
        return fetch_prescription_by_doctor(connection, npi)
    except Exception as exc:
        logger.error(f"Error fetching prescription by doctor for npi {npi}: {exc}")
        raise HTTPException(
            status_code=503,
            detail="Unable to query the PostgreSQL database.",
        ) from exc