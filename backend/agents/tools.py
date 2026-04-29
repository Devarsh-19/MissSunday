from langchain_core.tools import tool
from tavily import TavilyClient
from core.config import settings

# Initialize Tavily Client
tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)

@tool
def search_web(query: str) -> dict:
    """
    Searches the web for the given query using Tavily.
    Returns a dictionary with a 'context' string and a list of 'sources' (title, url, snippet).
    Use this for broad information gathering.
    """
    try:
        # Get structured results
        response = tavily_client.search(query=query, search_depth="advanced", max_results=5)
        results = response.get("results", [])
        
        context = "\n\n".join([f"Source: {r.get('url')}\nContent: {r.get('content') or r.get('snippet')}" for r in results])
        sources = [{"title": r.get("title"), "url": r.get("url"), "snippet": r.get("snippet")} for r in results]
        
        return {
            "context": context,
            "sources": sources
        }
    except Exception as e:
        return {"context": f"Error: {str(e)}", "sources": []}

@tool
def get_latest_news(topic: str = None) -> list[dict]:
    """
    Fetches the latest news updates for a specific topic or general news.
    Returns a list of news items with title, update, and url.
    """
    import asyncio
    from services.news import get_news_updates
    
    # Since this is a synchronous tool but get_news_updates is async
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    return loop.run_until_complete(get_news_updates(topic or "World", count=5))

# A list of core tools that can be bound to the LLM
core_tools = [search_web, get_latest_news]
