from langchain_core.tools import tool
from tavily import TavilyClient
from core.config import settings

# Initialize Tavily Client
tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)

@tool
def search_web(query: str) -> str:
    """
    Searches the web for the given query using Tavily and returns a summarized answer.
    Use this tool when you need real-time or up-to-date information from the internet.
    """
    try:
        response = tavily_client.get_search_context(query=query, search_depth="advanced")
        return response
    except Exception as e:
        return f"Error performing search: {str(e)}"

# A list of core tools that can be bound to the LLM
core_tools = [search_web]
