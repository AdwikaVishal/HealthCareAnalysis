import { useState, useEffect } from 'react';
import { Users, UserCheck, Heart, Activity, RefreshCw, Droplets, Moon } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import LineChartCard from '../components/LineChartCard';
import PieChartCard from '../components/PieChartCard';
import Loader from '../components/Loader';
import { api } from '../services/api';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [diseaseData, setDiseaseData] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [heartRateData, setHeartRateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [metricsRes, trendsRes, diseaseRes] = await Promise.all([
        api.getMetrics(),
        api.getTrendData(),
        api.getDiseaseData()
      ]);
      
      setMetrics(metricsRes);
      setTrendData(trendsRes);
      setDiseaseData(diseaseRes);
      
      // Get water and heart rate data
      const [waterRes, heartRateRes] = await Promise.all([
        api.getWaterData(),
        api.getHeartRateData()
      ]);
      
      setWaterData(waterRes);
      setHeartRateData(heartRateRes);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Listen for data updates from uploads
    const handleDataUpdate = () => {
      fetchData();
    };
    
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white text-slate-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-neon-blue/20 border border-neon-blue/30 text-neon-blue px-4 py-2 rounded-lg hover:bg-neon-blue/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          <div className="text-sm dark:text-gray-400 text-slate-900">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.totalPatients}
          change={0}
          icon={Users}
          color="blue"
          showTrend={false}
        />
        <MetricCard
          title="Avg Steps"
          value={metrics.avgSteps?.toLocaleString() || '0'}
          change={metrics.stepsChange || 0}
          icon={Activity}
          color="green"
        />
        <MetricCard
          title="Avg Heart Rate"
          value={`${metrics.avgHeartRate || 0} bpm`}
          change={metrics.heartRateChange || 0}
          icon={Heart}
          color="red"
        />
        <MetricCard
          title="Avg Sleep"
          value={`${metrics.avgSleep || 0}h`}
          change={metrics.sleepChange || 0}
          icon={Moon}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartCard
          title="Daily Steps Trend"
          data={trendData}
          dataKey="value"
          color="#00D4FF"
        />
        <PieChartCard
          title="Wellness Overview"
          data={diseaseData}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartCard
          title="Water Intake Trend"
          data={waterData || []}
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
    </div>
  );
}