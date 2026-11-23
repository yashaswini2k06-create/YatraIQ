
# =============================================
# YatraIQ - FLASK BACKEND
# Smart Public Transport Journey Prediction
# =============================================

from flask import Flask, request, jsonify
from flask_cors import CORS

import joblib
import pandas as pd
import numpy as np

import os
import traceback


# =============================================
# 1. FLASK CONFIGURATION
# =============================================

app = Flask(__name__)

CORS(app)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


MODEL_PATH = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        "models",
        "yatraiq_model.pkl"
    )
)


DATASET_PATH = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        "dataset",
        "processed",
        "ml_ready_data.csv"
    )
)


# =============================================
# 2. FEATURE CONFIGURATION
# =============================================

FEATURES = [
    "direction",
    "segment",
    "start_point",
    "end_point",
    "day_of_week",
    "month",
    "departure_hour",
    "departure_minute"
]


ROUTE_FEATURES = [
    "direction",
    "segment",
    "start_point",
    "end_point"
]


# =============================================
# 3. LOAD EXISTING TRAINED MODEL
# =============================================

if not os.path.exists(MODEL_PATH):

    raise FileNotFoundError(
        f"Trained model not found: {MODEL_PATH}"
    )


model = joblib.load(MODEL_PATH)


print("--------------------------------------")
print("YatraIQ ML Model Loaded Successfully!")
print("--------------------------------------")


# =============================================
# 4. LOAD EXISTING DATASET
# =============================================

if not os.path.exists(DATASET_PATH):

    raise FileNotFoundError(
        f"Dataset not found: {DATASET_PATH}"
    )


dataset = pd.read_csv(
    DATASET_PATH,
    usecols=FEATURES
)


if dataset.empty:

    raise ValueError(
        "The processed dataset is empty."
    )


# Remove duplicate route combinations

route_data = (
    dataset[ROUTE_FEATURES]
    .drop_duplicates()
    .sort_values(
        by=ROUTE_FEATURES
    )
    .reset_index(drop=True)
)


# Store valid feature values

allowed_values = {

    feature: sorted(
        dataset[feature]
        .dropna()
        .unique()
        .astype(int)
        .tolist()
    )

    for feature in FEATURES

}


# Store actual route combinations

valid_routes = {

    tuple(int(row[column]) for column in ROUTE_FEATURES)

    for _, row in route_data.iterrows()

}


print("--------------------------------------")
print("Dataset Loaded Successfully!")
print("Total Dataset Records:", len(dataset))
print("Unique Route Combinations:", len(route_data))
print("--------------------------------------")


# =============================================
# 5. HELPER - VALIDATE INTEGER INPUT
# =============================================

def validate_integer(value, field):

    if isinstance(value, bool):

        raise ValueError(
            f"{field} must be an integer."
        )


    try:

        numeric_value = float(value)

    except (TypeError, ValueError):

        raise ValueError(
            f"{field} must be a valid number."
        )


    if not np.isfinite(numeric_value):

        raise ValueError(
            f"{field} must be a finite number."
        )


    if not numeric_value.is_integer():

        raise ValueError(
            f"{field} must be an integer."
        )


    return int(numeric_value)


# =============================================
# 6. HOME API
# =============================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({

        "success": True,

        "message": "Welcome to YatraIQ API",

        "status": "Running"

    })


# =============================================
# 7. HEALTH CHECK API
# =============================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({

        "status": "healthy",

        "model": "loaded",

        "dataset": "loaded",

        "total_records": len(dataset),

        "unique_routes": len(route_data)

    })


# =============================================
# 8. DATASET OPTIONS API
# =============================================

@app.route("/options", methods=["GET"])
def get_options():

    try:

        routes = [

            {

                "direction": int(row.direction),

                "segment": int(row.segment),

                "start_point": int(row.start_point),

                "end_point": int(row.end_point)

            }

            for row in route_data.itertuples(index=False)

        ]


        return jsonify({

            "success": True,

            "allowed_values": allowed_values,

            "routes": routes,

            "total_routes": len(routes),

            "message": "Dataset options loaded successfully"

        })


    except Exception as error:

        print("OPTIONS ERROR:", error)

        return jsonify({

            "success": False,

            "error": "Unable to load dataset options."

        }), 500


# =============================================
# 9. PREDICTION API
# =============================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # Get JSON request

        data = request.get_json(silent=True)


        if not isinstance(data, dict):

            return jsonify({

                "success": False,

                "error": "Invalid request. JSON data is required."

            }), 400


        # Check missing fields

        missing_fields = [

            feature

            for feature in FEATURES

            if feature not in data

        ]


        if missing_fields:

            return jsonify({

                "success": False,

                "error": "Missing required input fields.",

                "fields": missing_fields

            }), 400


        # Convert all features to integers

        validated_data = {

            feature: validate_integer(
                data[feature],
                feature
            )

            for feature in FEATURES

        }


        # Validate each feature against dataset values

        for feature in FEATURES:

            value = validated_data[feature]

            if value not in allowed_values[feature]:

                return jsonify({

                    "success": False,

                    "error": (
                        f"Invalid {feature}: {value}. "
                        "Value is not available in the training dataset."
                    )

                }), 400


        # Validate actual route combination

        selected_route = tuple(

            validated_data[feature]

            for feature in ROUTE_FEATURES

        )


        if selected_route not in valid_routes:

            return jsonify({

                "success": False,

                "error": (
                    "The selected direction, segment, "
                    "starting point and destination "
                    "do not form a valid dataset route."
                )

            }), 400


        # Prepare model input

        input_data = pd.DataFrame(

            [[validated_data[feature] for feature in FEATURES]],

            columns=FEATURES

        )


        # Generate prediction using existing model

        prediction = model.predict(input_data)[0]


        prediction_seconds = float(prediction)


        if not np.isfinite(prediction_seconds):

            raise ValueError(
                "The model returned an invalid prediction."
            )


        prediction_minutes = prediction_seconds / 60


        # Return prediction result

        return jsonify({

            "success": True,

            "predicted_time_seconds": round(
                prediction_seconds,
                2
            ),

            "predicted_time_minutes": round(
                prediction_minutes,
                2
            ),

            "input_features": validated_data,

            "message": "Journey time predicted successfully"

        })


    except ValueError as error:

        return jsonify({

            "success": False,

            "error": str(error)

        }), 400


    except Exception as error:

        print("PREDICTION ERROR:")

        traceback.print_exc()


        return jsonify({

            "success": False,

            "error": "An internal error occurred during prediction."

        }), 500


# =============================================
# 10. RUN FLASK APPLICATION
# =============================================

if __name__ == "__main__":

    print("\nStarting YatraIQ Backend...")

    print("API URL: http://127.0.0.1:5000")

    print("Health Check: http://127.0.0.1:5000/health")

    print("Dataset Options: http://127.0.0.1:5000/options")

    print("Prediction API: http://127.0.0.1:5000/predict")


    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True,

        use_reloader=False

    )
