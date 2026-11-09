import pandas as pd
import joblib
import os
import numpy as np

print("\n========== YatraIQ MODEL TESTING ==========\n")

# 1. Load dataset
DATA_PATH = "dataset/processed/ml_ready_data.csv"

df = pd.read_csv(DATA_PATH)

# 2. Load trained model
MODEL_PATH = "models/yatraiq_model.pkl"

model = joblib.load(MODEL_PATH)

print("Trained model loaded successfully!")

# 3. Define features
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

# 4. Select sample records
sample = df.sample(n=10, random_state=42)

X_test = sample[features]
actual = sample[target]

# 5. Predict journey time
predictions = model.predict(X_test)

# 6. Display predictions
results = pd.DataFrame({
    "Actual_Time": actual.values,
    "Predicted_Time": predictions.round(2)
})

results["Error"] = (
    results["Actual_Time"] - results["Predicted_Time"]
).abs()

print("\n========== PREDICTION RESULTS ==========\n")

print(results.to_string(index=False))

# 7. Calculate testing error
print("\nAverage Prediction Error:",
      round(results["Error"].mean(), 2), "seconds")

# 8. Save predictions
os.makedirs("results", exist_ok=True)

results.to_csv(
    "results/model_test_predictions.csv",
    index=False
)

print("\nPredictions saved successfully!")

print("\n========== MODEL TESTING COMPLETED ==========")