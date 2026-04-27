import pytest
import io
from app.utils.data_loader import validate_and_clean_csv


VALID_CSV = b"""record_date,product_id,product_name,category,segment,revenue,cost,profit,discount_rate,quantity
2024-01-01,P001,Enterprise Suite,Software,Enterprise,100000,65000,35000,0.08,120
2024-02-01,P001,Enterprise Suite,Software,Enterprise,105000,68000,37000,0.07,125
"""

MISSING_COL_CSV = b"""record_date,product_id,revenue
2024-01-01,P001,100000
"""

BAD_DATE_CSV = b"""record_date,product_id,product_name,category,segment,revenue,cost,profit,discount_rate,quantity
not-a-date,P001,Name,Software,Enterprise,1000,700,300,0.05,10
"""


def test_valid_csv_parses():
    df, quality, warnings = validate_and_clean_csv(VALID_CSV)
    assert len(df) == 2
    assert quality == 100.0


def test_missing_column_raises():
    with pytest.raises(ValueError, match="Missing required columns"):
        validate_and_clean_csv(MISSING_COL_CSV)


def test_bad_date_raises():
    with pytest.raises(ValueError, match="record_date"):
        validate_and_clean_csv(BAD_DATE_CSV)


def test_missing_discount_defaults_to_zero():
    csv = b"""record_date,product_id,product_name,category,segment,revenue,cost,profit,discount_rate,quantity
2024-01-01,P001,Name,Software,Enterprise,1000,700,300,,10
"""
    df, quality, warnings = validate_and_clean_csv(csv)
    assert df["discount_rate"].iloc[0] == 0.0
    assert any("discount_rate" in w for w in warnings)


def test_duplicate_rows_removed():
    csv = VALID_CSV + b"2024-01-01,P001,Enterprise Suite,Software,Enterprise,100000,65000,35000,0.08,120\n"
    df, quality, warnings = validate_and_clean_csv(csv)
    assert len(df) == 2
    assert any("duplicate" in w.lower() for w in warnings)


def test_upload_api(client, finance_headers):
    resp = client.post(
        "/api/data/upload",
        headers=finance_headers,
        files={"file": ("test.csv", io.BytesIO(VALID_CSV), "text/csv")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["rows_loaded"] > 0
    assert data["quality_score"] == 100.0
