from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_PATH = BASE_DIR / "data" / "smartcart_customers.csv"
MODELS_DIR = BASE_DIR / "models"

KMEANS_PATH = MODELS_DIR / "kmeans.pkl"
SCALER_PATH = MODELS_DIR / "scaler.pkl"
PCA_PATH = MODELS_DIR / "PCA.pkl"
FEATURES_PATH = MODELS_DIR / "features.pkl"
CLUSTER_NAMES_PATH = MODELS_DIR / "cluster_names.pkl"
CLUSTER_DESCRIPTION_PATH = MODELS_DIR / "cluster_description.pkl"
AGGLOMERATIVE_PATH = MODELS_DIR / "agglomerative_clustering.pkl"
