from mainLangraph import app
from langchain_core.messages import HumanMessage

# 1. Define the initial state
# Note: Ensure internal_variables and notebook_cells start empty
initial_state = {
    "messages": [HumanMessage(content="Load the sales data and show me the first 5 rows.")],
    "notebook_cells": [],
    "internal_variables": {},
    "next_step": ""
}

# 2. Run the graph
print("--- STARTING AGENT TEST ---")
for output in app.stream(initial_state):
    # 'output' is a dictionary keyed by the node name
    for node_name, state_update in output.items():
        print(f"\n[Node: {node_name}]")
        # Optional: print the last message content to see what the AI said/wrote
        if "messages" in state_update:
            print(f"Response: {state_update['messages'][-1].content[:100]}...")

print("\n--- TEST COMPLETE ---")