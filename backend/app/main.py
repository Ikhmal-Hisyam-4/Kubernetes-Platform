from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    api_keys,
    auth,
    billing,
    catalog,
    dashboard,
    instances,
    ssh_keys,
    usage,
)
from app.core.config import settings
from app.services.billing_job import run_hourly_billing

scheduler = BackgroundScheduler(timezone="UTC")


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(
        run_hourly_billing,
        CronTrigger(minute=0),
        id="hourly_billing",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
    scheduler.start()
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)


app = FastAPI(title="Gpu.kubex API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(catalog.router)
app.include_router(instances.router)
app.include_router(billing.router)
app.include_router(usage.router)
app.include_router(dashboard.router)
app.include_router(ssh_keys.router)
app.include_router(api_keys.router)


@app.get("/health")
def health():
    return {"status": "ok"}
