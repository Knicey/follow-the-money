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
