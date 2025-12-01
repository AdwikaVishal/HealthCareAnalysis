import { mockMetrics, mockTrendData, mockDiseaseData, mockAgeGroups, mockInsights, generateRandomData, parseCSVData, mockForecastData, mockRiskData, mockWeeklyData, mockHabits, mockSleepQuality, mockChatResponses } from './mockData.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const USE_MOCK_DATA = !API_BASE_URL || import.meta.env.PROD;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let currentData = {
  metrics: mockMetrics,
  trendData: mockTrendData,
  diseaseData: mockDiseaseData,
  ageGroups: mockAgeGroups,
  insights: mockInsights,
  searchResults: [],
  currentDataId: null,
  previousUserCount: 0
};

export const updateData = (newData) => {
  currentData = { ...currentData, ...newData };
};

export const getCurrentData = () => currentData;

const transformBackendData = (backendData) => {
  const { summary = {}, trends = [], anomalies = [], timeseries = [] } = backendData;
  
  const chartData = {};
  if (timeseries && Array.isArray(timeseries)) {
    timeseries.forEach(item => {
      if (!chartData[item.metric]) chartData[item.metric] = [];
      
      let scaledValue = item.value;
      if (item.metric === 'water') {
        scaledValue = Math.round((item.value / 1000) * 10) / 10;
      }
      
      chartData[item.metric].push({
        date: item.day,
        value: scaledValue,
        [item.metric]: scaledValue
      });
    });
  }
  
  const users = summary.total_users || 1;
  
  const getTrendChange = (metric) => {
    const trend = trends.find(t => t.metric === metric);
    return trend ? trend.change_percent : 0;
  };
  
  return {
    metrics: {
      totalPatients: users,
      activePatients: users,
      avgAge: 35,
      criticalCases: anomalies.filter(a => a.reason && a.reason.includes('Urgent')).length,
      avgSteps: Math.round(summary.steps_avg_7d || 0),
      avgHeartRate: Math.round(summary.heart_rate_avg_7d || 0),
      avgSleep: Math.round((summary.sleep_avg_7d || 0) * 10) / 10,
      avgWater: Math.round(summary.water_avg_7d || 0),
      stepsChange: getTrendChange('steps'),
      heartRateChange: getTrendChange('heart_rate'),
      sleepChange: getTrendChange('sleep'),
      waterChange: getTrendChange('water')
    },
    trendData: chartData.steps || timeseries.filter(item => item.metric === 'steps').map(item => ({
      date: item.day,
      value: item.value
    })),
    heartRateData: chartData.heart_rate || [],
    sleepData: chartData.sleep || [],
    waterData: chartData.water || [],
    anomalies: anomalies || [],
    trends: trends || []
  };
};

// Expose API globally for upload component
if (typeof window !== 'undefined') {
  window.updateHealthData = (data) => {
    currentData.metrics = data.metrics;
    currentData.trendData = data.trendData || [];
    currentData.heartRateData = data.heartRateData || [];
    currentData.sleepData = data.sleepData || [];
    currentData.waterData = data.waterData || [];
    currentData.diseaseData = data.diseaseData || [];
    currentData.currentDataId = data.data_id;
  };
}

