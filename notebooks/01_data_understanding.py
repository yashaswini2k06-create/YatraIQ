import pandas as pd
from pathlib import Path

# ==========================================
# YatraIQ - DATASET UNDERSTANDING
# ==========================================

PROJECT_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = (
    PROJECT_DIR
    / "dataset"
    / "raw"
    / "segment_level_data.csv"
)

print("\n====================================")
print("       YatraIQ PROJECT")
print("       DATASET ANALYSIS")
print("====================================")

# 1. Check dataset availability

if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found at: {DATA_PATH}"
    )

print("\nDataset found successfully!")

# 2. Load first five records

df = pd.read_csv(DATA_PATH, nrows=5)

# 3. Display first five records

print("\n1. FIRST FIVE RECORDS")
print(df.to_string(index=False))

# 4. Display dataset dimensions (preview)

print("\n2. PREVIEW SHAPE")
print("Rows and columns:", df.shape)

# 5. Display all column names

print("\n3. ALL COLUMN NAMES")

for column in df.columns:
    print("-", column)

# 6. Display data types

print("\n4. DATA TYPES")
print(df.dtypes)

# 7. Display dataset information

print("\n5. DATASET INFORMATION")
df.info()

# 8. Display missing values in preview

print("\n6. MISSING VALUES IN PREVIEW")
print(df.isnull().sum())

print("\n====================================")
print("       ANALYSIS COMPLETED")
print("====================================")