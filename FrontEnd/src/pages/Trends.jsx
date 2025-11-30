import { useState, useEffect } from 'react';
import LineChartCard from '../components/LineChartCard';
import BarChartCard from '../components/BarChartCard';
import Loader from '../components/Loader';
import { api } from '../services/api';

export default function Trends() {
  const [stepsData, setStepsData] = useState(null);
  const [heartRateData, setHeartRateData] = useState(null);
  const [sleepData, setSleepData] = useState(null);
  const [waterData, setWaterData] = useState(null);
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
        const [stepsRes, heartRateRes, sleepRes, waterRes, ageRes] = await Promise.all([
          api.getTrendData(),
          api.getHeartRateData(),
          api.getSleepData(),
          api.getWaterData(),
          api.getAgeGroups()
        ]);
        
        setStepsData(stepsRes);
        setHeartRateData(heartRateRes);
        setSleepData(sleepRes);
        setWaterData(waterRes);
        setAgeData(ageRes);
      } catch (error) {
        console.error('Error fetching trends data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    const handleDataUpdate = async (event) => {
      // Refresh all data when updated
      const [stepsRes, heartRateRes, sleepRes, waterRes] = await Promise.all([
        api.getTrendData(),
        api.getHeartRateData(),
        api.getSleepData(),
        api.getWaterData()
      ]);
      
      setStepsData(stepsRes);
      setHeartRateData(heartRateRes);
      setSleepData(sleepRes);
      setWaterData(waterRes);
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
      const [stepsRes, heartRateRes, sleepRes, waterRes] = await Promise.all([
        api.getTrendData(),
        api.getHeartRateData(),
        api.getSleepData(),
        api.getWaterData()
      ]);
      
      setStepsData(stepsRes);
      setHeartRateData(heartRateRes);
      setSleepData(sleepRes);
      setWaterData(waterRes);
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
          title="Daily Steps Trend"
          data={stepsData || []}
          dataKey="value"
          color="#00D4FF"
        />
        <LineChartCard
          title="Heart Rate Trend"
          data={heartRateData || []}
          dataKey="value"
          color="#FF6B6B"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartCard
          title="Sleep Quality Trend"
          data={sleepData || []}
          dataKey="value"
          color="#8B5CF6"
        />
        <LineChartCard
          title="Water Intake Trend"
          data={waterData || []}
          dataKey="value"
          color="#00FF88"
        />
      </div>

      <div className="card-gradient border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold dark:text-white text-slate-900 mb-4">Health Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold">Activity Level</h4>
            <p className="text-2xl font-bold dark:text-white text-slate-900">+{liveMetrics.growth.toFixed(1)}%</p>
            <p className="text-sm text-gray-400">Steps increase this {timeRange === '6months' ? 'quarter' : 'period'}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-neon-blue font-semibold">Heart Health</h4>
            <p className="text-2xl font-bold dark:text-white text-slate-900">{liveMetrics.revenue} bpm</p>
            <p className="text-sm text-gray-400">Average resting heart rate</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-neon-purple font-semibold">Sleep Quality</h4>
            <p className="text-2xl font-bold dark:text-white text-slate-900">{liveMetrics.satisfaction.toFixed(1)}h</p>
            <p className="text-sm text-gray-400">Average sleep duration</p>
          </div>
        </div>
      </div>
    </div>
  );
}