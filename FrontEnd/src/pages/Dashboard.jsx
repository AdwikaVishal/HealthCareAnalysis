import { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import LineChartCard from '../components/LineChartCard';
import PieChartCard from '../components/PieChartCard';
import Loader from '../components/Loader';
import { api } from '../services/api';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [diseaseData, setDiseaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
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
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const newData = await api.refreshData();
      setTrendData(newData.trendData);
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
          title="Total Patients"
          value={metrics.totalPatients}
          change={8.2}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Active Patients"
          value={metrics.activePatients}
          change={5.4}
          icon={UserCheck}
          color="green"
        />
        <MetricCard
          title="Average Age"
          value={metrics.avgAge}
          change={-2.1}
          icon={Calendar}
          color="purple"
        />
        <MetricCard
          title="Critical Cases"
          value={metrics.criticalCases}
          change={-12.3}
          icon={AlertTriangle}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartCard
          title="Patient Trends"
          data={trendData}
          dataKey="patients"
          color="#00D4FF"
        />
        <PieChartCard
          title="Disease Distribution"
          data={diseaseData}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartCard
          title="Revenue Trends"
          data={trendData}
          dataKey="revenue"
          color="#8B5CF6"
        />
        <LineChartCard
          title="Satisfaction Score"
          data={trendData}
          dataKey="satisfaction"
          color="#00FF88"
        />
      </div>
    </div>
  );
}