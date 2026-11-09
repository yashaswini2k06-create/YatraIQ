import pandas as pd
from pathlib import Path

# YatraIQ - Feature Engineering

PROJECT_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = PROJECT_DIR / "dataset" / "processed" / "cleaned_bus_data.csv"

OUTPUT_PATH = PROJECT_DIR / "dataset" / "processed" / "ml_ready_data.csv"

print("\nLoading cleaned dataset...")

df = pd.read_csv(DATA_PATH)

# Convert date and time
df["date"] = pd.to_datetime(df["date"], errors="coerce")
df["start_time"] = pd.to_datetime(
    df["start_time"], errors="coerce"
)

# Extract date features
df["day_of_week"] = df["date"].dt.dayofweek
df["month"] = df["date"].dt.month

# Extract departure hour and minute
df["departure_hour"] = df["start_time"].dt.hour
df["departure_minute"] = df["start_time"].dt.minute

# Convert running time into minutes
df["travel_time_minutes"] = (
    df["run_time_in_seconds"] / 60
)

# Select useful ML features
features = [
    "direction",
    "segment",
    "start_point",
    "end_point",
    "day_of_week",
    "month",
    "departure_hour",
    "departure_minute"
]

target = "run_time_in_seconds"

# Keep required columns
ml_df = df[features + [target]].copy()

# Remove records with missing selected values
ml_df = ml_df.dropna()

# Save ML-ready dataset
ml_df.to_csv(OUTPUT_PATH, index=False)

print("\n========== FEATURE ENGINEERING REPORT ==========")

print("Original cleaned records:", len(df))
print("ML-ready records:", len(ml_df))

print("\nFeatures:")
print(features)

print("\nPrediction target:")
print(target)

print("\nFinal dataset shape:", ml_df.shape)

print("\nSaved successfully at:")
print(OUTPUT_PATH)

print("\nFEATURE ENGINEERING COMPLETED!")