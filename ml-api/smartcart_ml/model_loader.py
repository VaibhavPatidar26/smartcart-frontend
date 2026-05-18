import pickle
from functools import lru_cache

import pandas as pd

from smartcart_ml.settings import (
    AGGLOMERATIVE_PATH,
    CLUSTER_DESCRIPTION_PATH,
    CLUSTER_NAMES_PATH,
    DATA_PATH,
    FEATURES_PATH,
    KMEANS_PATH,
    PCA_PATH,
    SCALER_PATH,
)


@lru_cache(maxsize=None)
def load_pickle(path_as_string):
    with open(path_as_string, "rb") as file:
        return pickle.load(file)


@lru_cache(maxsize=1)
def load_dataset():
    return pd.read_csv(DATA_PATH)


@lru_cache(maxsize=1)
def load_all_models():
    return {
        "kmeans": load_pickle(str(KMEANS_PATH)),
        "scaler": load_pickle(str(SCALER_PATH)),
        "pca": load_pickle(str(PCA_PATH)),
        "features": load_pickle(str(FEATURES_PATH)),
        "cluster_names": load_pickle(str(CLUSTER_NAMES_PATH)),
        "cluster_description": load_pickle(str(CLUSTER_DESCRIPTION_PATH)),
        "agglomerative": load_pickle(str(AGGLOMERATIVE_PATH)),
    }
