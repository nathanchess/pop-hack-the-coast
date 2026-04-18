from mainLangraph import app
from langchain_core.messages import HumanMessage

def test_summary_request():
    # 1. Start with a state where data is already "loaded" 
    # This simulates the agent having already run a load command.
    initial_state = {
        "messages": [
            HumanMessage(content="""POP's sales data tells an incomplete story, and the gaps lead to bad decisions.
When a customer orders 1,000 units and POP only has 500 available, the customer service
team contacts the buyer to negotiate the order down. POP ships what it has, records the sale as
500, and the other 500 units of demand disappear entirely. The system does not capture lost
sales. There is a backorder function but it is incompatible with our workflow and customer
requirements. Over time, this understates true demand and reinforces the cycle: lower recorded
sales lead to smaller reorders, more stockouts, and further suppressed demand signal.
The problem compounds when you look at how sales data is presented. A buyer sees blended
revenue by SKU but can't distinguish full-price sales from markdown volume. A product showing
$50,000 in monthly revenue looks strong, but half may have been sold at a steep discount to
flush short-dated inventory. The real healthy demand signal is $25,000. Without that distinction,
a buyer may reorder aggressively on a product that is actually underperforming. Developer a complete picture of
demand and translate it into better ordering decisions. This could include: surfacing
lost/suppressed demand, separating healthy demand from markdown volume, forecasting by
channel and SKU, alerting buyers when reorder points are approaching, or generating draft
purchase order recommendations. The goal is better signal and smarter action. 


Analyse the data to predict true demand for the next one month, considering that the current orders do not necessarily reflect the true demand. 
Additionally, analyse current inventory to determine if we have sufficient stock to meet the predicted demand, keep in mind that demand should be dependent on location and the stock is dependent on which of the 3 warehouse are closest to that location. 
Next, find the current gap in inventory (demand -  current inventory). 
Next, generate the value of each product based on how often it gets marked down and the profit margin. We want to have a value metric of each product. 
next, generate the aggregate metric by scaling both the value and current gap and adding their scaled value. 

Before you print your final output, ask the writer agent to write to a the table (like how it would look in your final summary, but with all the data instead of top 20) to a csv file, with the filepath: ./backend/output_csv/{current_time}.csv . To reiterate, this csv has to be the full output data.

In summary, produce 2 things in your output: a table for a list of the top items with highest demand, and a short step by step on how you did the analysis.
here is a template:
##################################################
FINAL AGENT ANSWER
##################################################
The analysis involved several steps to estimate the true demand for each SKU over the next one month:

1. **Data Preparation**: Converted transaction dates to datetime format and filtered for invoice transactions to focus on actual sales.

2. **Aggregation**: Summed daily quantities and extended prices per SKU to understand daily sales patterns.

3. **Stockout Adjustment**: Identified days with zero sales, which could indicate stockouts or no demand, and estimated potential demand during these days using a rolling average of recent sales.

4. **Demand Segregation**: Distinguished between full-price and markdown sales based on a price threshold (e.g., 50% of average price). This helped in understanding how much demand was suppressed due to markdowns.

5. **Demand Summation**: Calculated total demand, markdown demand, and full-price demand for each SKU to identify the true demand that might be hidden behind stockouts and markdowns.

6. **Forecasting**: Used a simple linear regression model to identify demand trends over time, combined with seasonal dummy variables for months and days of the week, to project demand for the next three months (90 days).

7. **Results**: Ranked SKUs by estimated demand, highlighting those with the highest true demand, and included the percentage of demand lost or suppressed due to stockouts or markdowns.

The resulting table lists the top 20 SKUs with the highest aggregate metric, providing a clearer picture of which products are genuinely in high demand and should be prioritized for reordering.
##################################################
| ITEMNMBR | warehouse location |predicted_demand for location (item count) | Current inventory for location (item count) | Current gap (item count) | Item value | Aggregate metric |
| -------- | ------------------ |---------------- | ---------------- | ---------------- | ------------ | ------- | 
| F-04211 | 1 | 486221 | 30 | 486191 | 50 | 1.5 |
| T-32202 | 2 | 331541 | 20 | 331521 | 100 | 1.1 |
| AC-B9SL | 3 | 185712 | 100 | 185612 | 60 | 0.6 |

This table lists the top 20 with the highest estimated aggregate metric over the next three months, accounting for lost sales and markdowns. The demand estimates are based on a simple linear regression forecast of historical total demand (full-price plus markdown sales).
##################################################
""")
        ],
#         "messages": [
#             HumanMessage(content="""tell me about what products are in demand. GIve me the detailed list with item names in your final summary include products with the highest profit margin, revenue, and cost. Tell me what this reflects about my customers
# """)],
# "messages": [
#             HumanMessage(content="""tell me about what products are in demand. GIve me the detailed list with item names in your final summary include products with the highest profit margin, revenue, and cost. Tell me what this reflects about my customers. Assume that the user has no access to the final jupyter notebook so you must list out the items in your final summary. 
# """)],
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