export default function GaugeChart({ value, max = 100, title }) {
  const percentage = (value / max) * 100;
  const getColor = () => {
    if (percentage <= 30) return '#00FF88';
    if (percentage <= 60) return '#FFD700';
    return '#FF6B6B';
  };

  const getLabel = () => {
    if (percentage <= 30) return 'Low';
    if (percentage <= 60) return 'Medium';
    return 'High';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 mb-4">
        <svg className="w-full h-full" viewBox="0 0 100 50">
          <path
            d="M 10 40 A 30 30 0 0 1 90 40"
            stroke="#374151"
            strokeWidth="8"
            fill="none"
          />
          <path
            d="M 10 40 A 30 30 0 0 1 90 40"
            stroke={getColor()}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${percentage * 1.26} 126`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold dark:text-white text-slate-900">{value}</span>
        </div>
      </div>
      <h3 className="text-lg font-semibold dark:text-white text-slate-900">{title}</h3>
      <span className={`text-sm font-medium`} style={{ color: getColor() }}>
        {getLabel()} Stress
      </span>
    </div>
  );
}