import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export default function InsightsList({ insights }) {
  const getIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      default: return Info;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'warning': return 'dark:border-yellow-500 border-yellow-400 dark:bg-yellow-500/10 bg-yellow-50';
      case 'success': return 'dark:border-neon-green border-green-400 dark:bg-green-500/10 bg-green-50';
      case 'error': return 'dark:border-red-500 border-red-400 dark:bg-red-500/10 bg-red-50';
      default: return 'dark:border-neon-blue border-blue-400 dark:bg-blue-500/10 bg-blue-50';
    }
  };

  return (
    <div className="space-y-4">
      {insights.map((insight) => {
        const Icon = getIcon(insight.type);
        const colors = getColors(insight.type);
        
        return (
          <div 
            key={insight.id}
            className={`card-gradient border ${colors} rounded-lg p-4 transition-all duration-300 hover:scale-105`}
          >
            <div className="flex items-start space-x-3">
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 dark:text-current text-slate-700" />
              <div className="flex-1">
                <h4 className="font-semibold dark:text-white text-slate-900">{insight.title}</h4>
                <p className="dark:text-gray-300 text-slate-800 text-sm mt-1">{insight.description}</p>
                <span className="text-xs dark:text-gray-500 text-slate-700 mt-2 block">{insight.timestamp}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}