import { Activity, Heart, Moon, Droplets, Download } from 'lucide-react';

export default function WeeklySummary({ data, onExportPDF }) {
  const metrics = [
    { icon: Activity, label: 'Avg Steps', value: data.avgSteps, unit: '/day', color: 'text-neon-blue' },
    { icon: Heart, label: 'Avg Heart Rate', value: data.avgHeartRate, unit: ' BPM', color: 'text-red-400' },
    { icon: Moon, label: 'Avg Sleep', value: data.avgSleep, unit: 'h', color: 'text-neon-purple' },
    { icon: Droplets, label: 'Avg Hydration', value: data.avgHydration, unit: 'L', color: 'text-neon-green' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold dark:text-white text-slate-900">Weekly Summary</h3>
        <button
          onClick={onExportPDF}
          className="flex items-center space-x-2 bg-neon-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="card-gradient rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
              <div>
                <p className="text-sm dark:text-gray-400 text-slate-600">{metric.label}</p>
                <p className="text-lg font-bold dark:text-white text-slate-900">
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}{metric.unit}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}