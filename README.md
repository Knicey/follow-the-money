# follow-the-money
Drug and device companies pay doctors billions of dollars a year for meals, speaking fees, consulting, and travel. All of it is public, but what is the impact on what those doctors actually prescribe? Our app joins federal payment records with Medicare prescribing data so users can explore who gets paid, by whom, and whether payments line up with prescribing patterns.

## Data Cleaning

The cleaning notebook is [data_clean/pharma_drug_submission.ipynb](data_clean/pharma_drug_submission.ipynb). Raw data is not committed (`data_clean/data/` is git-ignored), so download the files and place them in `data_clean/data/` with the exact names below before running it.

| File name | Source |
| --- | --- |
| `General_Payments_2024.csv` | CMS Open Payments, General Payment Data, program year 2024 |
| `Med_Prescribers_2024.csv` | CMS Medicare Part D Prescribers, by Provider and Drug, 2024 |

Expected layout:

```text
data_clean/
├── pharma_drug_submission.ipynb
├── requirements.txt       # Python dependencies
├── data/                  # raw inputs (git-ignored)
│   ├── General_Payments_2024.csv
│   └── Med_Prescribers_2024.csv
└── output/                # created by the notebook
    ├── cleaned_companies.csv
    ├── cleaned_doctors.csv
    ├── cleaned_prescriptions.csv
    └── cleaned_drugs.csv
```

Notes:
- File names must match the `DATASET` mapping in the notebook; rename downloads if needed.
- Files are read as CSV in chunks of 500,000 rows.
- From `data_clean/`, install the Python dependencies with `pip install -r requirements.txt`.
- Run the notebook from `data_clean/`, since paths (`./data`, `./output`) are relative.

