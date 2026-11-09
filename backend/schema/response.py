from pydantic import BaseModel, Field


class DoctorSummaryResponse(BaseModel):
    """Response model for doctor summary."""
    npi: int = Field(description="The doctor's National Provider Identifier (NPI).")
    first_name: str = Field(description="The doctor's first name.")
    last_name: str = Field(description="The doctor's last name.")
    specialty: str | None = Field(description="The doctor's medical specialty, if available.")
    city: str | None = Field(description="The doctor's city, if available.")
    state: str | None = Field(description="The two-letter state code for the doctor's location, if available.")
    total_payments: float = Field(description="Total reported payment amount associated with the doctor.")
    total_drug_cost: float = Field(description="Total reported prescription drug cost for the doctor.")

class DoctorPaymentResponse(BaseModel):
    """Response model for doctor payment."""
    record_id: int = Field(description="Unique identifier of the payment record.")
    company_id: str = Field(description="Identifier of the company that made the payment.")
    company_name: str = Field(description="Name of the company that made the payment.")
    amount: float = Field(description="Reported amount for the payment record.")
    number_of_payments: int | None = Field(description="The number of discrete payments being reported in the \"Total Amount of Payment\".")
    nature_of_payments: str | None = Field(description="Category or stated purpose of the payment.")
    form_of_payments: str | None = Field(description="Form in which the payment or transfer was provided.")

class CompanySummaryResponse(BaseModel):
    """Response model for company summary."""
    company_id: str = Field(description="Unique identifier of the company.")
    company_name: str = Field(description="Name of the company.")
    total_payments: float = Field(description="Total reported payment amount made by the company.")


class CompanyPaymentDoctorResponse(BaseModel):
    """Response model for company payment by doctor."""
    record_id: int = Field(description="Unique identifier of the payment record.")
    npi: int = Field(description="The doctor's National Provider Identifier (NPI).")
    first_name: str = Field(description="The doctor's first name.")
    last_name: str = Field(description="The doctor's last name.")
    specialty: str = Field(description="The doctor's medical specialty.")
    state: str = Field(description="The two-letter state code for the doctor's location.")
    amount: float = Field(description="Reported amount for the payment record.")
    number_of_payments: int = Field(description="Number of individual payments represented by this record.")
    nature_of_payments: str = Field(description="Category or stated purpose of the payment.")
    form_of_payments: str = Field(description="Form in which the payment or transfer was provided.")


class CompanyPaymentDrugResponse(BaseModel):
    """Response model for company payment by drug."""
    drug_id: int = Field(description="Unique identifier of the drug.")
    brand_name: str = Field(description="Brand name of the drug.")
    n_related_payments: int = Field(description="Number of payment records associated with this drug.")
    total_related_payments: float = Field(description="Sum of amounts from payment records associated with this drug.")


class PaymentByDrugResponse(BaseModel):
    """Response model for payment by drug."""
    drug_id: int = Field(description="Unique identifier of the drug.")
    brand_name: str = Field(description="Brand name of the drug.")


class PrescriptionByDoctorResponse(BaseModel):
    """Response model for prescription by doctor."""
    drug_id: int = Field(description="Unique identifier of the prescribed drug.")
    brand_name: str = Field(description="Brand name of the drug.")
    generic_name: str | None = Field(description="Generic name of the drug.")
    total_claims: int | None = Field(description="Total prescription claims for this drug.")
    total_day_supply: float | None = Field(description="Total days of medication supplied.")
    total_drug_cost: float | None = Field(description="Total reported cost of prescriptions for this drug.")
    total_beneficiaries: int | None = Field(description="Number of beneficiaries, if reported.")


