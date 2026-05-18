import numpy as np
import pandas as pd


def clean_value(value):
    if value is None:
        return None
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        if np.isnan(value):
            return None
        return float(value)
    if isinstance(value, float) and np.isnan(value):
        return None
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    return value


def dataframe_to_records(df):
    df = df.replace({np.nan: None})
    return [
        {key: clean_value(value) for key, value in row.items()}
        for row in df.to_dict(orient="records")
    ]


def series_counts(series):
    counts = series.fillna("Unknown").value_counts().reset_index()
    counts.columns = ["label", "value"]
    return dataframe_to_records(counts)


def numeric_list(series):
    return [clean_value(value) for value in series.dropna().tolist()]
