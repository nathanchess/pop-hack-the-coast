from mainLangraph import app
from langchain_core.messages import HumanMessage

def test_summary_request():
    # 1. Start with a state where data is already "loaded" 
    # This simulates the agent having already run a load command.
    initial_state = {
#         "messages": [
#             HumanMessage(content="""POP's sales data tells an incomplete story, and the gaps lead to bad decisions.
# When a customer orders 1,000 units and POP only has 500 available, the customer service
# team contacts the buyer to negotiate the order down. POP ships what it has, records the sale as
# 500, and the other 500 units of demand disappear entirely. The system does not capture lost
# sales. There is a backorder function but it is incompatible with our workflow and customer
# requirements. Over time, this understates true demand and reinforces the cycle: lower recorded
# sales lead to smaller reorders, more stockouts, and further suppressed demand signal.
# The problem compounds when you look at how sales data is presented. A buyer sees blended
# revenue by SKU but can't distinguish full-price sales from markdown volume. A product showing
# $50,000 in monthly revenue looks strong, but half may have been sold at a steep discount to
# flush short-dated inventory. The real healthy demand signal is $25,000. Without that distinction,
# a buyer may reorder aggressively on a product that is actually underperforming. Developer a complete picture of
# demand and translate it into better ordering decisions. This could include: surfacing
# lost/suppressed demand, separating healthy demand from markdown volume, forecasting by
# channel and SKU, alerting buyers when reorder points are approaching, or generating draft
# purchase order recommendations. The goal is better signal and smarter action. give a list of items that are currently hot in demand
# """)
        # ],
        "messages": [
            HumanMessage(content="""Tell me about what products are in demand. 
            Give me the detailed list with item names in your final summary 
            include products with the highest profit margin, revenue, and cost. 
            Tell me what this reflects about my customers
""")],
        "notebook_cells": [],
        # Telling the agent it has a dataframe makes it more likely to summarize
        "internal_variables": {"df_sales": "DataFrame"}, 
        "next_step": ""
    }

    print("--- TESTING SUMMARY INTENT ---")
    
    # 2. Stream the execution
    final_answer = "(No answer provide by agent)"
    try:
        for output in app.stream(initial_state):
            for node_name, state_update in output.items():
                print(f"\n>> Entering Node: {node_name}")
                
                # Check what the AI is thinking or writing
                if "messages" in state_update:
                    last_msg = state_update["messages"][-1]
                    last_content = last_msg.content
                    print(f"Content Snippet: {last_content[:150]}...")
                    
                    # Capture the final answer when the node is "planner" and the next step is "end"
                    if node_name == "planner" and state_update.get("next_step") == "end":
                        final_answer = last_content
                
                # Check if the next step is properly set
                if "next_step" in state_update:
                    print(f"Next Target: {state_update['next_step']}")

        print("\n" + "#"*50)
        print("FINAL AGENT ANSWER")
        print("#"*50)
        print(final_answer)
        print("#"*50 + "\n")

    except Exception as e:
        print(f"Test failed with error: {e}")

if __name__ == "__main__":
    test_summary_request()