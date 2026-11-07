from typing import Any

from psycopg import Connection

COMPANY_SUMMARY_QUERY = """
SELECT c.company_id, c.company_name,
       COALESCE(SUM(p.amount), 0) AS total_payments
FROM company c
LEFT JOIN payment p ON p.company_id = c.company_id
GROUP BY c.company_id, c.company_name
ORDER BY c.company_name, c.company_id;
"""


COMPANY_PAYMENTS_DOCTOR_QUERY = """
SELECT p.record_id, p.npi, dr.first_name, dr.last_name,
       dr.specialty, dr.state,
       p.amount, p.number_of_payments, p.nature_of_payments,
       p.form_of_payments
FROM payment p
JOIN doctor dr ON dr.npi = p.npi
WHERE p.company_id = %s
ORDER BY p.amount DESC NULLS LAST, p.record_id;
"""

COMPANY_PAYMENTS_DRUG_QUERY = """
SELECT d.drug_id, d.brand_name,
       COUNT(*)      AS n_related_payments,
       SUM(p.amount) AS total_related_payments
FROM payment p
JOIN paymentbydrug pd ON pd.record_id = p.record_id
JOIN drug d          ON d.drug_id   = pd.drug_id
WHERE p.company_id = %s
GROUP BY d.drug_id, d.brand_name
ORDER BY total_related_payments DESC NULLS LAST;
"""


def fetch_companies(
    connection: Connection[dict[str, Any]],
) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(COMPANY_SUMMARY_QUERY)
        return cursor.fetchall()

def fetch_company_payments(
    connection: Connection[dict[str, Any]],
    company_id: str,
) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(COMPANY_PAYMENTS_DOCTOR_QUERY, (company_id,))
        return cursor.fetchall()

def fetch_company_drug_payments(
    connection: Connection[dict[str, Any]],
    company_id: str,
) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(COMPANY_PAYMENTS_DRUG_QUERY, (company_id,))
        return cursor.fetchall()