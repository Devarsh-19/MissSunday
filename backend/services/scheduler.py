import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from services.news import ingest_daily_news

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

def setup_scheduler():
    """
    Configures and starts the background task scheduler.
    """
    logger.info("Setting up background scheduler...")
    
    # Schedule the news ingestion to run every morning at 6:00 AM
    scheduler.add_job(
        ingest_daily_news,
        trigger=CronTrigger(hour=6, minute=0),
        id="daily_news_ingestion",
        name="Ingest morning news",
        replace_existing=True,
    )
    
    # Start the scheduler
    scheduler.start()
    logger.info("Scheduler started successfully.")
    
def shutdown_scheduler():
    logger.info("Shutting down background scheduler...")
    scheduler.shutdown()
