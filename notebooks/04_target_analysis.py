import pandas as pd
from pathlib import Path

# YatraIQ - Travel Time Target Analysis

PROJECT_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = PROJECT_DIR / "dataset" / "raw" / "segment_level_data.csv"

OUTPUT_PATH = PROJECT_DIR / "results" / "target_analysis.txt"

print("\nLoading dataset...")

df = pd.read_csv(DATA_PATH)

# Select our prediction target
target = pd.to_numeric(
    df["run_time_in_seconds"],
    errors="coerce"
)

# Analyse travel time
report = []

report.append("========== YatraIQ TARGET ANALYSIS ==========")

report.append("\n1. TARGET COLUMN")
report.append("run_time_in_seconds")

report.append("\n2. TRAVEL TIME STATISTICS")
report.append(target.describe().to_string())

report.append("\n3. INVALID VALUES")
report.append(f"Missing values: {target.isna().sum()}")
report.append(f"Zero values: {(target == 0).sum()}")
report.append(f"Negative values: {(target < 0).sum()}")

report.append("\n4. TRAVEL TIME IN MINUTES")
report.append(
    (target / 60).describe().to_string()
)

report.append("\n5. DATE RANGE")
dates = pd.to_datetime(df["date"], errors="coerce")
report.append(f"First date: {dates.min()}")
report.append(f"Last date: {dates.max()}")

report.append("\n6. SAMPLE RECORDS")
report.append(
    df[[
        "date",
        "direction",
        "segment",
        "start_point",
        "end_point",
        "start_time",
        "run_time_in_seconds"
    ]].head(10).to_string(index=False)
)

report.append("\n========== ANALYSIS COMPLETED ==========")

OUTPUT_PATH.write_text(
    "\n".join(report),
    encoding="utf-8"
)

print("\nTarget analysis completed!")
print("Report saved at:", OUTPUT_PATH)
print("\nTravel time statistics:")
print(target.describe())
print("\nReport location:", OUTPUT_PATH)