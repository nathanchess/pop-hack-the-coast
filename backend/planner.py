from langchain_core.messages import SystemMessage
from model import AgentState, tools

def make_main_ai_planner(llm_with_tools):
    def main_ai_planner(state: AgentState):
        print("--- PLANNING NEXT MOVE ---")
        
        # Extract recent outputs to give the LLM context on what happened
        # We now look at the last 5 code cells to ensure we don't lose context on data loading
        execution_history = ""
        recent_cells = [c for c in state.get("notebook_cells", []) if c["cell_type"] == "code"][-5:]
        
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

        recent_outputs = execution_history if execution_history else "No output yet."

        system_prompt = f"""You are an Autonomous Data Science Agent.
        
        RULES:
        1. If the goal is not yet completed, you MUST use either 'load' (to get data) or 'write' (to perform analysis).
        2. DO NOT provide Python code in your text response. ONLY use the 'write' tool.
           - Use the 'goal' field for a high-level description.
           - Use the 'instructions' field to pass EXACT column names, logic, or filters you want the Writer to use.
        3. A "summary" is not just a list of columns. You MUST use 'write' to perform actual calculations (e.g., sums, averages) before ending.
        4. When you have completed the goal and provided a thorough conversational answer, use 'end'.
        
        DEBUGGING & SELF-CORRECTION:
        - If you see a Python error (Traceback, NameError, etc.) in the 'RECENT NOTEBOOK ACTIVITY', your NEXT STEP must be 'write' to fix that error.
        - Specifically analyze the error message and rewrite the code to correct the mistake.

        Context:
        - Current Variables: {state['internal_variables']}
        - Files available: POP_ImportShipmentStatus.csv, POP_ItemSpecMaster.csv, POP_AssemblyOrders.csv, POP_InternalTransferHistory.csv, POP_PurchaseOrderHistory.csv, POP_ChargeBack_Deductions_Penalties_Freight.csv, POP_Cleaned_InternalTransferRequests.csv, POP_SalesTransactionHistory.csv, POP_DataDictionary.csv, POP_InventorySnapshot.csv
        POP_ImportShipmentStatus.csv: Column Names are PO#,Port,# of ctns,Container #,Product Description,ETA Date, FDA release Date, Arrival Date, Remarks
        POP_ItemSpecMaster.csv: Column Names are Item Number,Description,Case Pack,unit dimension (L*W*H) (in),inner case dimension (L*W*H) (in),master case dimension (L*W*H) (in),Case/ Pallet,UPC#,Mstr Ctn UPC#,Country of Origin,Shelf Life (Months),Maufactuer/ CoPacker,Lead Time,MOQ,Allergens
        POP_AssemblyOrders.csv: Column Names are Document Date,Document Number,Document Type,Item Number,U Of M,TRX QTY,Unit Cost,Extended Cost,TRX Location,Document Status
        POP_InternalTransferHistory.csv: Column Names are Document Number,Document Date,Document Type,Item Number,Item Description,U Of M,TRX QTY,Unit Cost,Extended Cost,TRX Location,Transfer To Location,Document Status
        POP_PurchaseOrderHistory.csv: Column Names are PO Number,PO Date,Required Date,Promised Ship Date,Receipt Date,POP Receipt Number,Item Number,Item Description,QTY Shipped,QTY Invoiced,Unit Cost,Extended Cost,Vendor ID,Location Code,Primary Ship To Address,Shipping Method
        POP_ChargeBack_Deductions_Penalties_Freight.csv: Column Names are Document Date,Document Number,Document Type,Item Number,U Of M,TRX QTY,Unit Cost,Extended Cost,TRX Location,Document Status
        POP_Cleaned_InternalTransferRequests.csv: Column Names are Week,Cut_Off,Row_Index,Item_ID,Qty,Col4,Note,Requested_By,Date_Shipped,Transfer_Reason,Shipment_Status
        POP_SalesTransactionHistory.csv: Column Names are LOCNCODE,SLPRSNID,CUSTNMBR,CITY,STATE,ZIPCODE,SOP TYPE,SOPNUMBE,DOCDATE,ITEMNMBR,ITEMDESC,QUANTITY_adj,UOFM,QTYBSUOM,XTNDPRCE_adj,EXTDCOST_adj,Customer Type,Product Type,Source_File,Gross_Profit_adj,Margin_Pct_adj,UOM_Price,Unit_Price_adj
        POP_DataDictionary.csv: Column Names are Data File,Data Field,Notes
        POP_InventorySnapshot.csv: Column Names are Item Number,Description,Available,On Hand
        
        
        On the bottom of the response, for each file write the file name and its column names as a reference for the LLM. This will help the ScriptWriter understand what data it can work with when generating code.
        



        

"

        
        Recent Execution Output:
        {recent_outputs if recent_outputs else "No output yet."}
        """

        messages = [SystemMessage(content=system_prompt)] + state["messages"]

        # Visibility: Print the context the Planner is using
        print("\n" + "="*50)
        print("PLANNER CONTEXT & HISTORY")
        print("="*50)
        print(system_prompt)
        print("="*50 + "\n")

        response = llm_with_tools.invoke(messages)
        print(response)

        next_step = "end"
        if response.tool_calls:
            t_call = response.tool_calls[0]
            tool_name = t_call["name"]
            
            # If it's a load tool, we promote the filename to the message content
            if "load" in tool_name:
                next_step = "load"
                response.content = t_call["args"].get("filename", "Sales")
            elif "write" in tool_name:
                next_step = "write"
            else:
                next_step = "end"

        return {
            **state,
            "messages": state["messages"] + [response],
            "next_step": next_step
        }
    return main_ai_planner