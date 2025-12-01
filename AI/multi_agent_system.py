"""
Multi-Agent Health Analysis System
Demonstrates: Sequential agents, Parallel agents, LLM-powered agents
"""

import asyncio
import json
import os
from datetime import datetime
from typing import Dict, List, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class HealthAnalysisAgent:
    """Base agent for health data analysis"""
    
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.memory = []
    
    async def process(self, data: Dict) -> Dict:
        """Process health data and return insights"""
        result = {
            "agent": self.name,
            "timestamp": datetime.now().isoformat(),
            "input_data": data,
            "analysis": await self._analyze(data)
        }
        self.memory.append(result)
        return result
    
    async def _analyze(self, data: Dict) -> Dict:
        """Override in subclasses"""
        raise NotImplementedError

class TrendAnalysisAgent(HealthAnalysisAgent):
    """Sequential agent for trend analysis"""
    
    def __init__(self):
        super().__init__("TrendAnalyzer", "Identifies health trends over time")
    
    async def _analyze(self, data: Dict) -> Dict:
        await asyncio.sleep(0.1)  # Simulate processing
        
        metrics = data.get('timeseries', [])
        trends = {}
        
        for metric_name in ['steps', 'heart_rate', 'sleep', 'water']:
            metric_data = [item for item in metrics if item.get('metric') == metric_name]
            if len(metric_data) >= 2:
                values = [item['value'] for item in metric_data]
                trend = "increasing" if values[-1] > values[0] else "decreasing"
                change = ((values[-1] - values[0]) / values[0]) * 100 if values[0] > 0 else 0
                
                trends[metric_name] = {
                    "trend": trend,
                    "change_percent": round(change, 2),
                    "recommendation": self._get_recommendation(metric_name, trend, change)
                }
        
        return {"trends": trends, "confidence": 0.85}
    
    def _get_recommendation(self, metric: str, trend: str, change: float) -> str:
        if metric == "steps" and trend == "decreasing":
            return "Consider increasing daily physical activity"
        elif metric == "sleep" and trend == "decreasing":
            return "Focus on improving sleep hygiene"
        elif metric == "heart_rate" and abs(change) > 10:
            return "Monitor heart rate patterns closely"
        return "Maintain current healthy patterns"

class AnomalyDetectionAgent(HealthAnalysisAgent):
    """Parallel agent for anomaly detection"""
    
    def __init__(self):
        super().__init__("AnomalyDetector", "Detects health anomalies and risks")
    
    async def _analyze(self, data: Dict) -> Dict:
        await asyncio.sleep(0.15)  # Simulate processing
        
        anomalies = []
        timeseries = data.get('timeseries', [])
        
        for item in timeseries:
            metric = item.get('metric')
            value = item.get('value', 0)
            
            # Define thresholds
            if metric == 'heart_rate' and value > 100:
                anomalies.append({
                    "date": item.get('day'),
                    "metric": metric,
                    "value": value,
                    "severity": "high",
                    "message": "Elevated resting heart rate detected"
                })
            elif metric == 'sleep' and value < 5:
                anomalies.append({
                    "date": item.get('day'),
                    "metric": metric,
                    "value": value,
                    "severity": "medium",
                    "message": "Insufficient sleep duration"
                })
            elif metric == 'steps' and value < 3000:
                anomalies.append({
                    "date": item.get('day'),
                    "metric": metric,
                    "value": value,
                    "severity": "low",
                    "message": "Low daily activity level"
                })
        
        return {"anomalies": anomalies, "risk_score": len(anomalies) * 0.2}

