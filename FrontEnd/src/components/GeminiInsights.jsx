import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function GeminiInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = () => {
      const geminiData = api.getGeminiInsights();
      console.log('Gemini insights data:', geminiData);
      setInsights(geminiData);
      setLoading(false);
    };

    fetchInsights();

    // Listen for data updates
    const handleDataUpdate = (event) => {
      console.log('Data update event:', event.detail);
      if (event.detail?.geminiInsights) {
        setInsights(event.detail.geminiInsights);
      } else {
        // Check if we have current data
        const currentInsights = api.getGeminiInsights();
        if (currentInsights) {
          setInsights(currentInsights);
        }
      }
    };

    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => window.removeEventListener('dataUpdated', handleDataUpdate);
  }, []);

  if (loading) {
    return (
      <div className="card-gradient border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!insights || insights.status === 'error') {
    return (
      <div className="card-gradient border border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        </div>
        <p className="text-gray-400">Upload health data to get AI-powered insights</p>
        {insights?.status === 'error' && (
          <p className="text-red-400 text-sm mt-2">Error: {insights.error}</p>
        )}
      </div>
    );
  }

  // Handle different data structures
  let insightsData = {};
  if (insights.insights) {
    insightsData = insights.insights;
  } else if (insights.wellness_score || insights.recommendations) {
    insightsData = insights;
  }
  
  const wellnessScore = insightsData.wellness_score || 75;
  const recommendations = insightsData.recommendations || ['Maintain regular exercise', 'Get adequate sleep', 'Stay hydrated'];
  const risks = insightsData.risks || [];
  const positivePatterns = insightsData.positive_patterns || ['Regular health monitoring'];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Wellness Score */}
      <div className="card-gradient border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-neon-blue" />
            <h3 className="text-lg font-semibold text-white">AI Wellness Score</h3>
          </div>
          <div className={`px-3 py-1 rounded-lg border ${getScoreBg(wellnessScore)}`}>
            <span className={`text-lg font-bold ${getScoreColor(wellnessScore)}`}>
              {wellnessScore}/100
            </span>
          </div>
        </div>
        
        {insightsData.summary && (
          <p className="text-gray-300 text-sm">{insightsData.summary}</p>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card-gradient border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-neon-green" />
            <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Risks */}
      {risks.length > 0 && (
        <div className="card-gradient border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Health Alerts</h3>
          </div>
          <div className="space-y-3">
            {risks.map((risk, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{risk}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positive Patterns */}
      {positivePatterns.length > 0 && (
        <div className="card-gradient border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-neon-blue" />
            <h3 className="text-lg font-semibold text-white">Positive Patterns</h3>
          </div>
          <div className="space-y-3">
            {positivePatterns.map((pattern, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-neon-blue mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{pattern}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}