import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from typing import Annotated, TypedDict, List, Union
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import END

load_dotenv()
model = init_chat_model(
    "gemini-2.5-pro", 
    model_provider="google_genai",
    temperature=0
)

class AgentState(TypedDict):
    # Tracks the conversation history
    messages: Annotated[List[BaseMessage], "The history of messages"]
    # Represents the virtual "Notebook" cells and their outputs
    notebook_cells: List[dict] 
    # Current active variables in the kernel (metadata only)
    internal_variables: dict
    # The next node to transition to
    next_step: str

#tools must match nodes defined in mainLangraph.py
tools = {
    "load": "loader",
    "write": "writer",
    "execute": "executor",
    "end": END
}
