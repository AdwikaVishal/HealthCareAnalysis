import { useState, useEffect } from 'react';
import InsightsList from '../components/InsightsList';
import Loader from '../components/Loader';
import { api } from '../services/api';
import { Filter, RefreshCw } from 'lucide-react';

export default function Insights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInsights();
    
    const handleDataUpdate = (event) => {
      setInsights(event.detail.insights);
    };
    
    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => window.removeEventListener('dataUpdated', handleDataUpdate);
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await api.getInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-refresh every 15 seconds with dynamic insights
  useEffect(() => {
    const interval = setInterval(() => {
      const dynamicInsights = [
        { type: 'success', title: 'Sleep Quality Improved', description: `Sleep efficiency increased by ${Math.floor(Math.random() * 10 + 5)}% this week` },
        { type: 'warning', title: 'Activity Alert', description: `${Math.floor(Math.random() * 2000 + 1000)} steps below daily target` },
        { type: 'info', title: 'Hydration Reminder', description: `Optimal hydration window: next ${Math.floor(Math.random() * 3 + 1)} hours` },
        { type: 'success', title: 'Heart Rate Variability', description: `Stress recovery improved by ${Math.floor(Math.random() * 15 + 5)}%` },
        { type: 'warning', title: 'Sleep Pattern Alert', description: `Bedtime variance detected: ${Math.floor(Math.random() * 60 + 30)} minutes` },
        { type: 'info', title: 'Weekly Progress', description: `Health score: ${Math.floor(Math.random() * 20 + 75)}/100 - trending upward` }
      ];
      
      const randomInsight = dynamicInsights[Math.floor(Math.random() * dynamicInsights.length)];
      const newInsight = {
        id: Date.now(),
        ...randomInsight,
        timestamp: 'Just now'
      };
      
      setInsights(prev => [newInsight, ...prev.slice(0, 8)]);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredInsights = insights?.filter(insight => 
    filter === 'all' || insight.type === filter
  ) || [];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white text-slate-900">Health Insights</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="dark:bg-blue-900 bg-white dark:border-blue-800 border-slate-300 rounded-lg px-3 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Insights</option>
              <option value="warning">Warnings</option>
              <option value="success">Success</option>
              <option value="error">Errors</option>
              <option value="info">Information</option>
            </select>
          </div>
          <button 
            onClick={() => {
              fetchInsights();
              const newInsight = {
                id: Date.now(),
                type: 'info',
                title: 'Manual Refresh',
                description: 'Data refreshed by user request',
                timestamp: 'Just now'
              };
              setInsights(prev => [newInsight, ...prev.slice(0, 9)]);
            }}
            className="flex items-center space-x-2 bg-neon-blue/20 border border-neon-blue/30 text-neon-blue px-4 py-2 rounded-lg hover:bg-neon-blue/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="dark:bg-yellow-500/10 bg-yellow-50 border dark:border-yellow-500/30 border-yellow-400 rounded-lg p-4 transition-all duration-500">
          <h3 className="dark:text-yellow-400 text-yellow-800 font-semibold">Warnings</h3>
          <p className="text-2xl font-bold dark:text-white text-yellow-900 transition-all duration-300">
            {insights?.filter(i => i.type === 'warning').length || 0}
          </p>
          <p className="text-xs dark:text-yellow-300 text-yellow-700 mt-1">Active alerts</p>
        </div>
        <div className="dark:bg-green-500/10 bg-green-50 border dark:border-green-500/30 border-green-400 rounded-lg p-4">
          <h3 className="dark:text-neon-green text-green-800 font-semibold">Success</h3>
          <p className="text-2xl font-bold dark:text-white text-green-900">
            {insights?.filter(i => i.type === 'success').length || 0}
          </p>
        </div>
        <div className="dark:bg-red-500/10 bg-red-50 border dark:border-red-500/30 border-red-400 rounded-lg p-4 transition-all duration-500">
          <h3 className="dark:text-red-400 text-red-800 font-semibold">Critical</h3>
          <p className="text-2xl font-bold dark:text-white text-red-900 transition-all duration-300">
            {insights?.filter(i => i.type === 'error').length || 0}
          </p>
          <p className="text-xs dark:text-red-300 text-red-700 mt-1">Urgent items</p>
        </div>
        <div className="dark:bg-blue-500/10 bg-blue-50 border dark:border-blue-500/30 border-blue-400 rounded-lg p-4">
          <h3 className="dark:text-neon-blue text-blue-800 font-semibold">Info</h3>
          <p className="text-2xl font-bold dark:text-white text-blue-900">
            {insights?.filter(i => i.type === 'info').length || 0}
          </p>
        </div>
      </div>

      <div className="card-gradient rounded-xl p-6">
        <h2 className="text-xl font-semibold dark:text-white text-slate-900 mb-6">Recent Insights</h2>
        {filteredInsights.length > 0 ? (
          <InsightsList insights={filteredInsights} />
        ) : (
          <div className="text-center py-8">
            <p className="dark:text-gray-400 text-slate-900">No insights found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}