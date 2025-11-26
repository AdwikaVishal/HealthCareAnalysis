export const mockMetrics = {
  totalPatients: 12847,
  activePatients: 8932,
  avgAge: 42.5,
  criticalCases: 23
};

export const mockTrendData = [
  { month: 'Jan', patients: 1200, revenue: 45000, satisfaction: 4.2 },
  { month: 'Feb', patients: 1350, revenue: 52000, satisfaction: 4.3 },
  { month: 'Mar', patients: 1180, revenue: 48000, satisfaction: 4.1 },
  { month: 'Apr', patients: 1420, revenue: 58000, satisfaction: 4.4 },
  { month: 'May', patients: 1380, revenue: 55000, satisfaction: 4.3 },
  { month: 'Jun', patients: 1520, revenue: 62000, satisfaction: 4.5 }
];

export const mockDiseaseData = [
  { name: 'Diabetes', value: 35, color: '#00D4FF' },
  { name: 'Hypertension', value: 28, color: '#8B5CF6' },
  { name: 'Heart Disease', value: 22, color: '#00FF88' },
  { name: 'Respiratory', value: 15, color: '#FF6B6B' }
];

export const mockAgeGroups = [
  { age: '0-18', count: 1200 },
  { age: '19-35', count: 3400 },
  { age: '36-50', count: 4200 },
  { age: '51-65', count: 2800 },
  { age: '65+', count: 1247 }
];

export const mockInsights = [
  {
    id: 1,
    type: 'warning',
    title: 'High Diabetes Cases',
    description: 'Diabetes cases increased by 15% this month',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    type: 'success',
    title: 'Patient Satisfaction Up',
    description: 'Average satisfaction score reached 4.5/5',
    timestamp: '5 hours ago'
  },
  {
    id: 3,
    type: 'error',
    title: 'Critical Cases Alert',
    description: '23 patients require immediate attention',
    timestamp: '1 day ago'
  },
  {
    id: 4,
    type: 'info',
    title: 'Monthly Report Ready',
    description: 'June health analytics report is available',
    timestamp: '2 days ago'
  }
];

export const generateRandomData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    patients: Math.floor(Math.random() * 500) + 1000,
    revenue: Math.floor(Math.random() * 20000) + 40000,
    satisfaction: (Math.random() * 1.5 + 3.5).toFixed(1)
  }));
};

export const mockForecastData = {
  steps: [
    { day: 'Day 1', value: 7200, predicted: 7400 },
    { day: 'Day 2', value: 7500, predicted: 7600 },
    { day: 'Day 3', value: 7800, predicted: 7900 },
    { day: 'Day 4', value: 8100, predicted: 8200 },
    { day: 'Day 5', value: 8400, predicted: 8500 },
    { day: 'Day 6', value: 8700, predicted: 8800 },
    { day: 'Day 7', value: 9000, predicted: 9100 }
  ],
  heartRate: [
    { day: 'Day 1', value: 72, predicted: 71 },
    { day: 'Day 2', value: 74, predicted: 73 },
    { day: 'Day 3', value: 73, predicted: 72 },
    { day: 'Day 4', value: 75, predicted: 74 },
    { day: 'Day 5', value: 76, predicted: 75 },
    { day: 'Day 6', value: 74, predicted: 73 },
    { day: 'Day 7', value: 73, predicted: 72 }
  ],
  sleep: [
    { day: 'Day 1', value: 7.2, predicted: 7.4 },
    { day: 'Day 2', value: 7.5, predicted: 7.6 },
    { day: 'Day 3', value: 6.8, predicted: 7.2 },
    { day: 'Day 4', value: 7.1, predicted: 7.3 },
    { day: 'Day 5', value: 7.4, predicted: 7.5 },
    { day: 'Day 6', value: 7.0, predicted: 7.2 },
    { day: 'Day 7', value: 7.3, predicted: 7.4 }
  ]
};

export const mockRiskData = [
  { type: 'fatigue', percentage: 23, level: 'medium', description: 'Moderate fatigue risk based on sleep patterns' },
  { type: 'hydration', percentage: 15, level: 'low', description: 'Low dehydration risk with current intake' },
  { type: 'sleep', percentage: 67, level: 'high', description: 'High sleep irregularity detected' },
  { type: 'stress', percentage: 45, level: 'medium', description: 'Elevated stress indicators in heart rate' }
];

export const mockWeeklyData = {
  avgSteps: 8420,
  avgHeartRate: 72,
  avgSleep: 7.2,
  avgHydration: 2.1
};

