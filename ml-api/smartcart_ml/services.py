import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

from smartcart_ml.json_utils import dataframe_to_records, numeric_list, series_counts
from smartcart_ml.model_loader import load_all_models, load_dataset
from smartcart_ml.preprocessing import SPENDING_COLUMNS, create_customer_feature_row, prepare_basic_features

PRODUCT_LABELS = {
    "MntWines": "Wines",
    "MntFruits": "Fruits",
    "MntMeatProducts": "Meat",
    "MntFishProducts": "Fish",
    "MntSweetProducts": "Sweets",
    "MntGoldProds": "Gold",
}


def usable_features(features):
    return [feature for feature in features if feature not in ["clusters", "Cluster_names"]]


def cluster_metadata_value(mapping, cluster_id, fallback):
    if isinstance(mapping, dict):
        return mapping.get(int(cluster_id), fallback)
    return fallback


def metadata_name(value, fallback):
    if isinstance(value, dict):
        return value.get("name") or fallback
    if value:
        return str(value)
    return fallback


def metadata_description(value, fallback="No description available"):
    if isinstance(value, dict):
        description = value.get("description")
        if description:
            return str(description)

        recommendation = value.get("recommendation")
        if isinstance(recommendation, list):
            return " ".join(str(item) for item in recommendation)
        if recommendation:
            return str(recommendation)

        return fallback

    if value:
        return str(value)
    return fallback


def prepared_dataset():
    return prepare_basic_features(load_dataset())


def get_metrics():
    df = prepared_dataset()
    return {
        "totalCustomers": int(len(df)),
        "avgIncome": round(float(df["Income"].mean()), 2),
        "avgSpending": round(float(df["Total_Spending"].mean()), 2),
        "responseRate": round(float(df["Response"].mean() * 100), 2),
    }


def get_dashboard_payload():
    df = prepared_dataset()

    product_spending = [
        {"product": PRODUCT_LABELS[column], "totalSpending": float(df[column].sum())}
        for column in SPENDING_COLUMNS
    ]

    scatter_df = df[["Income", "Total_Spending", "Age", "Recency"]].dropna().copy()

    correlation_columns = [
        "Income",
        "Age",
        "Recency",
        "Total_Spending",
        "NumDealsPurchases",
        "NumWebPurchases",
        "NumCatalogPurchases",
        "NumStorePurchases",
        "NumWebVisitsMonth",
        "Response",
    ]
    correlation = df[correlation_columns].corr().round(3)

    return {
        "metrics": get_metrics(),
        "incomeValues": numeric_list(df["Income"]),
        "ageValues": numeric_list(df["Age"]),
        "spendingValues": numeric_list(df["Total_Spending"]),
        "webVisitsValues": numeric_list(df["NumWebVisitsMonth"]),
        "educationCounts": series_counts(df["Education"]),
        "maritalCounts": series_counts(df["Marital_Status"]),
        "productSpending": product_spending,
        "incomeSpendingPoints": dataframe_to_records(scatter_df),
        "correlation": {
            "labels": correlation_columns,
            "z": correlation.values.tolist(),
        },
    }


def get_scaled_feature_matrix():
    models = load_all_models()
    df = prepared_dataset()
    features = usable_features(models["features"])
    x = df[features].copy()
    x = x.fillna(x.median(numeric_only=True))
    return models["scaler"].transform(x)


def get_k_analysis():
    scaled_data = get_scaled_feature_matrix()
    k_values = list(range(2, 11))
    wcss = []
    silhouette_scores = []

    for k in k_values:
        model = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = model.fit_predict(scaled_data)
        wcss.append(round(float(model.inertia_), 3))
        silhouette_scores.append(round(float(silhouette_score(scaled_data, labels)), 4))

    best_score = max(silhouette_scores)
    best_k = k_values[silhouette_scores.index(best_score)]

    return {
        "kValues": k_values,
        "wcss": wcss,
        "silhouetteScores": silhouette_scores,
        "bestK": best_k,
        "bestScore": best_score,
    }


