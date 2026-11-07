from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.responses import RedirectResponse

from backend.database import create_database_pool
from backend.routes.doctors import router as doctors_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    pool = create_database_pool()
    try:
        pool.open(wait=True)
        app.state.db_pool = pool
        yield
    finally:
        pool.close()


app = FastAPI(title="Follow the Money API", lifespan=lifespan)
app.include_router(doctors_router)



#### TEMPORARY --- FOR DISPLAYING SWAGGER DOCS EASIER
#### TODO:  Actually make a homepage
@app.get("/", include_in_schema=False)
def redirect_home_to_docs() -> RedirectResponse:
    return RedirectResponse(url="/docs")
