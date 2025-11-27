import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, change, icon: Icon, color = 'blue', showTrend = true }) {
  const isPositive = change > 0;
  const colorClasses = {
    blue: 'border-neon-blue neon-glow',
    purple: 'border-neon-purple neon-glow-purple',
    green: 'border-neon-green neon-glow-green'
  };

  return (
    <div className={`card-gradient border ${colorClasses[color]} rounded-xl p-6 transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color === 'blue' ? 'blue' : color === 'purple' ? 'purple' : 'green'}-500/20`}>
          <Icon className={`w-6 h-6 text-neon-${color}`} />
        </div>
        {showTrend && (
          <div className="flex items-center space-x-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-neon-green" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm ${isPositive ? 'text-neon-green' : 'text-red-400'}`}>
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
      <h3 className="dark:text-gray-400 text-slate-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold dark:text-white text-slate-900 mt-1">{value.toLocaleString()}</p>
    </div>
  );
}