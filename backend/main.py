from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from backend.database import create_database_pool
from backend.routes.doctors import router as doctors_router
from backend.routes.companies import router as companies_router
from backend.routes.pay_presc import router as pay_presc_router
from backend.routes.analytics import router as analytics_router



@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    pool = create_database_pool()
    try:
        pool.open(wait=True)
        app.state.db_pool = pool
        yield
    finally:
        pool.close()


app = FastAPI(
    title="Follow the Money API",
    description=(
        "Explore reported payments from drug and device companies to healthcare "
        "providers alongside Medicare prescription data. Use the endpoints below "
        "to retrieve doctor and company summaries, payment and prescription "
        "records, and analytics comparing payments with prescribing patterns."
    ),
    openapi_tags=[
        {
            "name": "Doctors",
            "description": "Look up doctors, their reported payments, and prescription totals.",
        },
        {
            "name": "Companies",
            "description": "Browse companies and inspect their payments to doctors and drug-related payments.",
        },
        {
            "name": "Payments and Prescriptions",
            "description": "Retrieve drugs associated with a payment record or prescription data for a doctor.",
        },
        {
            "name": "Analytics",
            "description": "Explore aggregated payment and prescribing analyses across doctors, companies, and drugs.",
        },
    ],
    lifespan=lifespan,
)
# let the react dev server call this API from the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
)
app.include_router(doctors_router)
app.include_router(companies_router)
app.include_router(pay_presc_router)
app.include_router(analytics_router)


#### TEMPORARY --- FOR DISPLAYING SWAGGER DOCS EASIER
#### TODO:  Actually make a homepage
@app.get("/", include_in_schema=False)
def redirect_home_to_docs() -> RedirectResponse:
    return RedirectResponse(url="/docs")
