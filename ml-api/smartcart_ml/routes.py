from flask import Blueprint, jsonify, request

from smartcart_ml.model_loader import load_all_models, load_dataset
from smartcart_ml.services import (
    get_cluster_points,
    get_cluster_names_payload,
    get_cluster_summary,
    get_dashboard_payload,
    get_k_analysis,
    get_metrics,
    predict_new_customer_cluster,
)

bp = Blueprint("smartcart_ml", __name__)

REQUIRED_PREDICTION_FIELDS = [
    "Income",
    "Age",
    "Recency",
    "Customer_Tenure_Days",
    "NumDealsPurchases",
    "NumWebPurchases",
    "NumCatalogPurchases",
    "NumStorePurchases",
    "NumWebVisitsMonth",
    "Kidhome",
    "Teenhome",
    "Education",
    "Living_With",
    "Complain",
    "Response",
    "MntWines",
    "MntFruits",
    "MntMeatProducts",
    "MntFishProducts",
    "MntSweetProducts",
    "MntGoldProds",
]


@bp.get("/health")
def health():
    load_dataset()
    load_all_models()
    return jsonify({"status": "ok", "service": "smartcart-ml-api"})


@bp.get("/ping")
def ping():
    return jsonify({"status": "ok", "service": "smartcart-ml-api"})


@bp.get("/metrics")
def metrics():
    return jsonify(get_metrics())


@bp.get("/dashboard")
def dashboard():
    return jsonify(get_dashboard_payload())


@bp.get("/k-analysis")
def k_analysis():
    return jsonify(get_k_analysis())


@bp.get("/clusters/points")
def clusters_points():
    return jsonify(get_cluster_points())


@bp.get("/clusters/names")
def clusters_names():
    return jsonify(get_cluster_names_payload())


@bp.get("/clusters/summary")
def clusters_summary():
    return jsonify(get_cluster_summary())


@bp.post("/predict")
def predict():
    customer_data = request.get_json(silent=True) or {}
    missing_fields = [field for field in REQUIRED_PREDICTION_FIELDS if field not in customer_data]

    if missing_fields:
        return jsonify({"message": "Missing required fields", "missingFields": missing_fields}), 400

    return jsonify(predict_new_customer_cluster(customer_data))
