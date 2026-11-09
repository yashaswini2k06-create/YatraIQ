import pandas as pd
import json
import urllib.request

# Load one real dataset record
df = pd.read_csv("dataset/processed/ml_ready_data.csv")

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

sample = df.iloc[0]

data = {
    feature: sample[feature].item()
    if hasattr(sample[feature], "item")
    else sample[feature]
    for feature in features
}

# Send prediction request
url = "http://127.0.0.1:5000/predict"

payload = json.dumps(data).encode("utf-8")

req = urllib.request.Request(
    url,
    data=payload,
    headers={"Content-Type": "application/json"},
    method="POST"
)

print("Sending journey details to YatraIQ API...")

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())

    print("\n========== YatraIQ PREDICTION ==========")
    print(json.dumps(result, indent=4))
    print("\nAPI TEST COMPLETED SUCCESSFULLY!")

except Exception as e:
    print("API Error:", e)