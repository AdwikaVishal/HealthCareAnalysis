import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, AlertTriangle, Droplets, Moon, Zap } from 'lucide-react';
import Loader from '../components/Loader';
import { api } from '../services/api';

export default function Forecast() {
  const [forecastData, setForecastData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sleepIncrease, setSleepIncrease] = useState(0);
  const [extraSteps, setExtraSteps] = useState(0);
  const [hydrationIncrease, setHydrationIncrease] = useState(0);
  const [simulatedData, setSimulatedData] = useState(null);
  const [simulatedRisks, setSimulatedRisks] = useState(null);
  const [simulationInsights, setSimulationInsights] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [forecast, risks] = await Promise.all([
          api.getForecastData(),
          api.getRiskData()
        ]);
        setForecastData(forecast);
        setRiskData(risks);
        setSimulatedData(forecast);
      } catch (error) {
        console.error('Error fetching forecast data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const updateSimulation = async () => {
      if (forecastData) {
        const [simulated, insights] = await Promise.all([
          api.simulateForecast(sleepIncrease, extraSteps, hydrationIncrease),
          api.getSimulationInsights(sleepIncrease, extraSteps, hydrationIncrease)
        ]);
        
        setSimulatedData(simulated);
        setSimulatedRisks(simulated.risks);
        setSimulationInsights(insights);
      }
    };
    updateSimulation();
  }, [sleepIncrease, extraSteps, hydrationIncrease, forecastData]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'border-red-500 bg-red-500/10 dark:text-red-400 text-red-600';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 dark:text-yellow-400 text-yellow-600';
      default: return 'border-green-500 bg-green-500/10 dark:text-green-400 text-green-600';
    }
  };

  const getRiskIcon = (type) => {
    switch (type) {
      case 'fatigue': return TrendingUp;
      case 'hydration': return Droplets;
      case 'sleep': return Moon;
      default: return Zap;
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white text-slate-900">Health Forecast</h1>
        <div className="text-sm dark:text-gray-400 text-slate-600">
          7-day prediction model
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-gradient rounded-xl p-6">
          <h3 className="text-xl font-semibold dark:text-white text-slate-900 mb-4">Steps Forecast</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulatedData?.steps}>
                <defs>
                  <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="predicted" stroke="#00D4FF" fillOpacity={1} fill="url(#stepsGradient)" strokeWidth={2} />
                <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-gradient rounded-xl p-6">
          <h3 className="text-xl font-semibold dark:text-white text-slate-900 mb-4">Heart Rate Forecast</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulatedData?.heartRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="predicted" stroke="#00FF88" strokeWidth={3} dot={{ fill: '#00FF88', strokeWidth: 2, r: 6 }} />
                <Line type="monotone" dataKey="value" stroke="#FF6B6B" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-gradient rounded-xl p-6">
          <h3 className="text-xl font-semibold dark:text-white text-slate-900 mb-4">Sleep Forecast</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulatedData?.sleep}>
                <defs>
                  <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="predicted" stroke="#8B5CF6" fillOpacity={1} fill="url(#sleepGradient)" strokeWidth={2} />
                <Line type="monotone" dataKey="value" stroke="#00D4FF" strokeWidth={2} dot={{ fill: '#00D4FF', strokeWidth: 2, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(simulatedRisks || riskData)?.map((risk, index) => {
          const Icon = getRiskIcon(risk.type);
          const colors = getRiskColor(risk.level);
          const isChanged = simulatedRisks && simulatedRisks[index].percentage !== riskData[index].percentage;
          const change = isChanged ? simulatedRisks[index].percentage - riskData[index].percentage : 0;
          
          return (
            <div key={index} className={`card-gradient border ${colors} rounded-lg p-4 transition-all duration-500`}>
              <div className="flex items-center space-x-3 mb-2">
                <Icon className={`w-5 h-5 ${colors.includes('red') ? 'dark:text-red-400 text-red-600' : colors.includes('yellow') ? 'dark:text-yellow-400 text-yellow-600' : 'dark:text-green-400 text-green-600'}`} />
                <h4 className="font-semibold capitalize dark:text-white text-slate-900">{risk.type} Risk</h4>
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-2xl font-bold dark:text-white text-slate-900">{risk.percentage}%</p>
                {isChanged && (
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    change < 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                )}
              </div>
              <p className="text-sm dark:text-gray-300 text-slate-700">{risk.description}</p>
            </div>
          );
        })}
      </div>

      <div className="card-gradient rounded-xl p-6">
        <h3 className="text-xl font-semibold dark:text-white text-slate-900 mb-6">What-If Simulation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
              Sleep Increase: <span className="text-neon-blue font-bold">{sleepIncrease}h</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={sleepIncrease}
              onChange={(e) => setSleepIncrease(parseFloat(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="mt-6 p-4 dark:bg-slate-800/50 bg-slate-100 rounded-lg">
              <h4 className="font-semibold dark:text-white text-slate-900 mb-3">Simulation Results</h4>
              <div className="space-y-2">
                {simulationInsights.map((insight, index) => (
                  <p key={index} className="text-sm dark:text-gray-300 text-slate-700 flex items-start space-x-2">
                    <span className="text-neon-blue mt-0.5">•</span>
                    <span>{insight}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
              Extra Steps: {extraSteps}
            </label>
            <input
              type="range"
              min="0"
              max="4000"
              step="100"
              value={extraSteps}
              onChange={(e) => setExtraSteps(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
              Hydration Increase: {hydrationIncrease}L
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={hydrationIncrease}
              onChange={(e) => setHydrationIncrease(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="card-gradient rounded-xl p-6">
        <h3 className="text-xl font-semibold dark:text-white text-slate-900 mb-4">AI Health Summary</h3>
        <div className="dark:bg-blue-950/30 bg-blue-50 border dark:border-blue-800 border-blue-200 rounded-lg p-4">
          <p className="dark:text-blue-200 text-blue-900 leading-relaxed">
            Based on your current health patterns, our AI model predicts a positive trend in your overall wellness. 
            Your step count shows consistent improvement with an expected 15% increase over the next week. 
            Heart rate variability indicates good cardiovascular health, though we recommend maintaining current sleep patterns. 
            The simulation suggests that increasing sleep by 1 hour could reduce fatigue risk by 30% and improve recovery metrics significantly.
          </p>
        </div>
      </div>
    </div>
  );
}