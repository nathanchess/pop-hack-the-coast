import pandas as pd
history_path = '../public/data/POP_PurchaseOrderHistory.csv'
df_history = pd.read_csv(history_path)
df_history.columns = [c.strip() for c in df_history.columns]
print(df_history.columns)
print("Item D-04011 in history:", not df_history[df_history['Item Number'].str.strip() == 'D-04011'].empty)
print("Item A-61012 in history:", not df_history[df_history['Item Number'].str.strip() == 'A-61012'].empty)
