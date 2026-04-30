import pytest
import pandas as pd
import numpy as np
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.financial_record import FinancialRecord
from app.utils.auth import get_password_hash

TEST_DB_URL = "sqlite:///./test_notium.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    import os
    if os.path.exists("test_notium.db"):
        os.remove("test_notium.db")


@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestSession(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db):
    def override_db():
        yield db
    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def seed_user(db):
    user = db.query(User).filter(User.email == "test@test.com").first()
    if not user:
        user = User(
            email="test@test.com",
            name="Test User",
            hashed_password=get_password_hash("Test1234!"),
            role="decision_maker",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@pytest.fixture
def finance_user(db):
    user = db.query(User).filter(User.email == "finance@test.com").first()
    if not user:
        user = User(
            email="finance@test.com",
            name="Finance User",
            hashed_password=get_password_hash("Test1234!"),
            role="finance_team",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, seed_user):
    resp = client.post("/api/auth/login", json={"email": "test@test.com", "password": "Test1234!"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def finance_headers(client, finance_user):
    resp = client.post("/api/auth/login", json={"email": "finance@test.com", "password": "Test1234!"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_df():
    rng = np.random.default_rng(0)
    rows = []
    products = [
        ("P001", "Enterprise Suite", "Software", "Enterprise"),
        ("P002", "Analytics Pro", "Software", "Mid-Market"),
    ]
    for m in range(24):
        d = date(2022 + m // 12, m % 12 + 1, 1)
        for pid, name, cat, seg in products:
            rev = 50000 + rng.normal(0, 2000)
            cost = rev * 0.65
            rows.append({
                "record_date": d,
                "product_id": pid,
                "product_name": name,
                "category": cat,
                "segment": seg,
                "revenue": round(rev, 2),
                "cost": round(cost, 2),
                "profit": round(rev - cost, 2),
                "discount_rate": round(rng.uniform(0.05, 0.10), 4),
                "quantity": int(rng.normal(100, 5)),
            })
    return pd.DataFrame(rows)


@pytest.fixture
def seed_records(db, sample_df):
    records = [FinancialRecord(**row) for row in sample_df.to_dict("records")]
    db.bulk_save_objects(records)
    db.commit()
    return sample_df
