from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:3000"], # this should be the actual website name for backend
    allow_methods=["*"], 
    allow_headers=["*"]
)

store = {
    "graph_data": [], 
    "purchase_orders": []
}

# @app.post("/upload/products")
# async def upload_products(file: UploadFile = File(...)):
#     contents = await file.read()
#     df = pd.read_csv(io.BytesIO(contents))
    
#     store["graph_data"] = df[[
#         "product", 
#         "urgent", 
#         "important"
#         ]].to_dict(orient="records") # more on the way for data

#     return {"message": "Products uploaded", "rows": len(df)}


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)): #something should be in this constructor
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    store["graph_data"] = df[[
        "LOCNCODE",
        "ITEMNMBR",
        "Predicted_Demand_30d",
        "Current_Inventory",
        "Current_Gap",
        "Item_Value",
        "Scaled_Value",
        "Scaled_Gap",
        "Aggregate_Metric"
        ]].to_dict(orient="records")

    return {"message": "CSV uploaded", "rows": len(df)}


@app.get("/graph-data")
def get_graph_data():
    return store["graph_data"]  


@app.get("/purchase-orders")
def get_purchase_orders():
    return store["purchase_orders"]