import { useState, useEffect } from 'react';
import LineChartCard from '../components/LineChartCard';
import BarChartCard from '../components/BarChartCard';
import Loader from '../components/Loader';
import { api } from '../services/api';

export default function Trends() {
  const [trendData, setTrendData] = useState(null);
  const [ageData, setAgeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  const [liveMetrics, setLiveMetrics] = useState({
    growth: 15.2,
    revenue: 58,
    satisfaction: 4.5
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendsRes, ageRes] = await Promise.all([
          api.getTrendData(),
          api.getAgeGroups()
        ]);
        
        setTrendData(trendsRes);
        setAgeData(ageRes);
      } catch (error) {
        console.error('Error fetching trends data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    const handleDataUpdate = (event) => {
      setTrendData(event.detail.trendData);
    };
    
    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => window.removeEventListener('dataUpdated', handleDataUpdate);
  }, []);
  
  useEffect(() => {
    const baseGrowth = timeRange === '6months' ? 15.2 : timeRange === '1year' ? 23.8 : 31.5;
    const baseRevenue = timeRange === '6months' ? 58 : timeRange === '1year' ? 72 : 89;
    const baseSatisfaction = timeRange === '6months' ? 4.5 : timeRange === '1year' ? 4.3 : 4.7;
    
    setLiveMetrics({
      growth: baseGrowth + (Math.random() * 4 - 2),
      revenue: baseRevenue + Math.floor(Math.random() * 10 - 5),
      satisfaction: baseSatisfaction + (Math.random() * 0.4 - 0.2)
    });
  }, [timeRange]);
  
  // Auto-refresh every 45 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const newData = await api.refreshData();
      setTrendData(newData.trendData);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white text-slate-900">Trends Analysis</h1>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="dark:bg-blue-900 bg-white dark:border-blue-800 border-slate-300 rounded-lg px-4 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-blue-500"
        >
          <option value="6months">Last 6 months</option>
          <option value="1year">Last year</option>
          <option value="2years">Last 2 years</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartCard
          title="Patient Growth Trend"
          data={trendData}
          dataKey="patients"
          color="#00D4FF"
        />
        <LineChartCard
          title="Revenue Growth"
          data={trendData}
          dataKey="revenue"
          color="#8B5CF6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard
          title="Age Group Distribution"
          data={ageData}
          dataKey="count"
          color="#00FF88"
        />
        <LineChartCard
          title="Patient Satisfaction Trend"
          data={trendData}
          dataKey="satisfaction"
          color="#FF6B6B"
        />
      </div>

      <div className="card-gradient border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold">Growth Rate</h4>
            <p className="text-2xl font-bold text-white">+{liveMetrics.growth.toFixed(1)}%</p>
            <p className="text-sm text-gray-400">Patient increase this {timeRange === '6months' ? 'quarter' : 'period'}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-neon-blue font-semibold">Revenue Impact</h4>
            <p className="text-2xl font-bold text-white">${liveMetrics.revenue}K</p>
            <p className="text-sm text-gray-400">Average monthly revenue</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-neon-purple font-semibold">Satisfaction</h4>
            <p className="text-2xl font-bold text-white">{liveMetrics.satisfaction.toFixed(1)}/5</p>
            <p className="text-sm text-gray-400">Average satisfaction score</p>
          </div>
        </div>
      </div>
    </div>
  );
}