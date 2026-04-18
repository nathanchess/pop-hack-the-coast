import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from typing import Annotated, TypedDict, List, Union
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import END
import langchain
from langchain_core.tools import tool

load_dotenv()
model = init_chat_model(
    "gpt-5.4",
    model_provider="openai",
    api_key=os.getenv("GPT_KEY"),
    max_retries=0,
    temperature=0
)

langchain.debug = True

class AgentState(TypedDict):
    # Tracks the conversation history
    messages: Annotated[List[BaseMessage], "The history of messages"]
    # Represents the virtual "Notebook" cells and their outputs
    notebook_cells: List[dict] 
    # Current active variables in the kernel (metadata only)
    internal_variables: dict
    # The next node to transition to
    next_step: str
    # The path to the unique notebook for this session
    notebook_path: str

def getJupyterNotebookContents(agentState) -> str:
    execution_history = ""
    recent_cells = [c for c in agentState.get("notebook_cells", []) if c["cell_type"] == "code"][-5:]
        
    for i, cell in enumerate(recent_cells):
        cell_id = i + 1
        cell_output = ""
        for out in cell.get("outputs", []):
            if out.get("output_type") == "stream":
                cell_output += out.get("text", "")
            elif "data" in out and "text/plain" in out["data"]:
                cell_output += out["data"]["text/plain"]
            elif out.get("output_type") == "error":
                # Combine the traceback lines into a single string
                cell_output += "\n".join(out.get("traceback", []))
        
        if cell_output:
            execution_history += f"\n--- CELL {cell_id} OUTPUT ---\n{cell_output}\n"

    return execution_history if execution_history else "No output yet."

#tools must match nodes defined in mainLangraph.py
tools = {
    "load": "loader",
    "write": "writer",
    "execute": "executor",
    "end": END
}
