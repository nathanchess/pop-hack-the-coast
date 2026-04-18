from langchain_core.messages import SystemMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from model import model, AgentState, tools, getJupyterNotebookContents

def script_writing_tool(state: AgentState):
    """
    Generates Python analysis code using the LLM based on the 
    Planner's decision and the current Notebook state.
    """
    print("--- WRITING ANALYSIS CODE ---")

    # 1. Access the model (passed in through your state or globally from model.py)
    # Note: Using the model here allows us to 'refine' the planner's high-level goal into code.
    from model import model
    
    # 2. Extract specific instructions from the planner's tool call
    last_message = state["messages"][-1]
    tool_args = last_message.tool_calls[0]["args"] if hasattr(last_message, "tool_calls") and last_message.tool_calls else {}
    goal = tool_args.get("goal", "Perform analysis")
    instructions = tool_args.get("instructions", "Use your best judgment.")

    jupyter_notebook_contents = getJupyterNotebookContents(state)

    # 3. Construct a prompt for code generation
    code_gen_prompt = f"""You are an expert Python Data Scientist.
    
    PLANNER'S GOAL: {goal}
    TECHNICAL INSTRUCTIONS: {instructions}

    IMPORTANT: You MUST use the exact variable names listed in 'Current Variables in Memory'.
    Current Variables in Memory: {state['internal_variables']}
    Previous jupyter notebook contents: {jupyter_notebook_contents}
    
    If you are not given the column names for csvs, you should not continue the job.
    
    Task: Write a single Python code block to perform the analysis requested by the planner.
    - Use pandas, matplotlib, or seaborn as needed.
    - DO NOT assume variable names like 'df_sales' unless they appear in the list above.
    - Output ONLY the raw Python code. Do not include markdown formatting or explanations.
    - Print the results or head of dataframes so the user can see the output.
    """

    # Find the tool call ID to satisfy the API structure
    last_message = state["messages"][-1]
    tool_call_id = last_message.tool_calls[0]["id"] if hasattr(last_message, "tool_calls") and last_message.tool_calls else "unknown"
    
    # We MUST include a ToolMessage response for the pending call before invoking the model again
    placeholder_msg = ToolMessage(content="Generating analysis code...", tool_call_id=tool_call_id)
    messages = [SystemMessage(content=code_gen_prompt)] + state["messages"] + [placeholder_msg]

    # 3. Call the model to get the code
    response = model.invoke(messages)
    
    print("\n" + "="*50)
    print("WRITER RESPONSE")
    print("="*50)
    print(response)
    print("="*50 + "\n")

    code_content = response.content.strip()

    # Clean up markdown code blocks if the model accidentally included them
    if code_content.startswith("```python"):
        code_content = code_content.split("```python")[1].split("```")[0].strip()
    elif code_content.startswith("```"):
        code_content = code_content.split("```")[1].split("```")[0].strip()

    # 4. Update the state
    # We set next_step to 'executor' so the graph runs this code immediately.
    return {
        **state,
        "messages": state["messages"] + [ToolMessage(content=code_content, tool_call_id=state["messages"][-1].tool_calls[0]["id"])],
        "next_step": "execute"
    }