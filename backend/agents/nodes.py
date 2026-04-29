from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from agents.state import AgentState
from agents.llm import reasoning_llm, fast_llm
from agents.tools import core_tools

def scout_node(state: AgentState) -> dict:
    """
    The Scout Agent is responsible for finding raw information.
    It has access to web search tools.
    """
    messages = state.get("messages", [])
    
    llm_with_tools = reasoning_llm.bind_tools(core_tools)
    
    # We prepend a system prompt telling the scout what to do
    system_msg = SystemMessage(content="You are the Scout Agent. Your job is to search for raw information relevant to the user's latest request. Use the web search tool if needed.")
    
    response = llm_with_tools.invoke([system_msg] + list(messages))
    
    # Return the new message to append to the state, and also optionally store scout results
    return {
        "messages": [response],
        "scout_results": response.content if not response.tool_calls else "Scout used tools."
    }

def verify_node(state: AgentState) -> dict:
    """
    The Verify Agent fact-checks the Scout's findings or the user's claims.
    """
    messages = state.get("messages", [])
    scout_results = state.get("scout_results", "")
    
    system_msg = SystemMessage(
        content=f"You are the Verify Agent. Fact-check the recent conversation and scout findings: {scout_results}. "
                "Output a brief verification status: either 'Verified' or 'Flagged' with reasons."
    )
    
    response = reasoning_llm.invoke([system_msg] + list(messages))
    
    return {
        "messages": [response],
        "verification_status": response.content
    }

def summarizer_node(state: AgentState) -> dict:
    """
    The Summarizer Agent compiles everything into a clean, final output.
    """
    messages = state.get("messages", [])
    verification_status = state.get("verification_status", "None")
    
    system_msg = SystemMessage(
        content=f"You are the Summarizer Agent. Based on the conversation history and the verification status ({verification_status}), "
                "provide a clear, comprehensive final answer to the user."
    )
    
    response = fast_llm.invoke([system_msg] + list(messages))
    
    return {
        "messages": [response],
        "final_output": response.content
    }

from services.ranking import rank_items

def ranker_node(state: AgentState) -> dict:
    """The Ranker Agent reorders items based on preferences."""
    # Example logic: Assume scout results contain items to rank
    scout_results = state.get("scout_results", "")
    user_id = state.get("user_id")
    
    # In a real app, fetch preferences from DB
    mock_prefs = "Highly values enterprise software and AI scalability." if user_id else "No preferences"
    
    system_msg = SystemMessage(
        content=f"You are the Ranker Agent. The user's preferences are: {mock_prefs}. "
                f"Rank or highlight the most important parts of these findings: {scout_results}"
    )
    
    response = reasoning_llm.invoke([system_msg])
    
    return {
        "messages": [response],
        # Update scout results with ranked results
        "scout_results": response.content 
    }

def personalization_node(state: AgentState) -> dict:
    """The Morning Briefing / Personalization Agent tailors the final message."""
    messages = state.get("messages", [])
    user_id = state.get("user_id")
    
    mock_prefs = "Prefers bullet points and concise professional tone." if user_id else "Standard tone."
    
    system_msg = SystemMessage(
        content=f"You are the Personalization Agent (Morning Briefing format). "
                f"Format the following conversation history into a Morning Briefing based on user preferences: {mock_prefs}."
    )
    
    response = fast_llm.invoke([system_msg] + list(messages))
    
    return {
        "messages": [response],
        "final_output": response.content
    }
