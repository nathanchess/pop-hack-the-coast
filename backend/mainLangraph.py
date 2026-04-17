from langgraph.graph import StateGraph, END

from model import model, AgentState, tools

from planner import make_main_ai_planner
from dataLoadingTool import data_loading_tool
from scriptWritingTool import script_writing_tool
from codeExecutionTool import code_execution_tool
from routerLogic import router_logic
from langchain_core.tools import tool


# --- State Definition ---

# --- 2. Tool Schemas (The "Blueprints") ---
@tool
def load(filename: str):
    """Loads a CSV file into a pandas DataFrame. Use this when the user mentions a specific dataset."""
    pass

@tool
def write(goal: str):
    """Generates Python code for analysis or plotting. Use this for calculations or visualizations."""
    pass


llm_with_tools = model.bind_tools([load, write])


workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("planner", make_main_ai_planner(llm_with_tools))
workflow.add_node("loader", data_loading_tool)
workflow.add_node("writer", script_writing_tool)
workflow.add_node("executor", code_execution_tool)


# Define Connections
workflow.set_entry_point("planner")

# Conditional logic to decide which tool to use
workflow.add_conditional_edges(
    "planner",
    router_logic,
    tools
)

# After a tool runs, it always goes back to the executor to run the code
workflow.add_edge("loader", "executor")
workflow.add_edge("writer", "executor")

# After execution, go back to the planner to see the results
workflow.add_edge("executor", "planner")

# Compile
app = workflow.compile()