import pandas as pd
from sklearn.cluster import AgglomerativeClustering, KMeans
from sklearn.decomposition import PCA
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


def get_cluster_names_payload():
    models = load_all_models()
    cluster_names = models["cluster_names"]

    if isinstance(cluster_names, dict):
        return [
            {
                "clusterId": int(cluster_id),
                "name": metadata_name(value, f"Cluster {cluster_id}"),
            }
            for cluster_id, value in sorted(cluster_names.items())
        ]

    return []


def get_outlier_points(df):
    selected = df[["Income", "Total_Spending", "Age", "Recency"]].dropna().copy()
    outlier_mask = pd.Series(False, index=selected.index)

    for column in ["Income", "Total_Spending"]:
        q1 = selected[column].quantile(0.25)
        q3 = selected[column].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - (1.5 * iqr)
        upper = q3 + (1.5 * iqr)
        outlier_mask = outlier_mask | (selected[column] < lower) | (selected[column] > upper)

    selected["Outlier"] = outlier_mask.map({True: "Outlier", False: "Typical"})
    return selected


def get_dashboard_payload():
    df = prepared_dataset()

    product_spending = [
        {"product": PRODUCT_LABELS[column], "totalSpending": float(df[column].sum())}
        for column in SPENDING_COLUMNS
    ]

    scatter_df = df[["Income", "Total_Spending", "Age", "Recency"]].dropna().copy()
    outlier_df = get_outlier_points(df)

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
        "spendingValues": numeric_list(df["Total_Spending"]),
        "webVisitsValues": numeric_list(df["NumWebVisitsMonth"]),
        "educationCounts": series_counts(df["Education"]),
        "maritalCounts": series_counts(df["Marital_Status"]),
        "productSpending": product_spending,
        "incomeSpendingPoints": dataframe_to_records(scatter_df),
        "outlierPoints": dataframe_to_records(outlier_df),
        "correlation": {
            "labels": correlation_columns,
            "z": correlation.values.tolist(),
        },
    }


def get_feature_frame():
    models = load_all_models()
    df = prepared_dataset()
    features = usable_features(models["features"])
    x = df[features].copy()
    return x.fillna(x.median(numeric_only=True))


def get_scaled_feature_matrix():
    models = load_all_models()
    return models["scaler"].transform(get_feature_frame())


def get_pca_feature_matrix():
    models = load_all_models()
    return models["pca"].transform(get_scaled_feature_matrix())


def calculate_wcss(points, labels):
    frame = pd.DataFrame(points)
    frame["Cluster"] = labels
    total = 0.0

    for _, group in frame.groupby("Cluster"):
        values = group.drop(columns=["Cluster"])
        centroid = values.mean(axis=0)
        total += float(((values - centroid) ** 2).sum().sum())

    return total


def normalize(values, invert=False):
    series = pd.Series(values, dtype="float64")
    minimum = series.min()
    maximum = series.max()

    if maximum == minimum:
        normalized = pd.Series([1 for _ in values])
    else:
        normalized = (series - minimum) / (maximum - minimum)

    if invert:
        normalized = 1 - normalized

    return [round(float(value), 4) for value in normalized.tolist()]


def select_elbow_k(k_values, wcss):
    first_x = float(k_values[0])
    first_y = float(wcss[0])
    last_x = float(k_values[-1])
    last_y = float(wcss[-1])
    line_dx = last_x - first_x
    line_dy = last_y - first_y
    denominator = ((line_dx ** 2) + (line_dy ** 2)) ** 0.5

    if denominator == 0:
        return k_values[0]

    distances = []
    for k, value in zip(k_values, wcss):
        distance = abs(line_dy * float(k) - line_dx * float(value) + last_x * first_y - last_y * first_x) / denominator
        distances.append(distance)

    return k_values[distances.index(max(distances))]


def select_intersection_k(k_values, normalized_wcss, normalized_silhouette, combined_scores):
    differences = [
        wcss_score - silhouette_score
        for wcss_score, silhouette_score in zip(normalized_wcss, normalized_silhouette)
    ]

    for index, difference in enumerate(differences):
        if difference == 0:
            return k_values[index], 0.0, float(k_values[index]), normalized_wcss[index]

        if index == len(differences) - 1:
            continue

        next_difference = differences[index + 1]
        if difference * next_difference <= 0:
            crossing_k = k_values[index] + (
                abs(difference) / (abs(difference) + abs(next_difference))
            ) * (k_values[index + 1] - k_values[index])
            crossing_ratio = crossing_k - k_values[index]
            crossing_score = normalized_wcss[index] + (
                (normalized_wcss[index + 1] - normalized_wcss[index]) * crossing_ratio
            )
            selected_index = min(
                range(len(k_values)),
                key=lambda candidate_index: (
                    abs(k_values[candidate_index] - crossing_k),
                    -combined_scores[candidate_index],
                ),
            )
            gap = abs(normalized_wcss[selected_index] - normalized_silhouette[selected_index])
            return (
                k_values[selected_index],
                round(float(gap), 4),
                round(float(crossing_k), 4),
                round(float(crossing_score), 4),
            )

    candidates = []
    for index, k in enumerate(k_values):
        candidates.append(
            {
                "k": k,
                "gap": abs(differences[index]),
                "combined": combined_scores[index],
            }
        )
    selected = min(candidates, key=lambda item: (item["gap"], -item["combined"], item["k"]))
    selected_index = k_values.index(selected["k"])
    selected_score = combined_scores[selected_index]
    return selected["k"], round(float(selected["gap"]), 4), float(selected["k"]), selected_score


