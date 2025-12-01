from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import uuid
from typing import Dict
from .processor import get_trends_and_insights
from .models import UploadResponse, SummaryResponse
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Simple Gemini integration without external modules
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
except ImportError:
    GEMINI_AVAILABLE = False

app = FastAPI(title="Health Data Backend", version="1.0")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
DATA_STORE: Dict[str, Dict] = {}

# Simple Gemini helper function
async def enhance_with_gemini(health_data):
    """Enhance health data with Gemini insights"""
    if not GEMINI_AVAILABLE or not os.getenv('GEMINI_API_KEY'):
        return health_data
    
    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        summary = health_data.get('summary', {})
        prompt = f"""
Analyze this health data and provide insights:
- Steps: {summary.get('steps_avg_7d', 0)}/day
- Heart Rate: {summary.get('heart_rate_avg_7d', 0)} bpm
- Sleep: {summary.get('sleep_avg_7d', 0)} hours
- Water: {summary.get('water_avg_7d', 0)} ml

Provide JSON response with wellness_score (0-100), recommendations (max 3), and risks (max 2).
"""
        
        response = await asyncio.to_thread(model.generate_content, prompt)
        
        # Try to extract JSON from response
        text = response.text
        start = text.find('{')
        end = text.rfind('}') + 1
        
        if start != -1 and end != -1:
            import json
            insights = json.loads(text[start:end])
            health_data['gemini_insights'] = {
                'status': 'success',
                'insights': insights
            }
        
    except Exception as e:
        print(f"Gemini enhancement failed: {e}")
    
    return health_data

@app.post("/upload", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    try:
        # Read CSV
        df = pd.read_csv(file.file)
        
        # Process with basic analysis
        results = get_trends_and_insights(df)
        
        # Enhance with Gemini AI insights
        results = await enhance_with_gemini(results)
        
        # Generate ID and store
        data_id = str(uuid.uuid4())
        
        # Extract user_id if possible, else default
        user_id = "unknown"
        if 'user_id' in df.columns:
            user_id = str(df['user_id'].iloc[0])
            
        stored_data = {
            "user_id": user_id,
            "raw_filename": file.filename,
            "processed": results
        }
        DATA_STORE[data_id] = stored_data
        
        return {
            "status": "ok",
            "data_id": data_id,
            "summary": results["summary"],
            "ai_enhanced": "gemini_insights" in results
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/data/{data_id}/summary")
async def get_summary(data_id: str):
    if data_id not in DATA_STORE:
        raise HTTPException(status_code=404, detail="Data ID not found")
    
    data = DATA_STORE[data_id]
    processed = data["processed"]
    
    return {
        "user_id": data["user_id"],
        "summary": processed["summary"],
        "trends": processed["trends"],
        "anomalies": processed["anomalies"],
        "timeseries": processed["timeseries"],
        "data_id": data_id
    }

@app.get("/data/{data_id}/trends")
async def get_trends(data_id: str):
    if data_id not in DATA_STORE:
        raise HTTPException(status_code=404, detail="Data ID not found")
        
    return DATA_STORE[data_id]["processed"]["timeseries"]

@app.get("/data/{data_id}/anomalies")
async def get_anomalies(data_id: str):
    if data_id not in DATA_STORE:
        raise HTTPException(status_code=404, detail="Data ID not found")
        
    return DATA_STORE[data_id]["processed"]["anomalies"]

@app.get("/health")
async def health_check():
    return {"status": "ok"}

from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    data_id: str = None

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """Chat with Gemini about health data"""
    try:
        if not GEMINI_AVAILABLE:
            return {"response": "AI chat is not available right now."}
        
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        # Get health context if data_id provided
        context_prompt = ""
        if request.data_id and request.data_id in DATA_STORE:
            summary = DATA_STORE[request.data_id]["processed"]["summary"]
            context_prompt = f"""
User's Health Data:
- Steps: {summary.get('steps_avg_7d', 0)}/day
- Heart Rate: {summary.get('heart_rate_avg_7d', 0)} bpm
- Sleep: {summary.get('sleep_avg_7d', 0)} hours
- Water: {summary.get('water_avg_7d', 0)} ml

"""
        
        full_prompt = f"""
You are a helpful health assistant. {context_prompt}
User Question: {request.message}

Provide a helpful, personalized response.
"""
        
        response = await asyncio.to_thread(model.generate_content, full_prompt)
        
        return {
            "response": response.text,
            "has_context": bool(context_prompt)
        }
        
    except Exception as e:
        return {
            "response": "I'm having trouble right now. Please try again later.",
            "error": str(e)
        }
