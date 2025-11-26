import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SleepQualityChart({ data }) {
  const getSleepRating = (score) => {
    if (score >= 85) return { label: 'Excellent', color: '#00FF88' };
    if (score >= 70) return { label: 'Good', color: '#00D4FF' };
    if (score >= 50) return { label: 'Okay', color: '#FFD700' };
    return { label: 'Poor', color: '#FF6B6B' };
  };

  const avgScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;
  const rating = getSleepRating(avgScore);

  return (
    <div>
      <div className="mb-4 text-center">
        <div className="text-3xl font-bold dark:text-white text-slate-900">{avgScore.toFixed(0)}</div>
        <div className="text-sm" style={{ color: rating.color }}>{rating.label}</div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="night" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="deepSleep" stackId="a" fill="#8B5CF6" />
            <Bar dataKey="lightSleep" stackId="a" fill="#00D4FF" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}