import pandas as pd
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = PROJECT_DIR / "dataset" / "raw" / "segment_level_data.csv"
OUTPUT_PATH = PROJECT_DIR / "results" / "dataset_profile.txt"

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

report = []

report.append("========== YatraIQ DATASET PROFILE ==========")

report.append(f"\nTotal rows: {df.shape[0]}")
report.append(f"Total columns: {df.shape[1]}")

report.append("\nCOLUMN NAMES AND DATA TYPES")
report.append(df.dtypes.to_string())

report.append("\nFIRST FIVE RECORDS")
report.append(df.head().to_string(index=False))

report.append("\nMISSING VALUES")
report.append(df.isnull().sum().to_string())

report.append("\nDUPLICATE RECORDS")
report.append(str(df.duplicated().sum()))

report.append("\nNUMERICAL COLUMN SUMMARY")
report.append(df.describe().to_string())

report.append("\n========== PROFILE COMPLETED ==========")

OUTPUT_PATH.write_text("\n".join(report), encoding="utf-8")

print("\nDataset profile generated successfully!")
print("Report saved at:", OUTPUT_PATH)

print("\nTOTAL ROWS:", df.shape[0])
print("TOTAL COLUMNS:", df.shape[1])
print("\nCOLUMN NAMES:")
print(df.columns.tolist())