from typing import Annotated, TypedDict, List, Union
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model


from planner import main_ai_planner
from dataLoadingTool import data_loading_tool
from scriptWritingTool import script_writing_tool
from codeExecutionTool import code_execution_tool
from routerLogic import router_logic

load_dotenv()
model = init_chat_model(
    "google-genai:gemini-3-flash-preview", 
    temperature=0
)

# --- State Definition ---
class AgentState(TypedDict):
    # Tracks the conversation history
    messages: Annotated[List[BaseMessage], "The history of messages"]
    # Represents the virtual "Notebook" cells and their outputs
    notebook_cells: List[dict] 
    # Current active variables in the kernel (metadata only)
    internal_variables: dict
    # The next node to transition to
    next_step: str


workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("planner", main_ai_planner)
workflow.add_node("loader", data_loading_tool)
workflow.add_node("writer", script_writing_tool)
workflow.add_node("executor", code_execution_tool)

# Define Connections
workflow.set_entry_point("planner")

# Conditional logic to decide which tool to use
workflow.add_conditional_edges(
    "planner",
    router_logic,
    {
        "load": "loader",
        "write": "writer",
        "execute": "executor",
        "end": END
    }
)

# After a tool runs, it always goes back to the executor to run the code
workflow.add_edge("loader", "executor")
workflow.add_edge("writer", "executor")

# After execution, go back to the planner to see the results
workflow.add_edge("executor", "planner")

# Compile
app = workflow.compile()