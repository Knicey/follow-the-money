from typing import Any

from psycopg import Connection


PAYMENT_BY_DRUG_QUERY = """
SELECT d.drug_id, d.brand_name
FROM paymentbydrug pd
JOIN drug d ON d.drug_id = pd.drug_id
WHERE pd.record_id = %s
ORDER BY d.brand_name;
"""

PRESCRIPTION_BY_DOCTOR_QUERY = """
SELECT rx.drug_id, d.brand_name, d.generic_name,
    rx.total_claims, rx.total_day_supply, rx.total_drug_cost, 
    rx.total_beneficiaries
FROM prescription rx
JOIN drug d ON d.drug_id = rx.drug_id
WHERE rx.npi = %s
ORDER BY rx.total_claims DESC NULLS LAST, d.brand_name;
"""



def fetch_payment_by_drug(connection: Connection[Any], record_id: int) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(PAYMENT_BY_DRUG_QUERY, (record_id,))
        return cursor.fetchall()


def fetch_prescription_by_doctor(connection: Connection[Any], npi: int) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(PRESCRIPTION_BY_DOCTOR_QUERY, (npi,))
        return cursor.fetchall()