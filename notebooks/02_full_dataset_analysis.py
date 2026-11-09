import pandas as pd
from pathlib import Path

# YatraIQ - Full Dataset Analysis

PROJECT_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = PROJECT_DIR / "dataset" / "raw" / "segment_level_data.csv"

print("\nLoading complete dataset...")

df = pd.read_csv(DATA_PATH)

print("\n========== YatraIQ FULL DATASET REPORT ==========")

print("\n1. TOTAL ROWS AND COLUMNS")
print("Rows:", df.shape[0])
print("Columns:", df.shape[1])

print("\n2. COLUMN NAMES")
for column in df.columns:
    print(column)

print("\n3. DATA TYPES")
print(df.dtypes)

print("\n4. MISSING VALUES")
print(df.isnull().sum())

print("\n5. DUPLICATE ROWS")
print(df.duplicated().sum())

print("\n6. FIRST FIVE RECORDS")
print(df.head().to_string(index=False))

print("\n7. NUMERICAL SUMMARY")
print(df.describe().to_string())

print("\n========== ANALYSIS COMPLETED ==========")