
from typing import TypedDict, Annotated, Sequence, Literal
import operator

class AgentState(TypedDict):
    verification_attempts: int

state: AgentState = {}
attempts = state.get("verification_attempts", 0)
print(f"Attempts from empty dict: {attempts}")

state["verification_attempts"] = None
attempts = state.get("verification_attempts", 0)
print(f"Attempts from None value: {attempts}")