def generate_cluster_dataframe():
    models = load_all_models()
    df = prepared_dataset()
    features = usable_features(models["features"])

    x = df[features].copy()
    x = x.fillna(x.median(numeric_only=True))

    scaled_data = models["scaler"].transform(x)
    pca_data = models["pca"].transform(scaled_data)
    clusters = models["kmeans"].predict(pca_data)

    cluster_df = pd.DataFrame(
        {
            "PCA1": pca_data[:, 0],
            "PCA2": pca_data[:, 1],
            "Cluster": clusters.astype(str),
        }
    )
    return cluster_df


def get_cluster_points():
    return dataframe_to_records(generate_cluster_dataframe())


def get_cluster_summary():
    models = load_all_models()
    cluster_names = models["cluster_names"]
    cluster_description = models["cluster_description"]

    df = prepared_dataset().reset_index(drop=True)
    cluster_df = generate_cluster_dataframe().reset_index(drop=True)
    df["Cluster"] = cluster_df["Cluster"].astype(int)

    summary = (
        df.groupby("Cluster")
        .agg(
            Customer_Count=("Cluster", "count"),
            Avg_Income=("Income", "mean"),
            Avg_Spending=("Total_Spending", "mean"),
            Avg_Recency=("Recency", "mean"),
            Avg_Web_Purchases=("NumWebPurchases", "mean"),
            Avg_Store_Purchases=("NumStorePurchases", "mean"),
            Response_Rate=("Response", "mean"),
        )
        .reset_index()
    )

    summary["Avg_Income"] = summary["Avg_Income"].round(2)
    summary["Avg_Spending"] = summary["Avg_Spending"].round(2)
    summary["Avg_Recency"] = summary["Avg_Recency"].round(2)
    summary["Avg_Web_Purchases"] = summary["Avg_Web_Purchases"].round(2)
    summary["Avg_Store_Purchases"] = summary["Avg_Store_Purchases"].round(2)
    summary["Response_Rate"] = (summary["Response_Rate"] * 100).round(2)

    summary["Cluster_Name"] = summary["Cluster"].apply(
        lambda value: metadata_name(
            cluster_metadata_value(cluster_names, value, f"Cluster {value}"),
            f"Cluster {value}",
        )
    )
    summary["Description"] = summary["Cluster"].apply(
        lambda value: metadata_description(
            cluster_metadata_value(cluster_description, value, "No description available")
        )
    )

    return dataframe_to_records(summary)


def get_recommendation_by_cluster(cluster_id: int):
    recommendations = {
        0: [
            "Target with premium product bundles.",
            "Offer loyalty rewards and early access campaigns.",
            "Avoid excessive discounts because this segment may already have strong spending power.",
        ],
        1: [
            "Use discount-based campaigns.",
            "Send personalized offers through web channels.",
            "Focus on reactivation and engagement improvement.",
        ],
        2: [
            "Promote family-oriented product bundles.",
            "Use catalog and store-based offers.",
            "Provide value packs and seasonal promotions.",
        ],
        3: [
            "Focus on awareness and low-risk trial offers.",
            "Use beginner-friendly product recommendations.",
            "Avoid aggressive high-ticket product campaigns.",
        ],
    }
    return recommendations.get(
        cluster_id,
        [
            "Use personalized marketing campaigns.",
            "Analyze spending behavior before targeting.",
            "Test offers using small campaign groups.",
        ],
    )


def predict_new_customer_cluster(customer_data: dict):
    models = load_all_models()
    x = create_customer_feature_row(customer_data, models["features"])

    scaled_data = models["scaler"].transform(x)
    pca_data = models["pca"].transform(scaled_data)
    cluster_id = int(models["kmeans"].predict(pca_data)[0])

    cluster_names = models["cluster_names"]
    cluster_description = models["cluster_description"]

    cluster_name = metadata_name(
        cluster_metadata_value(cluster_names, cluster_id, f"Cluster {cluster_id}"),
        f"Cluster {cluster_id}",
    )
    description = metadata_description(
        cluster_metadata_value(cluster_description, cluster_id, "No description available")
    )

    return {
        "cluster_id": cluster_id,
        "cluster_name": cluster_name,
        "description": description,
        "recommendations": get_recommendation_by_cluster(cluster_id),
    }
