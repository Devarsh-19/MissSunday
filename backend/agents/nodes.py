from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from pydantic import BaseModel, Field
from typing import List, Literal
from agents.state import AgentState
from agents.llm import reasoning_llm, fast_llm
from agents.tools import core_tools
import json

class VerificationResult(BaseModel):
    status: Literal["VERIFIED", "FLAGGED", "INCOMPLETE"] = Field(description="The verification status of the information.")
    notes: str = Field(description="Detailed notes on what was verified or what is missing.")
    critique: str | None = Field(description="Feedback for the Scout agent if status is INCOMPLETE.")

def scout_node(state: AgentState) -> dict:
    """
    The Scout Agent finds raw information and sources.
    """
    messages = state.get("messages", [])
    critique = state.get("critique")
    
    llm_with_tools = reasoning_llm.bind_tools(core_tools)
    
    system_prompt = (
        "You are the Scout Agent, a master of deep research. Your goal is to gather comprehensive "
        "information and high-quality sources for the user's request.\n\n"
        "Focus on finding concrete facts, dates, and names. Use the search_web or get_latest_news tools."
    )
    
    if critique:
        system_prompt += f"\n\nREFINEMENT NEEDED: Previous research was critiqued: {critique}. Please adjust your search to address these points."

    system_msg = SystemMessage(content=system_prompt)
    
    response = llm_with_tools.invoke([system_msg] + list(messages))
    
    return {
        "messages": [response],
        "scout_results": response.content if not response.tool_calls else state.get("scout_results")
    }

def verify_node(state: AgentState) -> dict:
    """
    The Verify Agent fact-checks findings.
    """
    messages = state.get("messages", [])
    scout_results = state.get("scout_results", "")
    attempts = state.get("verification_attempts", 0)
    
    llm_with_structured = reasoning_llm.with_structured_output(VerificationResult)
    
    system_msg = SystemMessage(
        content=(
            "You are the Verify Agent. Your job is to rigorously fact-check the gathered information.\n"
            f"Findings to check: {scout_results}\n\n"
            "If the information is sparse or contains contradictions, mark it as INCOMPLETE and provide a critique for the Scout.\n"
            "If you find factual errors, mark it as FLAGGED.\n"
            "If everything looks solid and cited, mark it as VERIFIED."
        )
    )
    
    response = llm_with_structured.invoke([system_msg] + list(messages))
    
    return {
        "verification_status": response.status,
        "verification_notes": response.notes,
        "critique": response.critique if response.status == "INCOMPLETE" else None,
        "verification_attempts": attempts + 1
    }

def analyst_node(state: AgentState) -> dict:
    """
    The Analyst Agent synthesizes findings and identifies trends.
    """
    messages = state.get("messages", [])
    scout_results = state.get("scout_results", "")
    verification_notes = state.get("verification_notes", "")
    
    system_msg = SystemMessage(
        content=(
            "You are the Senior Intelligence Analyst. Your task is to synthesize the following research "
            "findings and verification notes into a high-level analysis.\n\n"
            f"Research Findings: {scout_results}\n"
            f"Verification Notes: {verification_notes}\n\n"
            "Identify key trends, potential impacts, and connect the dots. "
            "Provide a sophisticated, professional perspective."
        )
    )
    
    response = reasoning_llm.invoke([system_msg] + list(messages))
    
    return {
        "messages": [response],
        "analysis": response.content
    }

def reporter_node(state: AgentState) -> dict:
    """
    The Reporter Agent creates the final premium Markdown report.
    """
    messages = state.get("messages", [])
    analysis = state.get("analysis", "")
    user_id = state.get("user_id")
    verification_status = state.get("verification_status", "UNKNOWN")
    
    # Simple personalization logic
    tone = "concise and professional" if user_id else "detailed and cinematic"
    
    system_msg = SystemMessage(
        content=(
            "You are the Lead Intelligence Reporter for 'Miss Sunday'. Your job is to create a premium, "
            "cinematic intelligence report based on the following analysis.\n\n"
            f"Analysis: {analysis}\n"
            f"Verification Status: {verification_status}\n\n"
            f"Style Guidelines: Use {tone} tone. Use high-end Markdown formatting: "
            "clear H1/H2 headers, bold text for emphasis, and bullet points. "
            "Include a 'Verification Status' section at the end. "
            "The report should feel like it's from a top-tier intelligence agency."
        )
    )
    
    response = fast_llm.invoke([system_msg] + list(messages))
    
    return {
        "messages": [response],
        "final_output": response.content
    }