export const api = {
  async uploadFile(file, userId = null) {
    try {
      // Always use mock data in production or when no backend
      if (USE_MOCK_DATA || !API_BASE_URL || import.meta.env.PROD) {
        console.log('Using mock upload response');
        await delay(2000); // Simulate upload time
        return this.mockUploadResponse(file);
      }
      
      // Check backend availability
      try {
        const healthCheck = await fetch(`${API_BASE_URL}/health`, { 
          method: 'GET',
          timeout: 5000 
        });
        if (!healthCheck.ok) {
          throw new Error('Backend not available');
        }
      } catch (healthError) {
        console.warn('Backend unavailable, using mock data:', healthError);
        return this.mockUploadResponse(file);
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        // Fallback to mock on server error
        return this.mockUploadResponse(file);
      }
      
      const result = await response.json();
      if (!result.data_id) {
        console.warn('No data ID received, using mock response');
        return this.mockUploadResponse(file);
      }
      
      // Continue with real backend processing...
      currentData.currentDataId = result.data_id;
      
      const fullData = await this.getDataById(result.data_id);
      const transformed = transformBackendData(fullData);
      
      Object.assign(currentData, transformed);
      
      return { 
        success: true, 
        message: 'Health data processed successfully',
        fileName: file.name,
        data_id: result.data_id,
        ai_enhanced: result.ai_enhanced,
        uploadData: {
          metrics: transformed.metrics,
          diseaseData: transformed.diseaseData || currentData.diseaseData,
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          data_id: result.data_id
        }
      };
    } catch (error) {
      console.error('Upload error:', error);
      // Always fallback to mock on any error
      console.log('Falling back to mock upload due to error');
      return this.mockUploadResponse(file);
    }
  },

  mockUploadResponse(file) {
    const mockDataId = 'mock_' + Date.now();
    currentData.currentDataId = mockDataId;
    
    const mockMetrics = {
      totalPatients: 1,
      activePatients: 1,
      avgAge: 35,
      criticalCases: 0,
      avgSteps: 8420,
      avgHeartRate: 72,
      avgSleep: 7.2,
      avgWater: 2200,
      stepsChange: 5.2,
      heartRateChange: -2.1,
      sleepChange: 8.5,
      waterChange: 12.3
    };
    
    const mockDiseaseData = [
      { name: 'Steps', value: 30, color: '#00D4FF' },
      { name: 'Heart Rate', value: 25, color: '#FF6B6B' },
      { name: 'Sleep', value: 25, color: '#8B5CF6' },
      { name: 'Water', value: 20, color: '#00FF88' }
    ];
    
    const mockGeminiInsights = {
      status: 'success',
      insights: {
        wellness_score: 78,
        recommendations: [
          'Great job maintaining 8,420+ daily steps!',
          'Your sleep pattern of 7.2h is within healthy range',
          'Consider increasing water intake slightly'
        ],
        risks: [],
        positive_patterns: [
          'Consistent daily activity tracking',
          'Healthy heart rate range'
        ],
        summary: 'Your health metrics show positive trends with excellent activity levels and good sleep habits.'
      }
    };
    
    const mockProcessedData = {
      metrics: mockMetrics,
      diseaseData: mockDiseaseData,
      geminiInsights: mockGeminiInsights,
      trendData: [
        { date: '2024-01-01', value: 7200 },
        { date: '2024-01-02', value: 8100 },
        { date: '2024-01-03', value: 7800 },
        { date: '2024-01-04', value: 9200 },
        { date: '2024-01-05', value: 8500 },
        { date: '2024-01-06', value: 9800 },
        { date: '2024-01-07', value: 8900 }
      ],
      heartRateData: [
        { date: '2024-01-01', value: 72 },
        { date: '2024-01-02', value: 74 },
        { date: '2024-01-03', value: 71 },
        { date: '2024-01-04', value: 73 },
        { date: '2024-01-05', value: 75 },
        { date: '2024-01-06', value: 70 },
        { date: '2024-01-07', value: 72 }
      ],
      sleepData: [
        { date: '2024-01-01', value: 7.2 },
        { date: '2024-01-02', value: 7.5 },
        { date: '2024-01-03', value: 6.8 },
        { date: '2024-01-04', value: 7.1 },
        { date: '2024-01-05', value: 7.4 },
        { date: '2024-01-06', value: 7.0 },
        { date: '2024-01-07', value: 7.3 }
      ],
      waterData: [
        { date: '2024-01-01', value: 2.2 },
        { date: '2024-01-02', value: 2.4 },
        { date: '2024-01-03', value: 2.1 },
        { date: '2024-01-04', value: 2.3 },
        { date: '2024-01-05', value: 2.0 },
        { date: '2024-01-06', value: 2.5 },
        { date: '2024-01-07', value: 2.2 }
      ]
    };
    
    Object.assign(currentData, mockProcessedData);
    
    return {
      success: true,
      message: 'Health data processed successfully (Demo Mode)',
      fileName: file.name,
      data_id: mockDataId,
      ai_enhanced: true,
      uploadData: {
        metrics: mockMetrics,
        diseaseData: mockDiseaseData,
        geminiInsights: mockGeminiInsights,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        data_id: mockDataId
      }
    };
  },

  async getMetrics(userId = null) {
    if (USE_MOCK_DATA) {
      await delay(500);
      // Return uploaded data if available, otherwise empty
      if (currentData.metrics && currentData.metrics.totalPatients > 0) {
        return currentData.metrics;
      }
      return {
        totalPatients: 0,
        activePatients: 0,
        avgAge: 0,
        criticalCases: 0,
        avgSteps: 0,
        avgHeartRate: 0,
        avgSleep: 0,
        avgWater: 0,
        stepsChange: 0,
        heartRateChange: 0,
        sleepChange: 0,
        waterChange: 0
      };
    }
    
    if (userId) {
      const userData = this.loadUserData(userId);
      if (userData && userData.metrics) {
        return userData.metrics;
      }
    }
    
    if (currentData.currentDataId) {
      try {
        const data = await this.getDataById(currentData.currentDataId);
        const transformed = transformBackendData(data);
        currentData.metrics = transformed.metrics;
        return transformed.metrics;
      } catch (error) {
        console.error('Error fetching real metrics:', error);
      }
    }
    await delay(500);
    return currentData.metrics;
  },

  async getTrendData() {
    if (USE_MOCK_DATA) {
      await delay(700);
      // Return uploaded data if available, otherwise empty
      return currentData.trendData || [];
    }
    
    if (currentData.currentDataId) {
      try {
        const response = await fetch(`${API_BASE_URL}/data/${currentData.currentDataId}/trends`);
        if (response.ok) {
          const timeseries = await response.json();
          const stepsData = timeseries.filter(item => item.metric === 'steps').map(item => ({
            date: item.day,
            value: item.value
          }));
          currentData.trendData = stepsData;
          return stepsData;
        }
      } catch (error) {
        console.error('Error fetching real trend data:', error);
      }
    }
    await delay(700);
    return currentData.trendData;
  },

  async getDiseaseData() {
    await delay(600);
    return [
      { name: 'Steps', value: 30, color: '#00D4FF' },
      { name: 'Heart Rate', value: 25, color: '#FF6B6B' },
      { name: 'Sleep', value: 25, color: '#8B5CF6' },
      { name: 'Water', value: 20, color: '#00FF88' }
    ];
  },

  async getAgeGroups() {
    await delay(550);
    return currentData.ageGroups;
  },

  async getInsights() {
    await delay(400);
    return currentData.insights;
  },

  async refreshData() {
    await delay(1000);
    currentData.trendData = generateRandomData();
    return currentData;
  },

  loadUserData(userId) {
    const userKey = userId ? `healthApp_user_${userId}` : 'healthApp_guest';
    const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
    
    if (userData.metrics) {
      currentData.metrics = userData.metrics;
      currentData.trendData = userData.trendData || [];
      currentData.heartRateData = userData.heartRateData || [];
      currentData.sleepData = userData.sleepData || [];
      currentData.waterData = userData.waterData || [];
      currentData.diseaseData = userData.diseaseData || mockDiseaseData;
      currentData.currentDataId = userData.data_id;
      
      return userData;
    }
    
    return null;
  },

  saveUserData(userId, data) {
    const userKey = userId ? `healthApp_user_${userId}` : 'healthApp_guest';
    localStorage.setItem(userKey, JSON.stringify(data));
  },

  clearCurrentData() {
    currentData.metrics = { ...mockMetrics };
    currentData.trendData = [...mockTrendData];
    currentData.diseaseData = [...mockDiseaseData];
    currentData.heartRateData = [];
    currentData.sleepData = [];
    currentData.waterData = [];
    currentData.currentDataId = null;
    currentData.insights = [...mockInsights];
  },

  async getDataById(dataId) {
    const response = await fetch(`${API_BASE_URL}/data/${dataId}/summary`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return response.json();
  },

  async searchData(query) {
    await delay(300);
    if (!query) {
      currentData.searchResults = [];
      return [];
    }
    
    const lowerQuery = query.toLowerCase();
    let results = [];
    
    const insightResults = currentData.insights.filter(insight => 
      insight.title.toLowerCase().includes(lowerQuery) ||
      insight.description.toLowerCase().includes(lowerQuery)
    );
    
    if (lowerQuery.includes('steps') || lowerQuery.includes('walk')) {
      results.push({
        id: 'metric-steps',
        title: 'Daily Steps Analysis',
        description: `Current average: ${currentData.metrics.totalPatients ? '8,420' : '7,200'} steps/day`,
        timestamp: 'Live data'
      });
    }
    
    results = [...results, ...insightResults];
    currentData.searchResults = results;
    return results;
  },

  async getForecastData() {
    await delay(600);
    return mockForecastData;
  },

  async getRiskData() {
    await delay(500);
    return mockRiskData;
  },

  async getSimulationInsights(sleepIncrease, extraSteps, hydrationIncrease) {
    await delay(300);
    const insights = [];
    
    if (sleepIncrease > 0.5) {
      insights.push(`Increasing sleep by ${sleepIncrease}h could reduce fatigue risk by ${Math.round(sleepIncrease * 15)}% and improve recovery.`);
    }
    
    if (extraSteps > 1000) {
      insights.push(`Adding ${extraSteps.toLocaleString()} steps daily may boost cardiovascular health and reduce stress by ${Math.round(extraSteps / 1000 * 3)}%.`);
    }
    
    if (hydrationIncrease > 0.3) {
      insights.push(`Increasing hydration by ${hydrationIncrease}L could improve energy levels and reduce dehydration risk by ${Math.round(hydrationIncrease * 25)}%.`);
    }
    
    if (insights.length === 0) {
      insights.push('Adjust the sliders above to see how lifestyle changes could impact your health metrics.');
    }
    
    return insights;
  },

  async simulateForecast(sleepIncrease, extraSteps, hydrationIncrease) {
    await delay(400);
    
    const stepMultiplier = 1 + (extraSteps / 10000);
    const sleepImpact = sleepIncrease * 0.5;
    const hydrationImpact = hydrationIncrease * 0.3;
    
    const adjusted = {
      steps: mockForecastData.steps.map(item => ({
        ...item,
        predicted: Math.round(item.predicted * stepMultiplier + extraSteps * 0.15)
      })),
      heartRate: mockForecastData.heartRate.map(item => ({
        ...item,
        predicted: Math.max(55, Math.round(item.predicted - sleepImpact - hydrationImpact))
      })),
      sleep: mockForecastData.sleep.map(item => ({
        ...item,
        predicted: Math.min(9.5, Math.max(5, item.predicted + sleepIncrease * 0.8))
      }))
    };
    
    const newRisks = mockRiskData.map(risk => {
      let newPercentage = risk.percentage;
      
      if (risk.type === 'fatigue') {
        newPercentage = Math.max(5, risk.percentage - sleepIncrease * 15 - hydrationIncrease * 8);
      } else if (risk.type === 'hydration') {
        newPercentage = Math.max(5, risk.percentage - hydrationIncrease * 25);
      } else if (risk.type === 'sleep') {
        newPercentage = Math.max(10, risk.percentage - sleepIncrease * 20);
      } else if (risk.type === 'stress') {
        newPercentage = Math.max(8, risk.percentage - sleepIncrease * 10 - (extraSteps / 1000) * 3);
      }
      
      const level = newPercentage <= 25 ? 'low' : newPercentage <= 50 ? 'medium' : 'high';
      
      return {
        ...risk,
        percentage: Math.round(newPercentage),
        level
      };
    });
    
    return { ...adjusted, risks: newRisks };
  },

  async chatWithAI(prompt) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          data_id: currentData.currentDataId
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.response;
      }
    } catch (error) {
      console.error('Chat API error:', error);
    }
    
    // Fallback to mock responses
    await delay(1500);
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('sleep')) return mockChatResponses.sleep;
    if (lowerPrompt.includes('stress')) return mockChatResponses.stress;
    if (lowerPrompt.includes('habit')) return mockChatResponses.habits;
    return mockChatResponses.default;
  },

  getGeminiInsights() {
    return currentData.geminiInsights || null;
  },

  async getWeeklyData() {
    await delay(500);
    return mockWeeklyData;
  },

  async getHabitSuggestions() {
    await delay(600);
    return mockHabits;
  },

  async getSleepQualityData() {
    await delay(550);
    return mockSleepQuality;
  },

  async getWaterData() {
    if (USE_MOCK_DATA || !currentData.currentDataId) {
      return currentData.waterData || [];
    }
    
    if (currentData.currentDataId) {
      try {
        const response = await fetch(`${API_BASE_URL}/data/${currentData.currentDataId}/trends`);
        if (response.ok) {
          const timeseries = await response.json();
          const waterData = timeseries
            .filter(item => item.metric === 'water')
            .map(item => ({
              date: item.day,
              value: Math.round((item.value / 1000) * 10) / 10
            }));
          currentData.waterData = waterData;
          return waterData;
        }
      } catch (error) {
        console.error('Error fetching water data:', error);
      }
    }
    return currentData.waterData || [];
  },

  async getHeartRateData() {
    if (USE_MOCK_DATA || !currentData.currentDataId) {
      return currentData.heartRateData || [];
    }
    
    if (currentData.currentDataId) {
      try {
        const response = await fetch(`${API_BASE_URL}/data/${currentData.currentDataId}/trends`);
        if (response.ok) {
          const timeseries = await response.json();
          const heartRateData = timeseries
            .filter(item => item.metric === 'heart_rate')
            .map(item => ({
              date: item.day,
              value: item.value
            }));
          currentData.heartRateData = heartRateData;
          return heartRateData;
        }
      } catch (error) {
        console.error('Error fetching heart rate data:', error);
      }
    }
    return currentData.heartRateData || [];
  },

  async getSleepData() {
    if (USE_MOCK_DATA || !currentData.currentDataId) {
      return currentData.sleepData || [];
    }
    
    if (currentData.currentDataId) {
      try {
        const response = await fetch(`${API_BASE_URL}/data/${currentData.currentDataId}/trends`);
        if (response.ok) {
          const timeseries = await response.json();
          const sleepData = timeseries
            .filter(item => item.metric === 'sleep')
            .map(item => ({
              date: item.day,
              value: item.value
            }));
          currentData.sleepData = sleepData;
          return sleepData;
        }
      } catch (error) {
        console.error('Error fetching sleep data:', error);
      }
    }
    return currentData.sleepData || [];
  },

  async getStressLevel() {
    await delay(400);
    return Math.floor(Math.random() * 40) + 20;
  },

  async generateWeeklyPDF(data) {
    await delay(2000);
    const pdfContent = `Weekly Health Report\n\nSteps: ${data.avgSteps}\nHeart Rate: ${data.avgHeartRate}\nSleep: ${data.avgSleep}h\nHydration: ${data.avgHydration}L`;
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weekly-health-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true, message: 'PDF downloaded successfully' };
  }
};