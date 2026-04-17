from langchain_core.messages import HumanMessage, SystemMessage

# from model import model
from model import AgentState, tools

def make_main_ai_planner(llm):
    """A wrapper that returns the actual node function"""
    def main_ai_planner(state: AgentState):
        """
        The 'Brain' node. Analyzes the notebook state and decides 
        which tool to invoke or if the analysis is complete.
        """
        print("--- PLANNING NEXT MOVE ---")
        
        # 1. Prepare the System Prompt
        # We provide the AI with context about the files and current variables
        system_prompt = f"""You are a Data Science Agent. 
        Current Notebook State: {len(state['notebook_cells'])} cells executed.
        Current Variables: {state['internal_variables']}
        
        Your goal is to fulfill the user's request by writing and executing Python code.
        - If you need to see data, use the 'loader'.
        - If you need to perform calculations or plots, use the 'writer'.
        - Once you have the final answer, respond directly to the user."""

        # 2. Add the System Message and History
        messages = [SystemMessage(content=system_prompt)] + state["messages"]

        response = llm.invoke(messages)

        # 4. Determine the Next Step
        # If the model wants to call a tool, we route it. 
        # If it provides a text response, we end.
        if response.tool_calls:
            tool_name = response.tool_calls[0]["name"]
            for key in tools.keys():
                if key in tool_name:
                    next_step = key
        else:
            next_step = "end"

        # 5. Update State
        return {
            **state,
            "messages": state["messages"] + [response],
            "next_step": next_step
        }
    
    return main_ai_planner

