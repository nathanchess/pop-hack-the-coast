from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import os
import glob

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

@app.post("/upload")
async def upload_csv():
    try:
        search_path = os.path.join(os.path.dirname(__file__), "output_csv/*.csv")
        csv_files = glob.glob(search_path)
        
        if not csv_files:
            return {"error": "No CSV files found in output_csv folder"}
        
        latest_file = max(csv_files, key=os.path.getmtime)
        df = pd.read_csv(latest_file, on_bad_lines='skip')
        
        store["graph_data"] = df.to_dict(orient="records")
        return store["graph_data"]  # returns data directly
    
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


@app.get("/graph-data")
async def get_graph_data():
    return store["graph_data"]  


@app.get("/purchase-orders")
async def get_purchase_orders():
    return store["purchase_orders"]