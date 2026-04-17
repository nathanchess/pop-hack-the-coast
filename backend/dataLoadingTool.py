from pathlib import Path
from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.tools import tool

def data_loading_tool(state):
    """
    Identifies the requested POP file based on the Planner's content 
    and generates a script for the executor.
    """
    # 1. Define the directory structure (relative to where the notebook runs)
    # Using posix style (forward slashes) is safer for generated Python code
    data_dir = "public/data"
    
    # 2. Extract the filename from the last message content
    # This is exactly what we set in make_main_ai_planner
    requested_filename = state["messages"][-1].content.strip()
    print("requested file:", requested_filename)

    full_path = f"{data_dir}/{requested_filename}"

    # 4. Generate a clean variable name
    name_map = {
        "POP_SalesTransactionHistory.csv": "df_sales",
        "POP_InventorySnapshot.csv": "df_inventory"
    }
    var_name = name_map.get(requested_filename, f"df_{requested_filename.lower().split('_')[-1].replace('.csv', '')}")
    
    code_block = f"""
        import pandas as pd
        import os

        # Robust path searching for both automation and manual debugging
        filename = "{requested_filename}"
        candidates = [
            os.path.join("public", "data", filename),           # Path from project root
            os.path.join("..", "..", "public", "data", filename) # Path from backend/notebooks/
        ]

        file_path = None
        for path in candidates:
            if os.path.exists(path):
                file_path = path
                break

        if file_path:
            {var_name} = pd.read_csv(file_path)
            print(f"Successfully loaded {{file_path}} into {var_name}")
            print(f"Columns in {var_name}: {{list({var_name}.columns)}}")
            print(f"\\nDataFrame Info for {var_name}:")
            {var_name}.info()
            print({var_name}.head())
        else:
            print(f"Error: File {{filename}} not found in expected locations: {{candidates}}")
            print(f"Current working directory: {{os.getcwd()}}")
        """
    


    # 5. Return the update to the state
    # We add an AIMessage (or tool message) containing the code to be executed
    new_vars = state.get("internal_variables", {}).copy()
    new_vars[var_name] = "DataFrame"

    return {
        **state,
        "internal_variables": new_vars,
        "next_step": "execute",  # Route to the executor next
        "messages": state["messages"] + [ToolMessage(content=code_block, tool_call_id=state["messages"][-1].tool_calls[0]["id"])]
    }