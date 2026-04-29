from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from agents.state import AgentState
from agents.nodes import scout_node, verify_node, summarizer_node, ranker_node, personalization_node
from agents.tools import core_tools

def build_graph():
    """
    Builds and compiles the LangGraph workflow.
    """
    # Initialize the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("scout", scout_node)
    workflow.add_node("tools", ToolNode(core_tools)) # Prebuilt node to execute tools
    workflow.add_node("verify", verify_node)
    workflow.add_node("ranker", ranker_node)
    workflow.add_node("summarizer", summarizer_node)
    workflow.add_node("personalization", personalization_node)
    
    # Define routing logic for tool usage
    def should_continue(state: AgentState):
        """Return the next node to execute."""
        messages = state["messages"]
        last_message = messages[-1]
        
        # If there is a tool call, route to tools
        if last_message.tool_calls:
            return "tools"
        
        # Otherwise, move to verify
        return "verify"
    
    # Add edges
    workflow.set_entry_point("scout")
    
    # Scout decides whether to use tools or go to verify
    workflow.add_conditional_edges(
        "scout",
        should_continue,
        {
            "tools": "tools",
            "verify": "verify"
        }
    )
    
    # After tools are executed, go back to scout to evaluate results
    workflow.add_edge("tools", "scout")
    
    # After verify, go to ranker
    workflow.add_edge("verify", "ranker")
    
    # After ranker, go to summarizer
    workflow.add_edge("ranker", "summarizer")
    
    # After summarizer, go to personalization (morning briefing format)
    workflow.add_edge("summarizer", "personalization")
    
    # After personalization, end the graph
    workflow.add_edge("personalization", END)
    
    # Compile
    app = workflow.compile()
    return app

# Expose a compiled instance
agent_graph = build_graph()
