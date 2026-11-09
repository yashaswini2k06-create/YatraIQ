import pandas as pd
import numpy as np
import joblib
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
print("\n========== YatraIQ MODEL TRAINING ==========\n")
# 1. Load dataset
DATA_PATH = "dataset/processed/ml_ready_data.csv"
df = pd.read_csv(DATA_PATH)
print("Dataset loaded:", df.shape)
# 2. Define features and target
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
X = df[features]
y = df[target]
# 3. Identify categorical columns
categorical = [
    "direction",
    "segment",
    "start_point",
    "end_point"
]
numerical = [
    "day_of_week",
    "month",
    "departure_hour",
    "departure_minute"
]
# 4. Preprocessing
preprocessor = ColumnTransformer([
    ("cat", OrdinalEncoder(
        handle_unknown="use_encoded_value",
        unknown_value=-1
    ), categorical),
    ("num", SimpleImputer(strategy="median"), numerical)
])
# 5. Build ML pipeline
model = Pipeline([
    ("preprocessing", preprocessor),
    ("regressor", HistGradientBoostingRegressor(
        max_iter=100,
        max_leaf_nodes=31,
        learning_rate=0.1,
        random_state=42,
        early_stopping=True
    ))
])
# 6. Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)
print("Training records:", len(X_train))
print("Testing records:", len(X_test))
# 7. Train model
print("\nTraining started...")
model.fit(X_train, y_train)
print("Training completed!")
# 8. Predictions
predictions = model.predict(X_test)
# 9. Evaluate model
mae = mean_absolute_error(y_test, predictions)
rmse = np.sqrt(mean_squared_error(y_test, predictions))
r2 = r2_score(y_test, predictions)
print("\n========== MODEL EVALUATION ==========")
print("MAE:", round(mae, 2), "seconds")
print("RMSE:", round(rmse, 2), "seconds")
print("R2 Score:", round(r2, 4))
# 10. Save trained model
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/yatraiq_model.pkl")
# 11. Save evaluation results
results = {
    "model": "HistGradientBoostingRegressor",
    "training_records": len(X_train),
    "testing_records": len(X_test),
    "MAE": float(mae),
    "RMSE": float(rmse),
    "R2_score": float(r2)
}
with open("models/model_results.json", "w") as file:
    json.dump(results, file, indent=4)
print("\nModel saved: models/yatraiq_model.pkl")
print("Results saved: models/model_results.json")
print("\n========== MODEL TRAINING COMPLETED ==========")