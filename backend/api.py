from fastapi import FastAPI
from fastapi.middlewares.cors import CORSMiddleware

app = FastAPI()

api.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:3000"], # this should be the actual website name
    allow_methods=["*"], 
    allow_headers=["*"]
)



@app.get("/")
def read_root():
    return []       