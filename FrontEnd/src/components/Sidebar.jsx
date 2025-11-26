import { NavLink } from 'react-router-dom';
import { BarChart3, TrendingUp, Lightbulb, Upload, Activity, Zap, MessageCircle, Heart } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/trends', icon: TrendingUp, label: 'Trends' },
    { path: '/insights', icon: Lightbulb, label: 'Insights' },
    { path: '/forecast', icon: Zap, label: 'Forecast' },
    { path: '/health-assistant', icon: MessageCircle, label: 'Health Assistant' },
    { path: '/wellness-center', icon: Heart, label: 'Vitality Hub' },
    { path: '/upload', icon: Upload, label: 'Upload' }
  ];

  return (
    <aside className="w-64 dark:bg-blue-950/50 bg-white/95 backdrop-blur-sm border-r dark:border-blue-900 border-slate-300 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="font-semibold text-lg dark:text-white text-slate-900">HealthAnalytics</span>
        </div>
        
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
    </aside>
  );
}