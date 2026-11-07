from typing import Any

from psycopg import Connection


DOCTOR_PAYMENTS_ANALYTICS_QUERY = """
WITH DoctorPayments AS (
    SELECT
        p.npi,
        SUM(p.amount) AS total_payments,
        SUM(p.number_of_payments) AS payment_count,
        COUNT(DISTINCT p.company_id) AS company_count
    FROM payment p
    GROUP BY p.npi
),
DoctorPrescriptions AS (
    SELECT
        pr.npi,
        SUM(pr.total_claims) AS total_claims,
        SUM(pr.total_drug_cost) AS total_drug_cost,
        SUM(pr.total_beneficiaries) AS total_beneficiaries,
        COUNT(DISTINCT pr.drug_id) AS drug_count
    FROM prescription pr
    GROUP BY pr.npi
)
SELECT
    d.npi,
    d.first_name,
    d.last_name,
    d.specialty,
    d.primary_type,
    d.city,
    d.state,
    COALESCE(dp.total_payments, 0) AS total_payments,
    COALESCE(dp.payment_count, 0) AS payment_count,
    COALESCE(dp.company_count, 0) AS company_count,
    COALESCE(dr.total_claims, 0) AS total_claims,
    COALESCE(dr.total_drug_cost, 0) AS total_drug_cost,
    COALESCE(dr.total_beneficiaries, 0) AS total_beneficiaries,
    COALESCE(dr.drug_count, 0) AS drug_count
FROM doctor d
LEFT JOIN DoctorPayments dp ON dp.npi = d.npi
LEFT JOIN DoctorPrescriptions dr ON dr.npi = d.npi
ORDER BY total_payments DESC;

"""

COMPANY_PAYMENTS_ANALYTICS_QUERY = """
WITH CompanySummary AS (
    SELECT
        c.company_id,
        c.company_name,
        SUM(p.amount) AS total_amount,
        COUNT(DISTINCT p.npi) AS doctors_paid,
        COUNT(p.record_id) AS payment_records,
        SUM(p.number_of_payments) AS individual_payments
    FROM company c
    LEFT JOIN payment p
        ON p.company_id = c.company_id
    GROUP BY c.company_id, c.company_name
),
PaymentCategories AS (
    SELECT
        company_id,
        nature_of_payments,
        SUM(amount) AS category_amount
    FROM payment
    GROUP BY company_id, nature_of_payments
),
CompanyDrugs AS (
    SELECT DISTINCT
        p.company_id,
        d.drug_id,
        d.brand_name,
        d.generic_name
    FROM payment p
    JOIN paymentbydrug pbd
        ON pbd.record_id = p.record_id
    JOIN drug d
        ON d.drug_id = pbd.drug_id
)
SELECT
    cs.company_id,
    cs.company_name,
    cs.total_amount,
    cs.doctors_paid,
    cs.payment_records,
    cs.individual_payments,
    COALESCE(
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'category', pc.nature_of_payments,
                'amount', pc.category_amount
            )
        ) FILTER (
            WHERE pc.nature_of_payments IS NOT NULL
        ),
        '[]'::jsonb
    ) AS payment_breakdown,
    COALESCE(
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'drug_id', cd.drug_id,
                'brand_name', cd.brand_name,
                'generic_name', cd.generic_name
            )
        ) FILTER (
            WHERE cd.drug_id IS NOT NULL
        ),
        '[]'::jsonb
    ) AS associated_drugs
FROM CompanySummary cs
LEFT JOIN PaymentCategories pc
    ON pc.company_id = cs.company_id
LEFT JOIN CompanyDrugs cd
    ON cd.company_id = cs.company_id
GROUP BY
    cs.company_id,
    cs.company_name,
    cs.total_amount,
    cs.doctors_paid,
    cs.payment_records,
    cs.individual_payments
ORDER BY cs.total_amount DESC NULLS LAST;
"""


