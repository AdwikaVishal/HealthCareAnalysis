import { useState, useEffect } from 'react';
import WeeklySummary from '../components/WeeklySummary';
import HabitCard from '../components/HabitCard';
import SleepQualityChart from '../components/SleepQualityChart';
import GaugeChart from '../components/GaugeChart';
import Loader from '../components/Loader';
import { api } from '../services/api';

export default function WellnessCenter() {
  const [weeklyData, setWeeklyData] = useState(null);
  const [habits, setHabits] = useState(null);
  const [sleepData, setSleepData] = useState(null);
  const [stressLevel, setStressLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weekly, habitSuggestions, sleep, stress] = await Promise.all([
          api.getWeeklyData(),
          api.getHabitSuggestions(),
          api.getSleepQualityData(),
          api.getStressLevel()
        ]);
        
        setWeeklyData(weekly);
        setHabits(habitSuggestions);
        setSleepData(sleep);
        setStressLevel(stress);
      } catch (error) {
        console.error('Error fetching wellness data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportPDF = async () => {
    try {
      await api.generateWeeklyPDF(weeklyData);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-neon-purple to-neon-blue p-6 rounded-xl">
        <h1 className="text-3xl font-bold text-white mb-2">Vitality Hub</h1>
        <p className="text-blue-100">Your personalized wellness command center</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section A - Weekly Summary */}
        <div className="card-gradient rounded-xl p-6">
          <WeeklySummary data={weeklyData} onExportPDF={handleExportPDF} />
        </div>

        {/* Section B - Habit Suggestions */}
        <div className="card-gradient rounded-xl p-6">
          <h3 className="text-xl font-semibold dark:text-white text-slate-900 mb-4">Habit Suggestions</h3>
          <div className="space-y-3">
            {habits?.map((habit, index) => (
              <HabitCard key={index} habit={habit} />
            ))}
          </div>
        </div>

        {/* Section C - Sleep Quality */}
        <div className="card-gradient rounded-xl p-6">
          <h3 className="text-xl font-semibold dark:text-white text-slate-900 mb-4">Sleep Quality Analysis</h3>
          <SleepQualityChart data={sleepData} />
        </div>

        {/* Section D - Stress Index */}
        <div className="card-gradient rounded-xl p-6">
          <h3 className="text-xl font-semibold dark:text-white text-slate-900 mb-6 text-center">Stress Index</h3>
          <div className="flex justify-center">
            <GaugeChart value={stressLevel} title="Current Level" />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm dark:text-gray-400 text-slate-600">
              Based on heart rate variability and sleep patterns
            </p>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="card-gradient rounded-xl p-6">
        <h3 className="text-xl font-semibold dark:text-white text-slate-900 mb-4">Weekly Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="dark:bg-green-500/10 bg-green-50 border dark:border-green-500/30 border-green-300 rounded-lg p-4">
            <h4 className="dark:text-green-400 text-green-700 font-semibold mb-2">Sleep Improvement</h4>
            <p className="text-sm dark:text-gray-300 text-slate-700">
              Your sleep quality improved by 12% this week. Keep up the consistent bedtime routine!
            </p>
          </div>
          <div className="dark:bg-blue-500/10 bg-blue-50 border dark:border-blue-500/30 border-blue-300 rounded-lg p-4">
            <h4 className="dark:text-blue-400 text-blue-700 font-semibold mb-2">Activity Goal</h4>
            <p className="text-sm dark:text-gray-300 text-slate-700">
              You're 85% towards your weekly step goal. Just 2,400 more steps to go!
            </p>
          </div>
          <div className="dark:bg-purple-500/10 bg-purple-50 border dark:border-purple-500/30 border-purple-300 rounded-lg p-4">
            <h4 className="dark:text-purple-400 text-purple-700 font-semibold mb-2">Stress Management</h4>
            <p className="text-sm dark:text-gray-300 text-slate-700">
              Your stress levels are well-managed. Consider meditation for even better results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}