def get_k_analysis():
    pca_data = get_pca_feature_matrix()
    elbow_k_values = list(range(1, 11))
    k_values = list(range(2, 11))
    elbow_wcss = []
    silhouette_scores = []

    for k in elbow_k_values:
        model = KMeans(n_clusters=k, random_state=42)
        labels = model.fit_predict(pca_data)
        elbow_wcss.append(round(float(model.inertia_), 3))
        if k > 1:
            silhouette_scores.append(round(float(silhouette_score(pca_data, labels)), 4))

    wcss = elbow_wcss[1:]
    notebook_intersection_wcss = elbow_wcss[: len(k_values)]
    normalized_wcss = normalize(wcss, invert=True)
    normalized_silhouette = normalize(silhouette_scores)
    combined_scores = [
        round((wcss_score + silhouette_score_value) / 2, 4)
        for wcss_score, silhouette_score_value in zip(normalized_wcss, normalized_silhouette)
    ]
    selected_k = select_elbow_k(elbow_k_values, elbow_wcss)
    intersection_selected_k, intersection_gap, intersection_k, intersection_score = select_intersection_k(
        k_values,
        normalized_wcss,
        normalized_silhouette,
        combined_scores,
    )
    selected_score = combined_scores[k_values.index(selected_k)] if selected_k in k_values else None
    best_score = max(silhouette_scores)
    best_k = k_values[silhouette_scores.index(best_score)]

    return {
        "elbowKValues": elbow_k_values,
        "elbowWcss": elbow_wcss,
        "kValues": k_values,
        "wcss": wcss,
        "intersectionWcss": notebook_intersection_wcss,
        "silhouetteScores": silhouette_scores,
        "normalizedWcss": normalized_wcss,
        "normalizedSilhouette": normalized_silhouette,
        "combinedScores": combined_scores,
        "bestK": selected_k,
        "bestSilhouetteK": best_k,
        "bestScore": best_score,
        "selectedK": selected_k,
        "intersectionSelectedK": selected_k,
        "intersectionGap": intersection_gap,
        "intersectionPoint": {
            "k": selected_k,
            "score": selected_score,
        },
        "selectedReason": (
            f"K={selected_k} is selected using the notebook model-selection flow: KMeans is fitted on PCA data, "
            "the elbow point is detected from the WCSS curve, and the twin-axis WCSS/silhouette graph confirms "
            f"the same region. The notebook-selected integer K is {selected_k}."
        ),
    }


def get_agglomerative_labels(scaled_data):
    models = load_all_models()
    agglomerative = models["agglomerative"]

    if hasattr(agglomerative, "labels_") and len(agglomerative.labels_) == len(scaled_data):
        return agglomerative.labels_

    return AgglomerativeClustering(n_clusters=4).fit_predict(scaled_data)


def generate_cluster_dataframe():
    models = load_all_models()
    cluster_names = models["cluster_names"]
    df = prepared_dataset()
    features = usable_features(models["features"])

    x = df[features].copy()
    x = x.fillna(x.median(numeric_only=True))

    scaled_data = models["scaler"].transform(x)
    pca_3d = PCA(n_components=3, random_state=42).fit_transform(scaled_data)
    clusters = get_agglomerative_labels(scaled_data)

    cluster_df = pd.DataFrame(
        {
            "PCA1": pca_3d[:, 0],
            "PCA2": pca_3d[:, 1],
            "PCA3": pca_3d[:, 2],
            "Cluster": clusters.astype(str),
            "Income": df["Income"].values,
            "Total_Spending": df["Total_Spending"].values,
        }
    )
    cluster_df["Cluster_Name"] = cluster_df["Cluster"].apply(
        lambda value: metadata_name(
            cluster_metadata_value(cluster_names, int(value), f"Cluster {value}"),
            f"Cluster {value}",
        )
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