DOCTOR_HIGH_PAYMENTS_ANALYTICS_QUERY = """
WITH DoctorTotals AS (
    SELECT
        d.npi,
        d.first_name,
        d.last_name,
        d.specialty,
        d.state,
        SUM(p.amount) AS total_payments
    FROM doctor d
    JOIN payment p ON p.npi = d.npi
    GROUP BY
        d.npi,
        d.first_name,
        d.last_name,
        d.specialty,
        d.state
),
SpecialtyBenchmarks AS (
    SELECT
        specialty,
        COUNT(*) AS doctors_with_payments,
        percentile_cont(0.50)
            WITHIN GROUP (ORDER BY total_payments)
            AS median_payment,
        percentile_cont(0.95)
            WITHIN GROUP (ORDER BY total_payments)
            AS p95_payment,
        AVG(total_payments) AS avg_payment
    FROM DoctorTotals
    WHERE specialty IS NOT NULL
    GROUP BY specialty
    HAVING COUNT(*) >= 10
)
SELECT
    dt.npi,
    dt.first_name,
    dt.last_name,
    dt.specialty,
    dt.state,
    dt.total_payments,
    sb.doctors_with_payments,
    ROUND(sb.median_payment::numeric, 2)
        AS specialty_median,
    ROUND(sb.avg_payment::numeric, 2)
        AS specialty_average,
    ROUND(sb.p95_payment::numeric, 2)
        AS specialty_95th_percentile,
    ROUND(
        (dt.total_payments / NULLIF(sb.median_payment, 0))::numeric,
        2
    ) AS multiple_of_median
FROM DoctorTotals dt
JOIN SpecialtyBenchmarks sb
    ON sb.specialty = dt.specialty
WHERE dt.total_payments > sb.p95_payment
ORDER BY dt.total_payments DESC;

"""


PRESC_BETWEEN_DOCTORS_ANALYTICS_QUERY = """
WITH DoctorPaymentStatus AS (
    SELECT
        d.npi,
        d.specialty,
        d.state,
        EXISTS (
            SELECT 1
            FROM payment p
            WHERE p.npi = d.npi
        ) AS received_payment
    FROM doctor d
),
PrescribingSummary AS (
    SELECT
        dps.specialty,
        dps.state,
        dps.received_payment,
        pr.drug_id,
        COUNT(DISTINCT pr.npi) AS prescribing_doctors,
        SUM(pr.total_claims) AS total_claims,
        AVG(pr.total_claims::numeric) AS avg_claims_per_prescriber,
        SUM(pr.total_drug_cost) AS total_drug_cost,
        SUM(pr.total_drug_cost)
            / NULLIF(SUM(pr.total_claims), 0)
            AS cost_per_claim
    FROM DoctorPaymentStatus dps
    JOIN prescription pr ON pr.npi = dps.npi
    GROUP BY
        dps.specialty,
        dps.state,
        dps.received_payment,
        pr.drug_id
)
SELECT
    ps.specialty,
    ps.state,
    dr.drug_id,
    dr.brand_name,
    dr.generic_name,
    CASE
        WHEN ps.received_payment THEN 'Paid'
        ELSE 'Unpaid'
    END AS payment_status,
    ps.prescribing_doctors,
    ps.total_claims,
    ROUND(ps.avg_claims_per_prescriber, 2)
        AS avg_claims_per_prescriber,
    ROUND(ps.total_drug_cost, 2) AS total_drug_cost,
    ROUND(ps.cost_per_claim, 2) AS cost_per_claim
FROM PrescribingSummary ps
JOIN drug dr ON dr.drug_id = ps.drug_id
ORDER BY
    ps.specialty,
    dr.brand_name,
    ps.state,
    ps.received_payment DESC;

"""


def fetch_doctor_payments_analytics(connection: Connection[Any]) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(DOCTOR_PAYMENTS_ANALYTICS_QUERY)
        return cursor.fetchall()


def fetch_company_payments_analytics(connection: Connection[Any]) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(COMPANY_PAYMENTS_ANALYTICS_QUERY)
        return cursor.fetchall()

def fetch_doctor_high_payments_analytics(connection: Connection[Any]) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(DOCTOR_HIGH_PAYMENTS_ANALYTICS_QUERY)
        return cursor.fetchall()

def fetch_presc_between_doctors_analytics(connection: Connection[Any]) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(PRESC_BETWEEN_DOCTORS_ANALYTICS_QUERY)
        return cursor.fetchall()