import asyncio
import os
from typing import Dict, Any, List

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
except Exception:
    GENAI_AVAILABLE = False


async def llm_agent(summary: Dict[str, Any]) -> Dict[str, Any]:
    """LLM agent: uses Gemini if available to produce recommendations and a short summary."""
    if not GENAI_AVAILABLE:
        # fallback simulated response
        return {
            'agent': 'llm_agent',
            'status': 'mock',
            'summary': f"Avg steps {summary.get('steps_avg_7d', 0)}, avg sleep {summary.get('sleep_avg_7d', 0)}",
            'recommendations': [
                'Keep a consistent sleep schedule',
                'Aim for 8,000+ steps on most days'
            ]
        }

    prompt = f"""
You are a health assistant. Given this summary:
- Steps: {summary.get('steps_avg_7d', 0)}
- Heart Rate: {summary.get('heart_rate_avg_7d', 0)}
- Sleep: {summary.get('sleep_avg_7d', 0)}
- Water: {summary.get('water_avg_7d', 0)}

Provide a short JSON with fields: "summary", "recommendations" (list of 2), and "wellness_score" (0-100).
"""

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        response = await asyncio.to_thread(model.generate_content, prompt)
        text = response.text
        # naive extract JSON-like content
        start = text.find('{')
        end = text.rfind('}') + 1
        import json
        if start != -1 and end != -1:
            return {'agent': 'llm_agent', 'status': 'success', 'result': json.loads(text[start:end])}
    except Exception as e:
        return {'agent': 'llm_agent', 'status': 'error', 'error': str(e)}

    return {'agent': 'llm_agent', 'status': 'error', 'error': 'No parsable response'}


async def evaluator_agent(summary: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluator agent: computes a simple wellness score and flags risks."""
    steps = summary.get('steps_avg_7d', 0)
    hr = summary.get('heart_rate_avg_7d', 0)
    sleep = summary.get('sleep_avg_7d', 0)
    water = summary.get('water_avg_7d', 0)

    # simple weighted score
    score = 0
    score += min(100, (steps / 10000) * 40)
    score += min(40, (sleep / 8) * 40)
    hr_factor = max(0, (100 - abs(hr - 70)) / 100)
    score += hr_factor * 10
    water_factor = min(1, water / 2.5)
    score += water_factor * 10

    score = int(max(0, min(100, score)))

    risks = []
    if steps < 5000:
        risks.append('Low activity')
    if hr > 100:
        risks.append('Elevated heart rate')
    if sleep < 6:
        risks.append('Insufficient sleep')

    return {
        'agent': 'evaluator_agent',
        'status': 'success',
        'wellness_score': score,
        'risks': risks
    }


async def run_agents_in_parallel(summary: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Run multiple agents in parallel and return their results."""
    tasks = [llm_agent(summary), evaluator_agent(summary)]
    results = await asyncio.gather(*tasks, return_exceptions=False)
    return results
