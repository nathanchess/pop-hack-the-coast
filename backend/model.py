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
    "gpt-4.1-nano",
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

#tools must match nodes defined in mainLangraph.py
tools = {
    "load": "loader",
    "write": "writer",
    "execute": "executor",
    "end": END
}
