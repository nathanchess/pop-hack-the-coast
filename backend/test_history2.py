import pandas as pd
history_path = '../public/data/POP_PurchaseOrderHistory.csv'
demand_path = 'output_csv/20260418_145446.csv'
df_history = pd.read_csv(history_path)
df_demand = pd.read_csv(demand_path)

hist_items = set(df_history['Item Number'].str.strip())
demand_items = set(df_demand['ITEMNMBR'].str.strip())
intersection = hist_items.intersection(demand_items)
print("Items in both:", intersection)
print("Count of items in both:", len(intersection))
