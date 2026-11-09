import pandas as pd
from pathlib import Path

# YatraIQ - Data Cleaning

PROJECT_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = PROJECT_DIR / "dataset" / "raw" / "segment_level_data.csv"

OUTPUT_PATH = PROJECT_DIR / "dataset" / "processed" / "cleaned_bus_data.csv"

print("\nLoading YatraIQ dataset...")

df = pd.read_csv(DATA_PATH)

original_count = len(df)

# Convert travel time to numeric
df["run_time_in_seconds"] = pd.to_numeric(
    df["run_time_in_seconds"], errors="coerce"
)

# Remove invalid travel-time records
df = df.dropna(subset=["run_time_in_seconds"])
df = df[df["run_time_in_seconds"] > 0]

# Remove duplicate records
df = df.drop_duplicates()

# Save cleaned data
df.to_csv(OUTPUT_PATH, index=False)

print("\n========== CLEANING REPORT ==========")
print("Original records:", original_count)
print("Cleaned records:", len(df))
print("Removed records:", original_count - len(df))
print("Remaining missing travel times:",
      df["run_time_in_seconds"].isnull().sum())

print("\nCleaned dataset saved at:")
print(OUTPUT_PATH)

print("\nDATA CLEANING COMPLETED!")