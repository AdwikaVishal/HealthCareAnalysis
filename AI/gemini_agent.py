"""
Gemini-powered Health Analysis Agent
"""

import os
import json
import asyncio
from typing import Dict, List, Any
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiHealthAgent:
    """Gemini-powered agent for health insights"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
    
    async def generate_health_insights(self, health_data: Dict) -> Dict:
        """Generate personalized health insights using Gemini"""
        
        prompt = self._create_health_prompt(health_data)
        
        try:
            response = await asyncio.to_thread(
                self.model.generate_content, prompt
            )
            
            insights = self._parse_gemini_response(response.text)
            
            return {
                "status": "success",
                "insights": insights,
                "confidence": 0.9,
                "source": "gemini-pro"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "insights": self._fallback_insights(health_data)
            }
    
    def _create_health_prompt(self, data: Dict) -> str:
        """Create structured prompt for Gemini"""
        
        summary = data.get('summary', {})
        trends = data.get('agent_results', {}).get('trends', {})
        anomalies = data.get('agent_results', {}).get('anomalies', [])
        
        prompt = f"""
You are a health analysis AI. Analyze this health data and provide personalized insights:

HEALTH METRICS:
- Average Steps: {summary.get('steps_avg_7d', 0)}/day
- Average Heart Rate: {summary.get('heart_rate_avg_7d', 0)} bpm
- Average Sleep: {summary.get('sleep_avg_7d', 0)} hours
- Average Water: {summary.get('water_avg_7d', 0)} ml

TRENDS DETECTED:
{json.dumps(trends, indent=2)}

ANOMALIES FOUND:
{json.dumps(anomalies, indent=2)}

Please provide:
1. Overall wellness assessment (score 0-100)
2. Top 3 personalized recommendations
3. Health risks to monitor
4. Positive patterns to maintain

Format as JSON:
{{
  "wellness_score": number,
  "recommendations": ["rec1", "rec2", "rec3"],
  "risks": ["risk1", "risk2"],
  "positive_patterns": ["pattern1", "pattern2"],
  "summary": "brief overall assessment"
}}
"""
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict:
        """Parse Gemini response into structured format"""
        
        try:
            # Extract JSON from response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            
            if start != -1 and end != -1:
                json_str = response_text[start:end]
                return json.loads(json_str)
            else:
                # Fallback parsing
                return self._extract_insights_from_text(response_text)
                
        except json.JSONDecodeError:
            return self._extract_insights_from_text(response_text)
    
    def _extract_insights_from_text(self, text: str) -> Dict:
        """Extract insights from unstructured text"""
        
        lines = text.split('\n')
        insights = {
            "wellness_score": 75,
            "recommendations": [],
            "risks": [],
            "positive_patterns": [],
            "summary": "Analysis completed"
        }
        
        for line in lines:
            line = line.strip()
            if 'recommend' in line.lower():
                insights["recommendations"].append(line)
            elif 'risk' in line.lower():
                insights["risks"].append(line)
            elif 'positive' in line.lower() or 'good' in line.lower():
                insights["positive_patterns"].append(line)
        
        return insights
    
    def _fallback_insights(self, data: Dict) -> Dict:
        """Fallback insights when Gemini fails"""
        
        summary = data.get('summary', {})
        steps = summary.get('steps_avg_7d', 0)
        sleep = summary.get('sleep_avg_7d', 0)
        hr = summary.get('heart_rate_avg_7d', 0)
        
        recommendations = []
        if steps < 8000:
            recommendations.append("Increase daily steps to 8,000+")
        if sleep < 7:
            recommendations.append("Aim for 7-9 hours of sleep")
        if hr > 85:
            recommendations.append("Monitor heart rate patterns")
        
        return {
            "wellness_score": min(100, max(0, (steps/100) + (sleep*10) + (100-hr))),
            "recommendations": recommendations[:3],
            "risks": ["Insufficient data for risk assessment"],
            "positive_patterns": ["Regular health monitoring"],
            "summary": "Basic health assessment completed"
        }

class GeminiChatAgent:
    """Gemini-powered chat agent for health questions"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
        self.chat_history = []
    
    async def chat_about_health(self, user_message: str, health_context: Dict = None) -> str:
        """Chat with user about their health data"""
        
        context_prompt = ""
        if health_context:
            context_prompt = f"""
HEALTH CONTEXT:
- Steps: {health_context.get('steps', 'N/A')}/day
- Heart Rate: {health_context.get('heart_rate', 'N/A')} bpm  
- Sleep: {health_context.get('sleep', 'N/A')} hours
- Water: {health_context.get('water', 'N/A')} ml

"""
        
        full_prompt = f"""
You are a helpful health assistant. Answer the user's question based on their health data.

{context_prompt}

User Question: {user_message}

Provide a helpful, personalized response based on their health metrics.
"""
        
        try:
            response = await asyncio.to_thread(
                self.model.generate_content, full_prompt
            )
            
            chat_response = response.text
            
            # Store in chat history
            self.chat_history.append({
                "user": user_message,
                "assistant": chat_response,
                "timestamp": asyncio.get_event_loop().time()
            })
            
            return chat_response
            
        except Exception as e:
            return f"I'm having trouble processing your request right now. Error: {str(e)}"
    
    def get_chat_history(self) -> List[Dict]:
        """Get chat conversation history"""
        return self.chat_history[-10:]  # Last 10 messages

# Integration with existing multi-agent system
async def integrate_gemini_with_agents(health_data: Dict) -> Dict:
    """Integrate Gemini insights with existing agent system"""
    
    gemini_agent = GeminiHealthAgent()
    
    # Get Gemini insights
    gemini_result = await gemini_agent.generate_health_insights(health_data)
    
    # Combine with existing analysis
    enhanced_result = {
        **health_data,
        "gemini_insights": gemini_result,
        "ai_powered": True,
        "enhanced_recommendations": gemini_result.get("insights", {}).get("recommendations", [])
    }
    
    return enhanced_result

# Example usage
async def demo_gemini_integration():
    """Demo Gemini integration"""
    
    sample_data = {
        "summary": {
            "steps_avg_7d": 7500,
            "heart_rate_avg_7d": 75,
            "sleep_avg_7d": 6.5,
            "water_avg_7d": 1800
        },
        "agent_results": {
            "trends": {
                "steps": {"trend": "decreasing", "change_percent": -5.2}
            },
            "anomalies": [
                {"metric": "sleep", "value": 4.5, "severity": "medium"}
            ]
        }
    }
    
    # Test Gemini health insights
    gemini_agent = GeminiHealthAgent()
    insights = await gemini_agent.generate_health_insights(sample_data)
    print("Gemini Health Insights:", json.dumps(insights, indent=2))
    
    # Test chat functionality
    chat_agent = GeminiChatAgent()
    response = await chat_agent.chat_about_health(
        "How can I improve my sleep quality?",
        {"sleep": 6.5, "steps": 7500}
    )
    print("Chat Response:", response)

if __name__ == "__main__":
    asyncio.run(demo_gemini_integration())