class DoctorPaymentsAnalyticsResponse(BaseModel):
    """Response model for doctor payments analytics."""
    npi: int = Field(description="The doctor's National Provider Identifier (NPI).")
    first_name: str = Field(description="The doctor's first name.")
    last_name: str = Field(description="The doctor's last name.")
    specialty: str = Field(description="The doctor's medical specialty.")
    primary_type: str = Field(description="The doctor's primary provider type.")
    city: str = Field(description="The doctor's city.")
    state: str = Field(description="The two-letter state code for the doctor's location.")
    total_payments: float = Field(description="Total reported payment amount associated with the doctor.")
    payment_count: int = Field(description="Total number of individual payments reported for the doctor.")
    company_count: int = Field(description="Number of distinct companies that paid the doctor.")
    total_claims: int = Field(description="Total prescription claims associated with the doctor.")
    total_drug_cost: float = Field(description="Total reported prescription drug cost for the doctor.")
    total_beneficiaries: int = Field(description="Total reported beneficiaries across the doctor's prescriptions.")
    drug_count: int = Field(description="Number of distinct drugs prescribed by the doctor.")


class CompanyPaymentBreakdownResponse(BaseModel):
    category: str = Field(description="Nature-of-payment category.")
    amount: float | None = Field(description="Total payment amount in this category, if available.")


class CompanyAssociatedDrugResponse(BaseModel):
    drug_id: int = Field(description="Unique identifier of the drug.")
    brand_name: str = Field(description="Brand name of the drug.")
    generic_name: str | None = Field(description="Generic name of the drug, if available.")


class CompanyPaymentsAnalyticsResponse(BaseModel):
    """Response model for company payments analytics."""
    company_id: str = Field(description="Unique identifier of the company.")
    company_name: str = Field(description="Name of the company.")
    total_amount: float | None = Field(description="Total reported payment amount, if available.")
    doctors_paid: int = Field(description="Number of distinct doctors paid by the company.")
    payment_records: int = Field(description="Number of payment records for the company.")
    individual_payments: int | None = Field(description="Sum of individual payments represented, if available.")
    payment_breakdown: list[CompanyPaymentBreakdownResponse] = Field(description="Payment totals grouped by nature-of-payment category.")
    associated_drugs: list[CompanyAssociatedDrugResponse] = Field(description="Distinct drugs associated with the company's payment records.")



class DoctorHighPaymentsAnalyticsResponse(BaseModel):
    """Response model for doctor high payments analytics."""
    npi: int = Field(description="The doctor's National Provider Identifier (NPI).")
    first_name: str = Field(description="The doctor's first name.")
    last_name: str = Field(description="The doctor's last name.")
    specialty: str = Field(description="The doctor's medical specialty.")
    state: str = Field(description="The two-letter state code for the doctor's location.")
    total_payments: float = Field(description="Total reported payment amount associated with the doctor.")
    doctors_with_payments: int = Field(description="Number of doctors with payments in this specialty benchmark.")
    specialty_median: float = Field(description="Median total payment amount for doctors in this specialty.")
    specialty_average: float = Field(description="Average total payment amount for doctors in this specialty.")
    specialty_95th_percentile: float = Field(description="95th-percentile total payment amount for doctors in this specialty.")
    multiple_of_median: float = Field(description="Doctor's total payments divided by the specialty median.")


class PrescriptionBetweenDoctorsAnalyticsResponse(BaseModel):
    """Response model for prescription between doctors analytics."""
    specialty: str = Field(description="Medical specialty of the doctors in this group.")
    state: str = Field(description="Two-letter state code for the doctors in this group.")
    drug_id: int = Field(description="Unique identifier of the drug.")
    brand_name: str = Field(description="Brand name of the drug.")
    generic_name: str = Field(description="Generic name of the drug.")
    payment_status: str = Field(description="Whether doctors in this group received a reported payment: Paid or Unpaid.")
    prescribing_doctors: int = Field(description="Number of distinct doctors in this group who prescribed the drug.")
    total_claims: int = Field(description="Total prescription claims for this drug in the group.")
    avg_claims_per_prescriber: float = Field(description="Average number of claims per prescribing doctor in the group.")
    total_drug_cost: float = Field(description="Total reported prescription drug cost for this drug in the group.")
    cost_per_claim: float = Field(description="Average drug cost per claim for this drug in the group.")