from pathlib import Path
from langchain_core.messages import AIMessage

def data_loading_tool(state):
    """
    Identifies the requested POP file based on the Planner's content 
    and generates a script for the executor.
    """
    # 1. Define the directory structure (relative to where the notebook runs)
    # Using posix style (forward slashes) is safer for generated Python code
    data_dir = "../public/data"
    
    # 2. Extract the filename from the last message content
    # This is exactly what we set in make_main_ai_planner
    requested_filename = state["messages"][-1].content.strip()

    full_path = f"{data_dir}/{requested_filename}"

    # 4. Generate the Jupyter-style code block
    # We assign it to a clear variable name based on the key
    var_name = f"df_{requested_filename.lower().replace('.', '_')}"
    code_block = f"""
        import pandas as pd
        import os

        file_path = "{full_path}"
        if os.path.exists(file_path):
            {var_name} = pd.read_csv(file_path)
            print(f"Successfully loaded {{file_path}} into {var_name}")
            print({var_name}.head())
        else:
            print(f"Error: File {{file_path}} not found.")
        """
    
    

    # 5. Return the update to the state
    # We add an AIMessage (or tool message) containing the code to be executed
    return {
        **state,
        "next_step": "execute",  # Route to the executor next
        "messages": state["messages"] + [AIMessage(content=code_block)]
    }