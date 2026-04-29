from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from agents.state import AgentState
from agents.nodes import scout_node, verify_node, analyst_node, reporter_node
from agents.tools import core_tools

def build_graph():
    """
    Builds and compiles the LangGraph workflow.
    """
    # Initialize the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("scout", scout_node)
    workflow.add_node("tools", ToolNode(core_tools))
    workflow.add_node("verify", verify_node)
    workflow.add_node("analyst", analyst_node)
    workflow.add_node("reporter", reporter_node)
    
    # Define routing logic for tool usage
    def should_continue_scout(state: AgentState):
        """Check if scout wants to use tools."""
        messages = state["messages"]
        last_message = messages[-1]
        
        if last_message.tool_calls:
            return "tools"
        return "verify"

    def should_continue_verify(state: AgentState):
        """Check if verification passed or if we need more research."""
        status = state.get("verification_status")
        attempts = state.get("verification_attempts", 0)
        
        # If incomplete and haven't tried too many times, go back to scout
        if status == "INCOMPLETE" and attempts < 3:
            return "scout"
        
        # Otherwise proceed to analysis
        return "analyst"
    
    # Add edges
    workflow.set_entry_point("scout")
    
    # Scout -> Tools or Verify
    workflow.add_conditional_edges(
        "scout",
        should_continue_scout,
        {
            "tools": "tools",
            "verify": "verify"
        }
    )
    
    # Tools -> Scout (to evaluate results)
    workflow.add_edge("tools", "scout")
    
    # Verify -> Scout (loop) or Analyst
    workflow.add_conditional_edges(
        "verify",
        should_continue_verify,
        {
            "scout": "scout",
            "analyst": "analyst"
        }
    )
    
    # Analyst -> Reporter
    workflow.add_edge("analyst", "reporter")
    
    # Reporter -> END
    workflow.add_edge("reporter", END)
    
    # Compile
    app = workflow.compile()
    return app

# Expose a compiled instance
agent_graph = build_graph()
