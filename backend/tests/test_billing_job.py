from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.models import Instance, Transaction, UsageRecord, User
from app.services.billing_job import current_hour, run_hourly_billing

HOUR = datetime(2026, 8, 12, 4, 0, 0, tzinfo=timezone.utc)


def storage_cost(storage_gb: int) -> int:
    return storage_gb * settings.storage_rate_per_gb_hour_cents


# --- the critical rule: running the job twice for one hour charges once ---


def test_running_job_twice_for_same_hour_charges_once(db, make_user, make_plan, make_instance):
    user = make_user(balance_cents=100_000)
    plan = make_plan(rate_running_cents=149, storage_gb=100)
    make_instance(user, plan, status="running")

    expected_charge = 149 + storage_cost(100)

    run_hourly_billing(HOUR)
    db.expire_all()
    balance_after_first = db.get(User, user.id).balance_cents
    assert balance_after_first == 100_000 - expected_charge

    run_hourly_billing(HOUR)
    db.expire_all()
    assert db.get(User, user.id).balance_cents == balance_after_first
    assert db.query(UsageRecord).count() == 1


def test_running_job_many_times_for_same_hour_stays_idempotent(
    db, make_user, make_plan, make_instance
):
    user = make_user(balance_cents=100_000)
    plan = make_plan(rate_running_cents=149, storage_gb=100)
    make_instance(user, plan, status="running")

    for _ in range(5):
        run_hourly_billing(HOUR)

    db.expire_all()
    expected_charge = 149 + storage_cost(100)
    assert db.get(User, user.id).balance_cents == 100_000 - expected_charge
    assert db.query(UsageRecord).count() == 1


def test_different_hours_each_charge(db, make_user, make_plan, make_instance):
    user = make_user(balance_cents=100_000)
    plan = make_plan(rate_running_cents=149, storage_gb=100)
    make_instance(user, plan, status="running")

    run_hourly_billing(HOUR)
    run_hourly_billing(HOUR - timedelta(hours=1))
    run_hourly_billing(HOUR - timedelta(hours=2))

    db.expire_all()
    expected_charge = (149 + storage_cost(100)) * 3
    assert db.get(User, user.id).balance_cents == 100_000 - expected_charge
    assert db.query(UsageRecord).count() == 3


# --- rate selection by status ---


def test_running_instance_uses_running_rate(db, make_user, make_plan, make_instance):
    user = make_user(balance_cents=100_000)
    plan = make_plan(rate_running_cents=500, rate_stopped_cents=1, storage_gb=10)
    make_instance(user, plan, status="running")

    run_hourly_billing(HOUR)

    record = db.query(UsageRecord).one()
    assert record.compute_cost_cents == 500
    assert record.storage_cost_cents == storage_cost(10)


def test_stopped_instance_uses_stopped_rate(db, make_user, make_plan, make_instance):
    user = make_user(balance_cents=100_000)
    plan = make_plan(rate_running_cents=500, rate_stopped_cents=1, storage_gb=10)
    make_instance(user, plan, status="stopped")

    run_hourly_billing(HOUR)

    record = db.query(UsageRecord).one()
    assert record.compute_cost_cents == 1


def test_provisioning_instance_is_billed_at_stopped_rate(
    db, make_user, make_plan, make_instance
):
    user = make_user(balance_cents=100_000)
    plan = make_plan(rate_running_cents=500, rate_stopped_cents=7, storage_gb=10)
    make_instance(user, plan, status="provisioning")

    run_hourly_billing(HOUR)

    assert db.query(UsageRecord).one().compute_cost_cents == 7


def test_terminated_instance_is_not_billed(db, make_user, make_plan, make_instance):
    user = make_user(balance_cents=100_000)
    plan = make_plan(rate_running_cents=500, storage_gb=10)
    make_instance(user, plan, status="terminated")

    run_hourly_billing(HOUR)

    db.expire_all()
    assert db.query(UsageRecord).count() == 0
    assert db.get(User, user.id).balance_cents == 100_000


def test_rate_is_taken_from_instance_not_plan(db, make_user, make_plan, make_instance):
    """Rates are frozen at deploy time; changing the plan must not change billing."""
    user = make_user(balance_cents=100_000)
    plan = make_plan(rate_running_cents=100, storage_gb=10)
    make_instance(user, plan, status="running")

    plan.rate_running_cents = 9_999
    db.commit()

    run_hourly_billing(HOUR)

    assert db.query(UsageRecord).one().compute_cost_cents == 100


# --- storage ---


def test_storage_is_charged_per_gb(db, make_user, make_plan, make_instance):
    user = make_user(balance_cents=100_000)
    plan = make_plan(rate_running_cents=0, storage_gb=500)
    make_instance(user, plan, status="running")

    run_hourly_billing(HOUR)

    assert db.query(UsageRecord).one().storage_cost_cents == storage_cost(500)


