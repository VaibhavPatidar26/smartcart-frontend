import pandas as pd

SPENDING_COLUMNS = [
    "MntWines",
    "MntFruits",
    "MntMeatProducts",
    "MntFishProducts",
    "MntSweetProducts",
    "MntGoldProds",
]


def prepare_basic_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df["Total_Spending"] = df[SPENDING_COLUMNS].sum(axis=1)
    df["Total_children"] = df["Kidhome"] + df["Teenhome"]
    df["Age"] = 2026 - df["Year_Birth"]

    df["Dt_Customer"] = pd.to_datetime(df["Dt_Customer"], errors="coerce")
    latest_date = df["Dt_Customer"].max()
    df["Customer_Tenure_Days"] = (latest_date - df["Dt_Customer"]).dt.days

    df["Education_Graduate"] = df["Education"].isin(["Graduation"]).astype(int)
    df["Education_PostGraduate"] = df["Education"].isin(["Master", "PhD"]).astype(int)
    df["Education_Undergraduate"] = df["Education"].isin(["Basic", "2n Cycle"]).astype(int)

    df["Living_With_Partner"] = df["Marital_Status"].isin(["Married", "Together"]).astype(int)
    df["Living_With_Alone"] = df["Marital_Status"].isin(
        ["Single", "Divorced", "Widow", "Alone", "Absurd", "YOLO"]
    ).astype(int)

    return df


def create_customer_feature_row(customer_data: dict, features: list):
    total_children = customer_data["Kidhome"] + customer_data["Teenhome"]
    total_spending = sum(customer_data[column] for column in SPENDING_COLUMNS)

    education = customer_data["Education"]
    living_with = customer_data["Living_With"]

    row = {
        "Income": customer_data["Income"],
        "Recency": customer_data["Recency"],
        "NumDealsPurchases": customer_data["NumDealsPurchases"],
        "NumWebPurchases": customer_data["NumWebPurchases"],
        "NumCatalogPurchases": customer_data["NumCatalogPurchases"],
        "NumStorePurchases": customer_data["NumStorePurchases"],
        "NumWebVisitsMonth": customer_data["NumWebVisitsMonth"],
        "Complain": customer_data["Complain"],
        "Response": customer_data["Response"],
        "Age": customer_data["Age"],
        "Customer_Tenure_Days": customer_data["Customer_Tenure_Days"],
        "Total_Spending": total_spending,
        "Total_children": total_children,
        "Education_Graduate": 1 if education == "Graduate" else 0,
        "Education_PostGraduate": 1 if education == "PostGraduate" else 0,
        "Education_Undergraduate": 1 if education == "Undergraduate" else 0,
        "Living_With_Alone": 1 if living_with == "Alone" else 0,
        "Living_With_Partner": 1 if living_with == "Partner" else 0,
    }

    usable_features = [feature for feature in features if feature not in ["clusters", "Cluster_names"]]
    return pd.DataFrame([[row[feature] for feature in usable_features]], columns=usable_features)