export const mockHabits = [
  { type: 'sleep', title: 'Consistent Sleep Schedule', description: 'Go to bed at the same time every night', priority: 'high', impact: 25 },
  { type: 'hydration', title: 'Morning Hydration', description: 'Drink a glass of water upon waking', priority: 'medium', impact: 15 },
  { type: 'movement', title: 'Daily Walk', description: 'Take a 15-minute walk after lunch', priority: 'medium', impact: 20 },
  { type: 'stress', title: 'Breathing Exercise', description: '5-minute deep breathing before bed', priority: 'low', impact: 10 }
];

export const mockSleepQuality = [
  { night: 'Mon', deepSleep: 2.5, lightSleep: 4.5, score: 78 },
  { night: 'Tue', deepSleep: 3.0, lightSleep: 4.2, score: 85 },
  { night: 'Wed', deepSleep: 2.2, lightSleep: 4.8, score: 72 },
  { night: 'Thu', deepSleep: 2.8, lightSleep: 4.4, score: 82 },
  { night: 'Fri', deepSleep: 3.2, lightSleep: 4.0, score: 88 },
  { night: 'Sat', deepSleep: 2.9, lightSleep: 4.3, score: 84 },
  { night: 'Sun', deepSleep: 2.6, lightSleep: 4.6, score: 79 }
];

export const mockChatResponses = {
  'sleep': 'Based on your recent data, your sleep quality has improved by 12% this week. You\'re averaging 7.2 hours per night, which is excellent. I recommend maintaining your current bedtime routine.',
  'stress': 'Your stress levels appear well-managed with an average of 35/100. Your heart rate variability suggests good stress resilience. Consider adding 5 minutes of meditation for even better results.',
  'habits': 'I\'ve identified 3 key areas for improvement: 1) Consistent sleep schedule (high priority), 2) Increase daily steps by 1,000, 3) Add morning hydration routine. These changes could boost your wellness score by 25%.',
  'default': 'I\'m analyzing your health data to provide personalized insights. Your overall wellness trend is positive with room for improvement in sleep consistency and hydration. Would you like specific recommendations for any particular area?'
};

export const parseCSVData = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });

  const totalPatients = data.length;
  
  // Enhanced health data analysis
  const avgSteps = data.reduce((sum, row) => sum + (parseInt(row.steps) || 0), 0) / totalPatients;
  const avgHeartRate = data.reduce((sum, row) => sum + (parseInt(row.heart_rate) || 0), 0) / totalPatients;
  const avgSleep = data.reduce((sum, row) => sum + (parseFloat(row.sleep_hours) || 0), 0) / totalPatients;
  const avgHydration = data.reduce((sum, row) => sum + (parseFloat(row.hydration_liters) || 0), 0) / totalPatients;
  const avgCalories = data.reduce((sum, row) => sum + (parseInt(row.calories_burned) || 0), 0) / totalPatients;
  
  // Health categories based on data
  const healthCategories = {};
  data.forEach(row => {
    const steps = parseInt(row.steps) || 0;
    const heartRate = parseInt(row.heart_rate) || 0;
    const sleep = parseFloat(row.sleep_hours) || 0;
    
    let category = 'Excellent';
    if (steps < 5000 || heartRate > 100 || sleep < 6) category = 'Needs Improvement';
    else if (steps < 8000 || heartRate > 85 || sleep < 7) category = 'Good';
    else if (steps < 10000 || heartRate > 75 || sleep < 8) category = 'Very Good';
    
    healthCategories[category] = (healthCategories[category] || 0) + 1;
  });

  const healthData = Object.entries(healthCategories).map(([name, count], index) => ({
    name,
    value: Math.round((count / totalPatients) * 100),
    color: ['#00FF88', '#00D4FF', '#8B5CF6', '#FF6B6B'][index % 4]
  }));

  return {
    metrics: {
      totalPatients,
      activePatients: data.filter(row => parseInt(row.steps) > 6000).length,
      avgSteps: Math.round(avgSteps),
      avgHeartRate: Math.round(avgHeartRate),
      avgSleep: avgSleep.toFixed(1),
      avgHydration: avgHydration.toFixed(1),
      avgCalories: Math.round(avgCalories),
      criticalCases: data.filter(row => parseInt(row.heart_rate) > 100 || parseFloat(row.sleep_hours) < 5).length
    },
    healthData,
    rawData: data
  };
};