# --- auto top-up ---


def test_auto_topup_fires_below_threshold(db, make_user, make_plan, make_instance):
    user = make_user(balance_cents=50_100, alert_threshold_cents=50_000, topup_amount_cents=20_000)
    plan = make_plan(rate_running_cents=149, storage_gb=100)
    make_instance(user, plan, status="running")

    charge = 149 + storage_cost(100)
    run_hourly_billing(HOUR)

    db.expire_all()
    assert db.get(User, user.id).balance_cents == 50_100 - charge + 20_000

    topup = db.query(Transaction).filter(Transaction.type == "auto_topup").one()
    assert topup.amount_cents == 20_000
    assert topup.user_id == user.id


def test_auto_topup_does_not_fire_above_threshold(db, make_user, make_plan, make_instance):
    user = make_user(balance_cents=90_000, alert_threshold_cents=10_000, topup_amount_cents=20_000)
    plan = make_plan(rate_running_cents=149, storage_gb=100)
    make_instance(user, plan, status="running")

    run_hourly_billing(HOUR)

    db.expire_all()
    assert db.query(Transaction).count() == 0


def test_zero_threshold_disables_auto_topup(db, make_user, make_plan, make_instance):
    user = make_user(balance_cents=100, alert_threshold_cents=0, topup_amount_cents=20_000)
    plan = make_plan(rate_running_cents=149, storage_gb=100)
    make_instance(user, plan, status="running")

    run_hourly_billing(HOUR)

    db.expire_all()
    assert db.query(Transaction).count() == 0


# --- stop on zero balance ---


def test_running_instances_stop_when_balance_hits_zero(
    db, make_user, make_plan, make_instance
):
    user = make_user(balance_cents=100)
    plan = make_plan(rate_running_cents=149, storage_gb=100)
    instance = make_instance(user, plan, status="running")

    run_hourly_billing(HOUR)

    db.expire_all()
    assert db.get(User, user.id).balance_cents <= 0
    assert db.get(Instance, instance.id).status == "stopped"


def test_instances_keep_running_when_balance_remains(db, make_user, make_plan, make_instance):
    user = make_user(balance_cents=100_000)
    plan = make_plan(rate_running_cents=149, storage_gb=100)
    instance = make_instance(user, plan, status="running")

    run_hourly_billing(HOUR)

    db.expire_all()
    assert db.get(Instance, instance.id).status == "running"


def test_terminated_instances_are_not_revived_or_stopped(
    db, make_user, make_plan, make_instance
):
    user = make_user(balance_cents=100)
    plan = make_plan(rate_running_cents=149, storage_gb=100)
    running = make_instance(user, plan, status="running")
    terminated = make_instance(user, plan, status="terminated")

    run_hourly_billing(HOUR)

    db.expire_all()
    assert db.get(Instance, running.id).status == "stopped"
    assert db.get(Instance, terminated.id).status == "terminated"


# --- multi-user isolation ---


def test_each_user_is_charged_only_for_their_own_instances(
    db, make_user, make_plan, make_instance
):
    plan = make_plan(rate_running_cents=100, storage_gb=10)
    user_a = make_user(balance_cents=100_000)
    user_b = make_user(balance_cents=100_000)
    make_instance(user_a, plan, status="running")
    make_instance(user_b, plan, status="running")
    make_instance(user_b, plan, status="running")

    charge = 100 + storage_cost(10)
    run_hourly_billing(HOUR)

    db.expire_all()
    assert db.get(User, user_a.id).balance_cents == 100_000 - charge
    assert db.get(User, user_b.id).balance_cents == 100_000 - charge * 2


def test_one_users_empty_balance_does_not_stop_another_users_instances(
    db, make_user, make_plan, make_instance
):
    plan = make_plan(rate_running_cents=100, storage_gb=10)
    broke = make_user(balance_cents=1)
    rich = make_user(balance_cents=100_000)
    broke_instance = make_instance(broke, plan, status="running")
    rich_instance = make_instance(rich, plan, status="running")

    run_hourly_billing(HOUR)

    db.expire_all()
    assert db.get(Instance, broke_instance.id).status == "stopped"
    assert db.get(Instance, rich_instance.id).status == "running"


# --- default hour ---


def test_defaults_to_current_hour_truncated(db, make_user, make_plan, make_instance):
    user = make_user(balance_cents=100_000)
    plan = make_plan(rate_running_cents=100, storage_gb=10)
    make_instance(user, plan, status="running")

    run_hourly_billing()

    record = db.query(UsageRecord).one()
    assert record.hour == current_hour()
    assert record.hour.minute == 0
    assert record.hour.second == 0
