"""
LLM-Powered Navbar Generation Endpoints
Generates personalized navbar content based on user health data
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

# Import Gemini if available
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
except ImportError:
    GEMINI_AVAILABLE = False

router = APIRouter(prefix="/ai", tags=["ai"])


class MetricsInput(BaseModel):
    """Health metrics for navbar generation"""
    avgSteps: Optional[float] = 0
    avgHeartRate: Optional[float] = 0
    avgSleep: Optional[float] = 0
    avgWater: Optional[float] = 0


class NavGreetingRequest(BaseModel):
    """Request for personalized greeting"""
    metrics: MetricsInput
    timestamp: str


class HealthStatusRequest(BaseModel):
    """Request for health status badge"""
    metrics: MetricsInput


class NavRecommendationsRequest(BaseModel):
    """Request for navigation recommendations"""
    metrics: MetricsInput
    currentPage: str


class ActionItemsRequest(BaseModel):
    """Request for health action items"""
    metrics: MetricsInput


class HealthAlertRequest(BaseModel):
    """Request for health alerts"""
    anomalies: Optional[List[Dict[str, Any]]] = []


# Helper function to generate greeting with Gemini
async def generate_greeting_with_llm(metrics: MetricsInput, timestamp: str) -> str:
    """Generate personalized greeting using LLM"""
    if not GEMINI_AVAILABLE:
        return generate_mock_greeting(metrics)

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        prompt = f"""
Generate a brief, friendly greeting (max 20 words) for a health tracking app based on these metrics:
- Steps today: {metrics.avgSteps:.0f}
- Heart rate: {metrics.avgHeartRate:.0f} bpm
- Sleep last night: {metrics.avgSleep:.1f} hours
- Water intake: {metrics.avgWater:.1f}L

Time: {timestamp}

Keep it encouraging and personalized. No JSON, just the greeting text.
"""

        response = await asyncio.to_thread(model.generate_content, prompt)
        greeting = response.text.strip().strip('"')

        # Ensure greeting is not too long
        if len(greeting) > 100:
            greeting = greeting[:97] + "..."

        return greeting

    except Exception as e:
        print(f"LLM greeting generation failed: {e}")
        return generate_mock_greeting(metrics)


# Helper function to generate health status with Gemini
async def generate_health_status_with_llm(metrics: MetricsInput) -> Dict[str, Any]:
    """Generate health status badge using LLM"""
    if not GEMINI_AVAILABLE:
        return generate_mock_health_status(metrics)

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        prompt = f"""
Assess the health status based on these metrics:
- Steps: {metrics.avgSteps:.0f} steps/day
- Heart Rate: {metrics.avgHeartRate:.0f} bpm
- Sleep: {metrics.avgSleep:.1f} hours
- Water: {metrics.avgWater:.1f}L/day

Provide JSON response with:
- status: One of "Excellent", "Good", "Fair", "Needs Attention"
- color: One of "emerald", "blue", "yellow", "red"
- score: 0-100 health score

Example: {{"status": "Good", "color": "blue", "score": 78}}
"""

        response = await asyncio.to_thread(model.generate_content, prompt)
        text = response.text.strip()

        # Extract JSON
        import json

        start = text.find('{')
        end = text.rfind('}') + 1

        if start != -1 and end != -1:
            result = json.loads(text[start:end])
            return result

        return generate_mock_health_status(metrics)

    except Exception as e:
        print(f"LLM health status generation failed: {e}")
        return generate_mock_health_status(metrics)


# Helper function to generate nav recommendations with Gemini
async def generate_nav_recommendations_with_llm(
    metrics: MetricsInput, current_page: str
) -> List[Dict[str, str]]:
    """Generate navigation recommendations using LLM"""
    if not GEMINI_AVAILABLE:
        return generate_mock_nav_recommendations(current_page)

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        prompt = f"""
Based on health metrics, suggest 2 next actions for a health tracking app user:
- Steps: {metrics.avgSteps:.0f}/day
- Heart Rate: {metrics.avgHeartRate:.0f} bpm
- Sleep: {metrics.avgSleep:.1f} hours
- Water: {metrics.avgWater:.1f}L
- Current page: {current_page}

Respond with JSON array of 2 recommendations with "label" and "path" fields.
Paths should be: /trends, /insights, /forecast, /health-assistant, /wellness-center, /

Example: [{{"label": "View Sleep Trends", "icon": "TrendingUp", "path": "/trends"}}, ...]
"""

        response = await asyncio.to_thread(model.generate_content, prompt)
        text = response.text.strip()

        # Extract JSON
        import json

        start = text.find('[')
        end = text.rfind(']') + 1

        if start != -1 and end != -1:
            recommendations = json.loads(text[start:end])
            return recommendations

        return generate_mock_nav_recommendations(current_page)

    except Exception as e:
        print(f"LLM nav recommendations generation failed: {e}")
        return generate_mock_nav_recommendations(current_page)


# Helper function to generate action items with Gemini
async def generate_action_items_with_llm(metrics: MetricsInput) -> List[Dict[str, Any]]:
    """Generate health action items using LLM"""
    if not GEMINI_AVAILABLE:
        return generate_mock_action_items(metrics)

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        prompt = f"""
Generate 1-2 actionable health recommendations based on these metrics:
- Steps: {metrics.avgSteps:.0f}/day
- Heart Rate: {metrics.avgHeartRate:.0f} bpm
- Sleep: {metrics.avgSleep:.1f} hours
- Water: {metrics.avgWater:.1f}L

Respond with JSON array with fields: title, message, urgency (high/medium/low), action (route path).

