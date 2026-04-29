import logging
from agents.tools import tavily_client

logger = logging.getLogger(__name__)

async def fetch_news(keyword: str = None):
    """
    Fetches the latest news via Tavily based on a keyword.
    """
    query = f"Latest news about {keyword} today" if keyword else "Latest world news today"
    logger.info(f"Fetching news with query: {query}")
    try:
        response = tavily_client.search(
            query=query,
            search_depth="advanced",
            include_raw_content=False,
            max_results=10
        )
        
        results = response.get("results", [])
        for item in results:
            logger.info(f"Fetched News: {item.get('title')} - {item.get('url')}")
            
        return results
    except Exception as e:
        logger.error(f"Failed to fetch news: {e}")
        return []

async def ingest_daily_news():
    """
    Background job to ingest general news.
    """
    logger.info("Starting daily news ingestion...")
    return await fetch_news("Technology and AI")
