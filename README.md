# follow-the-money
Drug and device companies pay doctors billions of dollars a year for meals, speaking fees, consulting, and travel. All of it is public, but what is the impact on what those doctors actually prescribe? Our app joins federal payment records with Medicare prescribing data so users can explore who gets paid, by whom, and whether payments line up with prescribing patterns.

## Backend

The API uses FastAPI and connects to PostgreSQL using psycopg. FastAPI provides an interactive Swagger UI for trying the endpoints.

1. Create a Python virtual environment and install the dependencies from the project root:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   ```

2. Copy `.env.example` to `.env` and set `RDS_HOST`, `RDS_PORT`, `RDS_DB`, `RDS_USER`, and `RDS_PASSWORD`.
3. Start the development server from the project root:

   ```powershell
   .\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload
   ```

   Or, in PowerShell, use the launcher script:

   ```powershell
   .\run.ps1
   ```

Open http://127.0.0.1:8000/docs to try the endpoints in Swagger UI.