Example: [{{"title": "Low Activity", "message": "Try a 15-minute walk", "urgency": "high", "action": "/wellness-center"}}]
"""

        response = await asyncio.to_thread(model.generate_content, prompt)
        text = response.text.strip()

        # Extract JSON
        import json

        start = text.find('[')
        end = text.rfind(']') + 1

        if start != -1 and end != -1:
            items = json.loads(text[start:end])
            return items

        return generate_mock_action_items(metrics)

    except Exception as e:
        print(f"LLM action items generation failed: {e}")
        return generate_mock_action_items(metrics)


# Helper function to generate health alerts with Gemini
async def generate_health_alert_with_llm(anomalies: List[Dict]) -> Optional[Dict[str, str]]:
    """Generate health alert using LLM"""
    if not GEMINI_AVAILABLE or not anomalies:
        return generate_mock_alert(anomalies)

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        anomalies_text = "\n".join([f"- {a.get('reason', 'Unknown issue')}" for a in anomalies])

        prompt = f"""
Create a brief health alert based on these anomalies:
{anomalies_text}

Respond with JSON: {{"type": "critical" or "warning", "message": "...", "details": "..."}}
Keep message under 60 chars, details under 100 chars.
"""

        response = await asyncio.to_thread(model.generate_content, prompt)
        text = response.text.strip()

        # Extract JSON
        import json

        start = text.find('{')
        end = text.rfind('}') + 1

        if start != -1 and end != -1:
            alert = json.loads(text[start:end])
            return alert

        return generate_mock_alert(anomalies)

    except Exception as e:
        print(f"LLM alert generation failed: {e}")
        return generate_mock_alert(anomalies)


# Mock generators (fallback)
def generate_mock_greeting(metrics: MetricsInput) -> str:
    """Generate mock greeting"""
    hour = 12  # Default to afternoon
    time_of_day = "afternoon" if hour < 17 else "evening"

    steps_status = (
        "Great job with your steps"
        if metrics.avgSteps >= 8000
        else "Keep moving" if metrics.avgSteps >= 5000 else "Time to get active"
    )

    return f"Good {time_of_day}! {steps_status}."


def generate_mock_health_status(metrics: MetricsInput) -> Dict[str, Any]:
    """Generate mock health status"""
    score = (
        (metrics.avgSteps / 10000) * 0.3
        + (metrics.avgSleep / 8) * 0.3
        + ((100 - abs(metrics.avgHeartRate - 70)) / 100) * 0.2
        + (metrics.avgWater / 2.5) * 0.2
    )

    if score >= 0.8:
        return {"status": "Excellent", "color": "emerald", "score": 85}
    elif score >= 0.6:
        return {"status": "Good", "color": "blue", "score": 72}
    else:
        return {"status": "Needs Attention", "color": "red", "score": 45}


def generate_mock_nav_recommendations(current_page: str) -> List[Dict[str, str]]:
    """Generate mock nav recommendations"""
    recommendations_map = {
        "/": [
            {"label": "View Trends", "icon": "TrendingUp", "path": "/trends"},
            {"label": "Get Insights", "icon": "Lightbulb", "path": "/insights"},
        ],
        "/trends": [
            {"label": "Check Forecast", "icon": "Zap", "path": "/forecast"},
            {"label": "View Dashboard", "icon": "BarChart3", "path": "/"},
        ],
        "/insights": [
            {"label": "Chat with AI", "icon": "MessageCircle", "path": "/health-assistant"},
            {"label": "Wellness Hub", "icon": "Heart", "path": "/wellness-center"},
        ],
    }

    return recommendations_map.get(current_page, recommendations_map["/"])


def generate_mock_action_items(metrics: MetricsInput) -> List[Dict[str, Any]]:
    """Generate mock action items"""
    items = []

    if metrics.avgSteps < 5000:
        items.append(
            {
                "title": "Low Activity",
                "message": "Try a 15-minute walk",
                "urgency": "high",
                "action": "/wellness-center",
            }
        )

    if metrics.avgSleep < 6.5:
        items.append(
            {
                "title": "Inadequate Sleep",
                "message": "Aim for 7-9 hours tonight",
                "urgency": "high",
                "action": "/insights",
            }
        )

    if not items:
        items.append(
            {
                "title": "Keep it Up!",
                "message": "Your health looks great",
                "urgency": "low",
                "action": "/",
            }
        )

    return items


def generate_mock_alert(anomalies: List[Dict]) -> Optional[Dict[str, str]]:
    """Generate mock alert"""
    if not anomalies:
        return None

    return {
        "type": "warning",
        "message": f"{len(anomalies)} metrics need attention",
        "details": anomalies[0].get("reason", "Review your health data"),
    }


# Routes

@router.post("/navbar-greeting")
async def navbar_greeting(request: NavGreetingRequest):
    """Generate personalized greeting based on health metrics"""
    try:
        greeting = await generate_greeting_with_llm(request.metrics, request.timestamp)
        return {"greeting": greeting}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/health-status-badge")
async def health_status_badge(request: HealthStatusRequest):
    """Generate health status badge"""
    try:
        status = await generate_health_status_with_llm(request.metrics)
        return {"status": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/nav-recommendations")
async def nav_recommendations(request: NavRecommendationsRequest):
    """Generate navigation recommendations"""
    try:
        recommendations = await generate_nav_recommendations_with_llm(
            request.metrics, request.currentPage
        )
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/action-items")
async def action_items(request: ActionItemsRequest):
    """Generate health action items"""
    try:
        actions = await generate_action_items_with_llm(request.metrics)
        return {"actions": actions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/health-alert")
async def health_alert(request: HealthAlertRequest):
    """Generate health alert"""
    try:
        alert = await generate_health_alert_with_llm(request.anomalies)
        return {"alert": alert}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
