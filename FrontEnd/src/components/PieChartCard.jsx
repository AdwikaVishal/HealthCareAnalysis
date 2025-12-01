import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function PieChartCard({ title, data }) {
  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return (
      <div className="card-gradient border border-gray-700 rounded-xl p-6 neon-glow">
        <h3 className="text-xl font-semibold dark:text-white text-slate-900 mb-6">{title}</h3>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <p className="text-gray-400">No data available</p>
            <p className="text-sm text-gray-500 mt-1">Upload health data to see metrics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-gradient border border-gray-700 rounded-xl p-6 neon-glow">
      <h3 className="text-xl font-semibold dark:text-white text-slate-900 mb-6">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#c8d9f1ff',
                border: '1px solid #1a2332ff',
                borderRadius: '8px',
                color: '#ffffff'
              }}
              labelStyle={{ color: '#ffffff' }}
            />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}