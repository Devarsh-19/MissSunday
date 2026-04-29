import operator
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    """
    The state of the graph.
    messages: The chat history and current messages. Annotated with operator.add to append new messages.
    user_id: The ID of the user requesting the workflow (for personalization).
    scout_results: Information gathered by the Scout Agent.
    verification_status: Status or notes from the Verify Agent.
    final_output: The final synthesized output from the graph.
    """
    messages: Annotated[Sequence[BaseMessage], operator.add]
    user_id: str | None
    scout_results: str | None
    verification_status: str | None
    final_output: str | None
