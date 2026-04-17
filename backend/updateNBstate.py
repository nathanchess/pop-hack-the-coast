import nbformat

def update_state(NB_filename: str, current_variables: dict, nb=None):
    """
    Reads a Jupyter Notebook file (or uses the provided nb object) 
    and returns a dictionary compatible with the LangGraph AgentState.
    """
    try:
        # 1. Load the notebook file if nb is not provided
        if nb is None:
            with open(NB_filename, 'r', encoding='utf-8') as f:
                nb = nbformat.read(f, as_version=4)

        # 2. Extract cells into a list of dictionaries
        # This populates the 'notebook_cells' key in your state
        cells_data = []
        for cell in nb.cells:
            cell_info = {
                "cell_type": cell.cell_type,
                "source": cell.source,
                "outputs": cell.get("outputs", []) if cell.cell_type == "code" else []
            }
            cells_data.append(cell_info)

        # 3. Return the update dictionary
        # LangGraph nodes return a partial state update
        return {
            "notebook_cells": cells_data,
            "internal_variables": current_variables,
        }

    except FileNotFoundError:
        print(f"Warning: {NB_filename} not found. Returning empty state.")
        return {"notebook_cells": [], "internal_variables": {}}
    except Exception as e:
        print(f"Error parsing notebook: {e}")
        raise