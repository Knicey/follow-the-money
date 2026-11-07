import logging
from typing import Annotated, Any

import psycopg
from fastapi import APIRouter, Depends, HTTPException
from psycopg import Connection

from backend.database import get_connection
from backend.queries.pay_presc_queries import fetch_payment_by_drug, fetch_prescription_by_doctor

from backend.schema.response import  PaymentByDrugResponse, PrescriptionByDoctorResponse

logger = logging.getLogger(__name__)
router = APIRouter()

TAG = "Payments and Prescriptions"


@router.get("/payment-by-drug/{record_id}", tags=[TAG], response_model=list[PaymentByDrugResponse])
def get_payment_by_drug(
        record_id: int, 
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
    

@router.get("/prescription-by-doctor/{npi}", tags=[TAG], response_model=list[PrescriptionByDoctorResponse])
def get_prescription_by_doctor(
        npi: int,
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