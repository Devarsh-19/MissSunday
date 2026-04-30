import logging
from agents.tools import tavily_client
from agents.llm import fast_llm
from langchain_core.messages import SystemMessage, HumanMessage

logger = logging.getLogger(__name__)

async def fetch_news(keyword: str = None, max_results: int = 10):
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
            max_results=max_results
        )
        
        results = response.get("results", [])
        return results
    except Exception as e:
        logger.error(f"Failed to fetch news: {e}")
        return []

async def summarize_news_item(title: str, content: str):
    """
    Uses LLM to create a punchy 1-2 sentence update from news content.
    """
    system_msg = SystemMessage(content="You are a professional news editor. Convert the following news item into a punchy, 1-2 sentence update. Focus on the core facts and impact. Output ONLY the update itself. Do not include introductory phrases like 'Here is the update' or 'The core facts are'. Use Markdown for emphasis if needed.")
    human_msg = HumanMessage(content=f"Title: {title}\nContent: {content}")
    
    try:
        response = fast_llm.invoke([system_msg, human_msg])
        return response.content.strip()
    except Exception as e:
        logger.error(f"Failed to summarize news item: {e}")
        return content[:150] + "..."

async def get_news_updates(category: str = "World", count: int = 5):
    """
    Fetches and summarizes news for a specific category.
    """
    raw_news = await fetch_news(category, max_results=count)
    updates = []
    
    for item in raw_news:
        summary = await summarize_news_item(item.get("title", ""), item.get("content", "") or item.get("snippet", ""))
        updates.append({
            "title": item.get("title"),
            "update": summary,
            "url": item.get("url"),
            "source": item.get("url", "").split("/")[2] if "://" in item.get("url", "") else "Unknown",
            "category": category,
            "published_date": item.get("published_date", "Recently")
        })
    
    return updates

async def ingest_daily_news():
    """
    Background job to ingest general news.
    """
    logger.info("Starting daily news ingestion...")
    return await get_news_updates("Technology and AI")
