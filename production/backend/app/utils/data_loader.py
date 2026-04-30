import pandas as pd
import numpy as np
from typing import Tuple, List
from io import BytesIO


REQUIRED_COLUMNS = {
    "record_date", "product_id", "product_name", "category",
    "segment", "revenue", "cost", "profit", "discount_rate", "quantity"
}


def validate_and_clean_csv(content: bytes) -> Tuple[pd.DataFrame, float, List[str]]:
    warnings = []
    try:
        df = pd.read_csv(BytesIO(content))
    except Exception as e:
        raise ValueError(f"Cannot parse CSV: {e}")

    missing_cols = REQUIRED_COLUMNS - set(df.columns)
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")

    total_rows = len(df)
    rejected = 0

    # Parse dates
    try:
        df["record_date"] = pd.to_datetime(df["record_date"])
    except Exception:
        raise ValueError("record_date column must be parseable as a date")

    # Fill missing discount_rate
    missing_discount = df["discount_rate"].isna().sum()
    if missing_discount > 0:
        df["discount_rate"] = df["discount_rate"].fillna(0.0)
        warnings.append(f"{missing_discount} rows with missing discount_rate — defaulted to 0")

    # Drop rows with missing critical fields
    critical = ["product_id", "product_name", "revenue", "cost", "profit", "quantity"]
    before = len(df)
    df = df.dropna(subset=critical)
    rejected += before - len(df)

    # Numeric conversion
    numeric_cols = ["revenue", "cost", "profit", "discount_rate", "quantity"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    before = len(df)
    df = df.dropna(subset=numeric_cols)
    rejected += before - len(df)

    # Remove exact duplicates
    before = len(df)
    df = df.drop_duplicates(subset=["record_date", "product_id"])
    dupes = before - len(df)
    if dupes > 0:
        warnings.append(f"{dupes} duplicate rows removed")
        rejected += dupes

    rows_loaded = len(df)
    quality_score = round((rows_loaded / total_rows) * 100, 2) if total_rows > 0 else 0.0

    return df, quality_score, warnings
