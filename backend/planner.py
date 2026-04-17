from langchain_core.messages import HumanMessage, SystemMessage

# from model import model
from model import AgentState, tools

def make_main_ai_planner(llm):
    def main_ai_planner(state: AgentState):
        print("--- PLANNING NEXT MOVE ---")
        
        system_prompt = f"""You are a Data Science Agent. 
        Current Notebook State: {len(state['notebook_cells'])} cells executed.
        Current Variables: {state['internal_variables']}
        
        Your goal is to fulfill the user's request by writing and executing Python code.
        - If you need to see data, use the 'loader'. It requires a 'filename' argument.
        - If you need to perform calculations or plots, use the 'writer'.
        - Once you have the final answer, respond directly to the user.
        
        Here are the files you have access to:
        POP_SalesTransactionHistory.csv,
        POP_InventorySnapshot.csv,
        POP_ChargeBack_Deductions_Penalties_Freight.csv,
        POP_PurchaseOrderHistory.csv,
        POP_ItemSpecMaster.csv,
        POP_AssemblyOrders.csv,
        POP_InternalTransferHistory.csv,
        POP_ImportShipmentStatus.csv
        """

        messages = [SystemMessage(content=system_prompt)] + state["messages"]
        
        # 1. Get response from LLM
        response = llm.invoke(messages)

        # Default fallback
        next_step = "end"

        # 2. Process Tool Calls
        if response.tool_calls:
            # Get the first tool call
            t_call = response.tool_calls[0]
            tool_name = t_call["name"]
            
            # 3. Handle the 'loader' specific logic
            if "load" in tool_name:
                next_step = "load"
                # Extract the filename from tool arguments
                # and put it into the content field for your specific requirement
                filename = t_call["args"].get("filename", "unknown_file")
                response.content = filename 
            
            # Handle other tools
            else:
                for key in tools.keys():
                    if key in tool_name:
                        next_step = key
                        break
        else:
            next_step = "end"

        # 4. Update State
        return {
            **state,
            "messages": state["messages"] + [response],
            "next_step": next_step
        }
    
    return main_ai_planner