class InsightGeneratorAgent(HealthAnalysisAgent):
    """Gemini-powered agent for generating insights"""
    
    def __init__(self):
        super().__init__("InsightGenerator", "Generates personalized health insights")
        from .gemini_agent import GeminiHealthAgent
        self.gemini_agent = GeminiHealthAgent()
    
    async def _analyze(self, data: Dict) -> Dict:
        try:
            # Use Gemini for advanced insights
            gemini_result = await self.gemini_agent.generate_health_insights(data)
            
            if gemini_result.get('status') == 'success':
                gemini_insights = gemini_result.get('insights', {})
                
                # Convert Gemini insights to our format
                insights = []
                for rec in gemini_insights.get('recommendations', [])[:3]:
                    insights.append({
                        "type": "recommendation",
                        "title": "AI Recommendation",
                        "message": rec,
                        "priority": "medium"
                    })
                
                for risk in gemini_insights.get('risks', [])[:2]:
                    insights.append({
                        "type": "warning",
                        "title": "Health Risk",
                        "message": risk,
                        "priority": "high"
                    })
                
                return {
                    "insights": insights,
                    "wellness_score": gemini_insights.get('wellness_score', 75),
                    "gemini_summary": gemini_insights.get('summary', ''),
                    "ai_powered": True
                }
            else:
                # Fallback to basic analysis
                return self._basic_analysis(data)
                
        except Exception as e:
            print(f"Gemini analysis failed: {e}")
            return self._basic_analysis(data)
    
    def _basic_analysis(self, data: Dict) -> Dict:
        """Fallback analysis when Gemini is unavailable"""
        summary = data.get('summary', {})
        insights = []
        
        avg_steps = summary.get('steps_avg_7d', 0)
        if avg_steps < 5000:
            insights.append({
                "type": "warning",
                "title": "Increase Daily Activity",
                "message": f"Consider increasing from {avg_steps:,.0f} to 8,000+ steps daily.",
                "priority": "medium"
            })
        
        avg_sleep = summary.get('sleep_avg_7d', 0)
        if avg_sleep < 7:
            insights.append({
                "type": "warning",
                "title": "Sleep Optimization Needed",
                "message": f"Current {avg_sleep:.1f}h average is below recommended 7-9 hours.",
                "priority": "high"
            })
        
        return {
            "insights": insights,
            "wellness_score": self._calculate_wellness_score(summary),
            "ai_powered": False
        }
    
    def _calculate_wellness_score(self, summary: Dict) -> float:
        score = 0
        factors = 0
        
        # Steps score (0-25 points)
        steps = summary.get('steps_avg_7d', 0)
        if steps >= 10000:
            score += 25
        elif steps >= 8000:
            score += 20
        elif steps >= 5000:
            score += 15
        else:
            score += max(0, steps / 500)
        factors += 25
        
        # Sleep score (0-25 points)
        sleep = summary.get('sleep_avg_7d', 0)
        if 7 <= sleep <= 9:
            score += 25
        elif 6 <= sleep < 7 or 9 < sleep <= 10:
            score += 20
        else:
            score += max(0, 25 - abs(sleep - 8) * 5)
        factors += 25
        
        # Heart rate score (0-25 points)
        hr = summary.get('heart_rate_avg_7d', 0)
        if 60 <= hr <= 80:
            score += 25
        elif 50 <= hr < 60 or 80 < hr <= 90:
            score += 20
        else:
            score += max(0, 25 - abs(hr - 70) * 2)
        factors += 25
        
        # Water score (0-25 points)
        water = summary.get('water_avg_7d', 0)
        if water >= 2000:
            score += 25
        elif water >= 1500:
            score += 20
        else:
            score += max(0, water / 100)
        factors += 25
        
        return round((score / factors) * 100, 1) if factors > 0 else 0

class MultiAgentHealthSystem:
    """Orchestrates multiple agents for comprehensive health analysis"""
    
    def __init__(self):
        self.agents = {
            'trend': TrendAnalysisAgent(),
            'anomaly': AnomalyDetectionAgent(),
            'insight': InsightGeneratorAgent()
        }
        self.session_memory = []
    
    async def analyze_health_data(self, health_data: Dict) -> Dict:
        """Run multi-agent analysis on health data"""
        
        # Sequential execution: Trend analysis first
        trend_result = await self.agents['trend'].process(health_data)
        
        # Parallel execution: Anomaly detection
        anomaly_task = asyncio.create_task(self.agents['anomaly'].process(health_data))
        
        # Wait for anomaly detection
        anomaly_result = await anomaly_task
        
        # Combine results for insight generation
        combined_data = {
            **health_data,
            'agent_results': {
                'trends': trend_result['analysis']['trends'],
                'anomalies': anomaly_result['analysis']['anomalies']
            }
        }
        
        # Sequential: Generate insights based on all previous analysis
        insight_result = await self.agents['insight'].process(combined_data)
        
        # Store in session memory
        session_result = {
            "session_id": f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "timestamp": datetime.now().isoformat(),
            "results": {
                "trends": trend_result,
                "anomalies": anomaly_result,
                "insights": insight_result
            },
            "summary": {
                "wellness_score": insight_result['analysis']['wellness_score'],
                "total_anomalies": len(anomaly_result['analysis']['anomalies']),
                "key_recommendations": [
                    insight['message'] for insight in insight_result['analysis']['insights']
                    if insight['priority'] in ['high', 'medium']
                ]
            }
        }
        
        self.session_memory.append(session_result)
        return session_result
    
    def get_session_history(self) -> List[Dict]:
        """Return session memory for long-term tracking"""
        return self.session_memory

# Example usage
async def main():
    # Sample health data
    sample_data = {
        "summary": {
            "total_users": 1,
            "steps_avg_7d": 7500,
            "heart_rate_avg_7d": 75,
            "sleep_avg_7d": 6.5,
            "water_avg_7d": 1800
        },
        "timeseries": [
            {"day": "2024-01-01", "metric": "steps", "value": 8500},
            {"day": "2024-01-01", "metric": "heart_rate", "value": 72},
            {"day": "2024-01-01", "metric": "sleep", "value": 7.5},
            {"day": "2024-01-02", "metric": "steps", "value": 6500},
            {"day": "2024-01-02", "metric": "heart_rate", "value": 105},  # Anomaly
            {"day": "2024-01-02", "metric": "sleep", "value": 4.5}  # Anomaly
        ]
    }
    
    # Initialize multi-agent system
    health_system = MultiAgentHealthSystem()
    
    # Run analysis
    result = await health_system.analyze_health_data(sample_data)
    
    print("Multi-Agent Health Analysis Results:")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(main())