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


def fetch_companies(
    connection: Connection[dict[str, Any]],
) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(COMPANY_SUMMARY_QUERY)
        return cursor.fetchall()