import nbformat
from nbconvert.preprocessors import ExecutePreprocessor
from langchain_core.messages import AIMessage, ToolMessage

def data_loading_tool(state):
    print("--- PREPARING LOADER ---")
    filename = state["messages"][-1].content
    code = f"import pandas as pd\ndf = pd.read_csv('../public/data/{filename}')\nprint(df.head())"
    return {
        **state,
        "messages": state["messages"] + [AIMessage(content=code)],
        "next_step": "execute"
    }

def script_writing_tool(state):
    print("--- WRITING CODE ---")
    # In a full version, you'd call the LLM here to write specific code
    code = "print(df.describe())" 
    return {
        **state,
        "messages": state["messages"] + [AIMessage(content=code)],
        "next_step": "execute"
    }

def code_execution_tool(state):
    print("--- EXECUTING ---")
    nb_path = "analysis_notebook.ipynb"
    code = state["messages"][-1].content
    
    # Simple logic: load/create notebook and append cell
    nb = nbformat.v4.new_notebook() if not os.path.exists(nb_path) else nbformat.read(nb_path, as_version=4)
    nb.cells.append(nbformat.v4.new_code_cell(code))
    
    # Run the notebook
    ep = ExecutePreprocessor(timeout=600, kernel_name='python3')
    ep.preprocess(nb, {'metadata': {'path': './'}})
    
    with open(nb_path, 'w') as f:
        nbformat.write(nb, f)
        
    return {**state, "next_step": "planner"}