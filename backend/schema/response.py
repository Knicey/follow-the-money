from pydantic import BaseModel
from typing import List


class DoctorSummaryResponse(BaseModel):
    """Response model for doctor summary."""
    npi: int
    first_name: str
    last_name: str
    specialty: str
    state: str
    total_payments: float


class DoctorPaymentResponse(BaseModel):
    """Response model for doctor payment."""
    record_id: int
    company_id: str
    company_name: str
    amount: float
    nature_of_payments: str
    form_of_payments: str

class CompanySummaryResponse(BaseModel):
    """Response model for company summary."""
    company_id: str
    company_name: str
    total_payments: float


class CompanyPaymentDoctorResponse(BaseModel):
    """Response model for company payment by doctor."""
    record_id: int
    npi: int
    first_name: str
    last_name: str
    specialty: str
    state: str
    amount: float
    number_of_payments: int
    nature_of_payments: str
    form_of_payments: str


class CompanyPaymentDrugResponse(BaseModel):
    """Response model for company payment by drug."""
    drug_id: int
    brand_name: str
    n_related_payments: int
    total_related_payments: float


class PaymentByDrugResponse(BaseModel):
    """Response model for payment by drug."""
    drug_id: int
    brand_name: str


class PrescriptionByDoctorResponse(BaseModel):
    """Response model for prescription by doctor."""
    drug_id: int
    brand_name: str
    generic_name: str
    total_claims: int
    total_day_supply: float
    total_drug_cost: float
    total_beneficiaries: int | None


class DoctorPaymentsAnalyticsResponse(BaseModel):
    """Response model for doctor payments analytics."""
    npi: int
    first_name: str
    last_name: str
    specialty: str
    primary_type: str
    city: str
    state: str
    total_payments: float
    payment_count: int
    company_count: int
    total_claims: int
    total_drug_cost: float
    total_beneficiaries: int
    drug_count: int


class CompanyPaymentBreakdownResponse(BaseModel):
    category: str
    amount: float | None


class CompanyAssociatedDrugResponse(BaseModel):
    drug_id: int
    brand_name: str
    generic_name: str | None


class CompanyPaymentsAnalyticsResponse(BaseModel):
    """Response model for company payments analytics."""
    company_id: str
    company_name: str
    total_amount: float | None
    doctors_paid: int
    payment_records: int
    individual_payments: int | None
    payment_breakdown: list[CompanyPaymentBreakdownResponse]
    associated_drugs: list[CompanyAssociatedDrugResponse]



class DoctorHighPaymentsAnalyticsResponse(BaseModel):
    """Response model for doctor high payments analytics."""
    npi: int
    first_name: str
    last_name: str
    specialty: str
    state: str
    total_payments: float
    doctors_with_payments: int
    specialty_median: float
    specialty_average: float
    specialty_95th_percentile: float
    multiple_of_median: float


class PrescriptionBetweenDoctorsAnalyticsResponse(BaseModel):
    """Response model for prescription between doctors analytics."""
    specialty: str
    state: str
    drug_id: int
    brand_name: str
    generic_name: str
    payment_status: str
    prescribing_doctors: int
    total_claims: int 
    avg_claims_per_prescriber: float
    total_drug_cost: float
    cost_per_claim: float