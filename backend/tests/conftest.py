import itertools
import os

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql://kubex:kubex_password@localhost:5432/kubex_test",
)

# The app reads settings at import time, so point it at the test DB first.
os.environ["DATABASE_URL"] = TEST_DATABASE_URL

from app.core import database  # noqa: E402
from app.core.database import Base  # noqa: E402
from app.models import Instance, Plan, User  # noqa: E402,F401

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# The billing job opens its own session via SessionLocal; bind it to the test DB.
database.engine = engine
database.SessionLocal = TestingSessionLocal


@pytest.fixture(scope="session", autouse=True)
def create_schema():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def clean_tables():
    """Each test starts from an empty DB."""
    with engine.begin() as conn:
        conn.execute(
            text(
                "TRUNCATE usage_records, instances, transactions, ssh_keys, "
                "api_keys, users, plans, os_images RESTART IDENTITY CASCADE"
            )
        )
    yield


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def make_user(db):
    counter = itertools.count(1)

    def _make(balance_cents=100_000, alert_threshold_cents=0, topup_amount_cents=0):
        user = User(
            email=f"user{next(counter)}@example.com",
            password_hash="x",
            full_name="Test User",
            balance_cents=balance_cents,
            alert_threshold_cents=alert_threshold_cents,
            topup_amount_cents=topup_amount_cents,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    return _make


@pytest.fixture
def make_plan(db):
    def _make(rate_running_cents=100, rate_stopped_cents=1, storage_gb=100, gpu_count=1):
        plan = Plan(
            type="gpu",
            name="Test Plan",
            gpu_model="Test GPU",
            gpu_count=gpu_count,
            vcpu=8,
            ram_gb=32,
            storage_gb=storage_gb,
            rate_running_cents=rate_running_cents,
            rate_stopped_cents=rate_stopped_cents,
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)
        return plan

    return _make


@pytest.fixture
def make_instance(db):
    def _make(user, plan, status="running", storage_gb=None):
        instance = Instance(
            user_id=user.id,
            plan_id=plan.id,
            name="test-instance",
            os_image="Ubuntu 24.04 LTS",
            status=status,
            storage_gb=plan.storage_gb if storage_gb is None else storage_gb,
            rate_running_cents=plan.rate_running_cents,
            rate_stopped_cents=plan.rate_stopped_cents,
        )
        db.add(instance)
        db.commit()
        db.refresh(instance)
        return instance

    return _make
