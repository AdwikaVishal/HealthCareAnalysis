import { Bell, Sun, Moon, AlertCircle, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import UserDropdown from './UserDropdown';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { navbarAIService } from '../services/navbarAIService';

export default function Navbar({ onSearch }) {
  const { isDark, toggleTheme } = useTheme();
  const [greeting, setGreeting] = useState('Welcome back!');
  const [healthStatus, setHealthStatus] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNavbarAI = async () => {
      try {
        setLoading(true);
        const state = api.getCurrentData();

        // Only run LLM features for single-user uploaded data
        if (!state.isUserData) {
          // Clear AI-driven UI when not user-specific
          setGreeting('Welcome back!');
          setHealthStatus(null);
          setAlert(null);
          return;
        }

        const metrics = state.metrics;
        if (metrics && Object.keys(metrics).length > 0) {
          // Generate personalized greeting
          const greetingText = await navbarAIService.generatePersonalizedGreeting(metrics);
          setGreeting(greetingText);

          // Generate health status
          const healthStatusData = await navbarAIService.generateHealthStatusBadge(metrics);
          setHealthStatus(healthStatusData);

          // Generate health alert if needed
          if (state.anomalies && state.anomalies.length > 0) {
            const alertData = await navbarAIService.generateHealthAlert(state.anomalies);
            setAlert(alertData);
          } else {
            setAlert(null);
          }
        }
      } catch (error) {
        console.warn('Error loading navbar AI:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNavbarAI();

    // Reload navbar when data updates
    const handleDataUpdate = () => {
      loadNavbarAI();
    };

    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => window.removeEventListener('dataUpdated', handleDataUpdate);
  }, []);

  const getHealthStatusColor = (color) => {
    const colorMap = {
      green: 'text-emerald-500',
      emerald: 'text-emerald-500',
      blue: 'text-blue-500',
      yellow: 'text-yellow-500',
      red: 'text-red-500',
    };
    return colorMap[color] || 'text-blue-500';
  };

  const getAlertIcon = (type) => {
    return type === 'critical' ? 'text-red-500' : 'text-yellow-500';
  };

  return (
    <nav className="dark:bg-blue-950/70 bg-white/95 backdrop-blur-sm border-b dark:border-blue-900 border-slate-300 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Logo and Greeting */}
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent whitespace-nowrap">
              HealthAnalytics AI
            </h1>
            <p className="text-sm dark:text-gray-400 text-slate-600 truncate">{greeting}</p>
          </div>

          {/* Health Status Badge */}
          {healthStatus && !loading && (
            <div className="flex items-center gap-2 px-3 py-1 dark:bg-blue-900/40 bg-slate-100 rounded-full border dark:border-blue-700/50 border-slate-300">
              <div
                className={`w-2 h-2 rounded-full ${getHealthStatusColor(healthStatus.color)}`}
              ></div>
              <span className="text-sm font-medium dark:text-gray-300 text-slate-700">
                {healthStatus.status}
              </span>
              <span className="text-xs dark:text-gray-400 text-slate-500">{healthStatus.score}%</span>
            </div>
          )}
        </div>

        {/* Center: Search and Alert */}
        <div className="flex items-center gap-4">
          <div className="w-64">
            <SearchBar onSearch={onSearch} placeholder="Search health data..." />
          </div>

          {/* Alert Bell */}
          {alert && (
            <div className="relative">
              <button
                onClick={() => setShowAlert(!showAlert)}
                className={`p-2 rounded-lg transition-colors relative ${
                  alert.type === 'critical'
                    ? 'dark:bg-red-900/20 bg-red-50 text-red-500'
                    : 'dark:bg-yellow-900/20 bg-yellow-50 text-yellow-500'
                }`}
              >
                <AlertCircle className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Alert Popup */}
              {showAlert && (
                <div
                  className={`absolute right-0 mt-2 w-80 p-4 rounded-lg shadow-lg border z-50 ${
                    alert.type === 'critical'
                      ? 'dark:bg-red-900/20 bg-red-50 dark:border-red-700/50 border-red-200'
                      : 'dark:bg-yellow-900/20 bg-yellow-50 dark:border-yellow-700/50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getAlertIcon(alert.type)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-sm mb-1 ${
                          alert.type === 'critical' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {alert.message}
                      </p>
                      <p className="text-xs dark:text-gray-400 text-slate-600">{alert.details}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Theme Toggle and User Dropdown */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 dark:text-gray-400 text-slate-900 hover:text-blue-600 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <UserDropdown />
        </div>
      </div>
    </nav>
  );
}