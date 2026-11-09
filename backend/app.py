from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os

app = Flask(__name__)
CORS(app)

# Load trained ML model
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "yatraiq_model.pkl"
)

model = joblib.load(MODEL_PATH)

print("YatraIQ ML Model Loaded Successfully!")


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Welcome to YatraIQ API",
        "status": "Running"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model": "loaded"
    })


@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

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

        # Validate input
        missing = [
            feature for feature in features
            if feature not in data
        ]

        if missing:
            return jsonify({
                "error": "Missing input fields",
                "fields": missing
            }), 400

        # Prepare input
        import pandas as pd

        input_data = pd.DataFrame(
            [[data[feature] for feature in features]],
            columns=features
        )

        # Predict journey time
        prediction = model.predict(input_data)[0]

        return jsonify({
            "success": True,
            "predicted_time_seconds": round(float(prediction), 2),
            "predicted_time_minutes": round(float(prediction) / 60, 2),
            "message": "Journey time predicted successfully"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )
