import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Lightbulb,
  Upload,
  Activity,
  Zap,
  MessageCircle,
  Heart,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { navbarAIService } from '../services/navbarAIService';

export default function Sidebar() {
  const location = useLocation();
  const [recommendations, setRecommendations] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/trends', icon: TrendingUp, label: 'Trends' },
    { path: '/insights', icon: Lightbulb, label: 'Insights' },
    { path: '/forecast', icon: Zap, label: 'Forecast' },
    { path: '/health-assistant', icon: MessageCircle, label: 'Health Assistant' },
    { path: '/wellness-center', icon: Heart, label: 'Vitality Hub' },
    { path: '/upload', icon: Upload, label: 'Upload' },
  ];

  useEffect(() => {
    const loadAIContent = async () => {
      try {
        setLoading(true);
        const state = api.getCurrentData();

        // Only show AI recommendations for single-user uploaded data
        if (!state.isUserData) {
          setRecommendations([]);
          setActionItems([]);
          return;
        }

        const metrics = state.metrics;
        if (metrics && Object.keys(metrics).length > 0) {
          // Generate nav recommendations based on current page and health data
          const recs = await navbarAIService.generateNavRecommendations(
            metrics,
            location.pathname
          );
          setRecommendations(recs);

          // Generate action items based on health metrics
          const actions = await navbarAIService.generateActionItems(metrics);
          setActionItems(actions);
        }
      } catch (error) {
        console.warn('Error loading sidebar AI:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAIContent();

    // Reload when data updates or location changes
    const handleDataUpdate = () => {
      loadAIContent();
    };

    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => window.removeEventListener('dataUpdated', handleDataUpdate);
  }, [location.pathname]);

  const getIconForLabel = (label) => {
    const iconMap = {
      'TrendingUp': TrendingUp,
      'Lightbulb': Lightbulb,
      'Zap': Zap,
      'MessageCircle': MessageCircle,
      'Heart': Heart,
      'BarChart3': BarChart3,
      'Upload': Upload,
    };
    return iconMap[label] || Lightbulb;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'border-l-4 border-red-500 dark:bg-red-900/20 bg-red-50';
      case 'medium':
        return 'border-l-4 border-yellow-500 dark:bg-yellow-900/20 bg-yellow-50';
      case 'low':
        return 'border-l-4 border-emerald-500 dark:bg-emerald-900/20 bg-emerald-50';
      default:
        return 'border-l-4 border-blue-500 dark:bg-blue-900/20 bg-blue-50';
    }
  };

  return (
    <aside className="w-64 dark:bg-blue-950/50 bg-white/95 backdrop-blur-sm border-r dark:border-blue-900 border-slate-300 min-h-screen overflow-y-auto">
      <div className="p-6 space-y-8">
        {/* Logo */}
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-lg dark:text-white text-slate-900">
              HealthAnalytics
            </span>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 text-neon-blue neon-glow'
                      : 'dark:text-gray-400 text-slate-900 dark:hover:text-white hover:text-slate-900 dark:hover:bg-blue-900/50 hover:bg-slate-200/60'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* AI Recommendations Section */}
        {!loading && recommendations.length > 0 && (
          <div className="pt-6 border-t dark:border-blue-900 border-slate-300">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-neon-blue" />
              <h3 className="text-sm font-semibold dark:text-gray-300 text-slate-700">
                AI Recommendations
              </h3>
            </div>
            <div className="space-y-3">
              {recommendations.slice(0, 2).map((rec, idx) => {
                const IconComponent = getIconForLabel(rec.icon);
                return (
                  <NavLink
                    key={idx}
                    to={rec.path}
                    className="group flex items-center justify-between px-3 py-2 rounded-lg dark:bg-blue-900/30 bg-slate-100 dark:hover:bg-blue-900/50 hover:bg-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <IconComponent className="w-4 h-4 text-neon-blue flex-shrink-0" />
                      <span className="text-xs font-medium dark:text-gray-300 text-slate-700 truncate">
                        {rec.label}
                      </span>
                    </div>
                    <ChevronRight className="w-3 h-3 dark:text-gray-500 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Health Action Items */}
        {!loading && actionItems.length > 0 && (
          <div className="pt-6 border-t dark:border-blue-900 border-slate-300">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-neon-blue" />
              <h3 className="text-sm font-semibold dark:text-gray-300 text-slate-700">
                Health Actions
              </h3>
            </div>
            <div className="space-y-2">
              {actionItems.slice(0, 2).map((item, idx) => (
                <NavLink
                  key={idx}
                  to={item.action}
                  className={`p-3 rounded-lg transition-colors cursor-pointer ${getUrgencyColor(
                    item.urgency
                  )}`}
                >
                  <p className="text-xs font-semibold dark:text-gray-200 text-slate-800 mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs dark:text-gray-400 text-slate-600 leading-tight">
                    {item.message}
                  </p>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* AI Status */}
        {!loading && (
          <div className="pt-6 border-t dark:border-blue-900 border-slate-300">
            <p className="text-xs dark:text-gray-500 text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Powered by LLM
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}