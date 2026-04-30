import operator
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    """
    The state of the graph.
    messages: The chat history and current messages. Annotated with operator.add to append new messages.
    user_id: The ID of the user requesting the workflow (for personalization).
    scout_results: Information gathered by the Scout Agent.
    sources: List of dictionaries containing URL, title, and snippet.
    verification_status: Status ('VERIFIED', 'FLAGGED', 'INCOMPLETE').
    verification_notes: Detailed notes from the Verify Agent.
    verification_attempts: Counter for loops.
    critique: Feedback from Verify to Scout.
    analysis: Synthesized reasoning from the Analyst Agent.
    final_output: The final synthesized output from the graph.
    """
    messages: Annotated[Sequence[BaseMessage], operator.add]
    user_id: str | None
    scout_results: str | None
    sources: list[dict] | None
    verification_status: str | None
    verification_notes: str | None
    verification_attempts: int
    critique: str | None
    analysis: str | None
    final_output: str | None
