from langchain_groq import ChatGroq
from core.config import settings

def get_llm(model_name: str = "llama-3.3-70b-versatile", temperature: float = 0.1):
    """
    Returns an instance of ChatGroq configured with our API key.
    """
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=model_name,
        temperature=temperature
    )

# Pre-configured instances for different purposes
fast_llm = get_llm(model_name="llama-3.1-8b-instant", temperature=0.1)
reasoning_llm = get_llm(model_name="llama-3.1-8b-instant", temperature=0.1)
creative_llm = get_llm(model_name="llama-3.3-70b-versatile", temperature=0.7)
