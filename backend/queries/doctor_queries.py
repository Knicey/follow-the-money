from typing import Any

from psycopg import Connection

DOCTOR_SUMMARY_QUERY = """
WITH pay AS (
    SELECT npi, SUM(amount) AS total_payments
    FROM payment
    GROUP BY npi
), rx AS (
    SELECT npi, SUM(total_drug_cost) AS total_drug_cost
    FROM prescription
    GROUP BY npi
)
SELECT dr.npi, dr.first_name, dr.last_name, dr.specialty, dr.city, dr.state,
       COALESCE(pay.total_payments, 0) AS total_payments,
       COALESCE(rx.total_drug_cost, 0) AS total_drug_cost
FROM doctor dr
LEFT JOIN pay ON pay.npi = dr.npi
LEFT JOIN rx ON rx.npi = dr.npi
ORDER BY dr.last_name, dr.first_name, dr.npi;
"""

DOCTOR_PAYMENTS_QUERY = """
SELECT p.record_id, p.company_id, c.company_name,
       p.amount, p.number_of_payments, p.nature_of_payments,
       p.form_of_payments
FROM payment p
JOIN company c ON c.company_id = p.company_id
WHERE p.npi = %s
ORDER BY p.amount DESC NULLS LAST, p.record_id;
"""

DOCTOR_DETAIL_QUERY = """
SELECT dr.npi, dr.first_name, dr.last_name, dr.specialty, dr.city, dr.state,
       COALESCE((SELECT SUM(amount) FROM payment WHERE npi = dr.npi), 0) AS total_payments,
       COALESCE((SELECT SUM(total_drug_cost) FROM prescription WHERE npi = dr.npi), 0) AS total_drug_cost
FROM doctor dr
WHERE dr.npi = %s;
"""

DOCTOR_PAID_PRESCRIBED_DRUGS_QUERY = """
WITH paid AS (
    SELECT pd.drug_id,
           SUM(p.number_of_payments) AS n_related_payments,
           SUM(p.amount) AS total_related_payments
    FROM payment p
    JOIN paymentbydrug pd ON pd.record_id = p.record_id
    WHERE p.npi = %s
    GROUP BY pd.drug_id
), rx AS (
    SELECT drug_id,
           SUM(total_drug_cost) AS total_drug_cost,
           SUM(total_beneficiaries) AS total_beneficiaries
    FROM prescription
    WHERE npi = %s
    GROUP BY drug_id
)
SELECT d.drug_id, d.brand_name, d.generic_name,
       paid.n_related_payments, paid.total_related_payments,
       rx.total_drug_cost, rx.total_beneficiaries
FROM paid
JOIN rx ON rx.drug_id = paid.drug_id
JOIN drug d ON d.drug_id = paid.drug_id
ORDER BY paid.total_related_payments DESC NULLS LAST, d.brand_name;
"""


def fetch_doctors(connection: Connection[dict[str, Any]]) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(DOCTOR_SUMMARY_QUERY)
        return cursor.fetchall()


def fetch_doctor_payments(
    connection: Connection[dict[str, Any]],
    npi: int,
) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(DOCTOR_PAYMENTS_QUERY, (npi,))
        return cursor.fetchall()

def fetch_doctor(
    connection: Connection[dict[str, Any]],
    npi: int,
) -> dict[str, Any] | None:
    with connection.cursor() as cursor:
        cursor.execute(DOCTOR_DETAIL_QUERY, (npi,))
        return cursor.fetchone()

def fetch_doctor_paid_prescribed_drugs(
    connection: Connection[dict[str, Any]],
    npi: int,
) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(DOCTOR_PAID_PRESCRIBED_DRUGS_QUERY, (npi, npi))
        return cursor.fetchall()
