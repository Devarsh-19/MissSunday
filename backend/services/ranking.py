import logging
from agents.llm import fast_llm
from langchain_core.messages import SystemMessage, HumanMessage

logger = logging.getLogger(__name__)

async def rank_items(items: list[dict], user_preferences: str) -> list[dict]:
    """
    Uses the fast LLM to rank a list of items (e.g. news articles) based on user preferences.
    """
    logger.info(f"Ranking {len(items)} items based on user preferences.")
    
    if not items:
        return []
        
    titles = [item.get("title", "") for item in items]
    
    system_msg = SystemMessage(
        content=f"You are the Ranker Agent. Rank the following items based on these user preferences: {user_preferences}. "
                "Return a comma-separated list of the indices (0-indexed) in order of highest relevance to lowest."
    )
    
    human_msg = HumanMessage(
        content=f"Items to rank:\n" + "\n".join([f"[{i}] {t}" for i, t in enumerate(titles)])
    )
    
    try:
        response = fast_llm.invoke([system_msg, human_msg])
        
        # Parse the comma-separated indices
        ranked_indices = [int(idx.strip()) for idx in response.content.split(",") if idx.strip().isdigit()]
        
        # Reorder items
        ranked_items = [items[i] for i in ranked_indices if i < len(items)]
        
        # Append any items that were missed
        for i in range(len(items)):
            if i not in ranked_indices:
                ranked_items.append(items[i])
                
        return ranked_items
    except Exception as e:
        logger.error(f"Failed to rank items: {e}")
        return items
