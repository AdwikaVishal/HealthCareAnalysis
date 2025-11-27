import { mockMetrics, mockTrendData, mockDiseaseData, mockAgeGroups, mockInsights, generateRandomData, parseCSVData, mockForecastData, mockRiskData, mockWeeklyData, mockHabits, mockSleepQuality, mockChatResponses } from './mockData.js';

const API_BASE_URL = 'http://localhost:8000';
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

// Expose currentData for dashboard access
export const getCurrentData = () => currentData;

// Helper to transform backend data to frontend format
const transformBackendData = (backendData) => {
  const { summary = {}, trends = [], anomalies = [], timeseries = [] } = backendData;
  
  // Transform timeseries to chart format
  const chartData = {};
  if (timeseries && Array.isArray(timeseries)) {
    timeseries.forEach(item => {
      if (!chartData[item.metric]) chartData[item.metric] = [];
      chartData[item.metric].push({
        date: item.day,
        value: item.value,
        [item.metric]: item.value
      });
    });
  }
  
  // Calculate metrics from summary and timeseries
  const users = summary.total_users || 1;
  
  // Get trend percentages from backend trends data
  const getTrendChange = (metric) => {
    const trend = trends.find(t => t.metric === metric);
    return trend ? trend.change_percent : 0;
  };
  
  return {
    metrics: {
      totalPatients: users,
      activePatients: users,
      avgAge: 35, // Default since not in health data
      criticalCases: anomalies.filter(a => a.reason && a.reason.includes('Urgent')).length,
      avgSteps: Math.round(summary.steps_avg_7d || 0),
      avgHeartRate: Math.round(summary.heart_rate_avg_7d || 0),
      avgSleep: Math.round((summary.sleep_avg_7d || 0) * 10) / 10,
      avgWater: Math.round(summary.water_avg_7d || 0),
      // Dynamic trend changes
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

export const api = {
  async getMetrics() {
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
    if (currentData.currentDataId) {
      try {
        const response = await fetch(`${API_BASE_URL}/data/${currentData.currentDataId}/trends`);
        if (response.ok) {
          const timeseries = await response.json();
          // Filter for steps data only
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
    if (currentData.currentDataId) {
      try {
        const response = await fetch(`${API_BASE_URL}/data/${currentData.currentDataId}/trends`);
        if (response.ok) {
          const timeseries = await response.json();
          // Create health metrics distribution using averages
          const metrics = {};
          const counts = {};
          
          timeseries.forEach(item => {
            if (!metrics[item.metric]) {
              metrics[item.metric] = 0;
              counts[item.metric] = 0;
            }
            metrics[item.metric] += item.value;
            counts[item.metric]++;
          });
          
          // Calculate averages and scale for equal visibility
          const avgMetrics = {
            steps: (metrics.steps || 0) / (counts.steps || 1),
            heart_rate: (metrics.heart_rate || 0) / (counts.heart_rate || 1),
            sleep: (metrics.sleep || 0) / (counts.sleep || 1),
            water: (metrics.water || 0) / (counts.water || 1)
          };
          
          // Scale all metrics to similar ranges for pie chart visibility
          const normalizedMetrics = {
            steps: Math.round(avgMetrics.steps / 100), // ~89 for 8900 steps
            heart_rate: Math.round(avgMetrics.heart_rate), // ~78 bpm
            sleep: Math.round(avgMetrics.sleep * 10), // ~72 for 7.2 hours
            water: Math.round(avgMetrics.water / 100) // ~22 for 2200ml
          };
          
          const colors = {
            'steps': '#00D4FF',
            'heart_rate': '#FF6B6B', 
            'sleep': '#8B5CF6',
            'water': '#00FF88'
          };
          
          const healthData = Object.keys(normalizedMetrics)
            .filter(metric => normalizedMetrics[metric] > 0)
            .map(metric => ({
              name: metric.charAt(0).toUpperCase() + metric.slice(1).replace('_', ' '),
              value: normalizedMetrics[metric],
              color: colors[metric] || '#FFA500'
            }));
          
          currentData.diseaseData = healthData;
          return healthData;
        }
      } catch (error) {
        console.error('Error fetching health metrics data:', error);
      }
    }
    await delay(600);
    return currentData.diseaseData;
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
    if (currentData.currentDataId) {
      try {
        const data = await this.getDataById(currentData.currentDataId);
        const transformed = transformBackendData(data);
        currentData.metrics = transformed.metrics;
        currentData.trendData = transformed.trendData;
        return currentData;
      } catch (error) {
        console.error('Error refreshing real data:', error);
      }
    }
    await delay(1000);
    currentData.trendData = generateRandomData();
    return currentData;
  },

  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      currentData.currentDataId = result.data_id;
      
      // Fetch full data and update current data
      const fullData = await this.getDataById(result.data_id);
      console.log('Backend data:', fullData); // Debug log
      const transformed = transformBackendData(fullData);
      
      currentData.metrics = transformed.metrics;
      currentData.trendData = transformed.trendData;
      currentData.heartRateData = transformed.heartRateData;
      currentData.sleepData = transformed.sleepData;
      currentData.waterData = transformed.waterData;
      
      // Simple user growth calculation
      const previousUserCount = parseInt(localStorage.getItem('previousUserCount') || '0');
      let userGrowth = 0;
      
      if (previousUserCount === 0) {
        // First upload - show positive growth
        userGrowth = transformed.metrics.totalPatients > 1 ? 15.5 : 8.2;
      } else {
        // Calculate actual growth
        userGrowth = Math.round(((transformed.metrics.totalPatients - previousUserCount) / previousUserCount) * 100);
      }
      
      console.log('User Growth Debug:', {
        current: transformed.metrics.totalPatients,
        previous: previousUserCount,
        growth: userGrowth
      });
      
      transformed.metrics.userGrowth = userGrowth;
      localStorage.setItem('previousUserCount', transformed.metrics.totalPatients.toString());
      
      // Make data accessible
      api.currentData = currentData;
      
      const insights = [
        {
          id: Date.now(),
          type: 'success',
          title: 'Health Data Processed',
          description: `Analyzed ${transformed.metrics.totalPatients} users with ${transformed.trendData.length} data points`,
          timestamp: 'Just now'
        },
        {
          id: Date.now() + 1,
          type: transformed.anomalies.length > 0 ? 'warning' : 'success',
          title: 'Health Assessment',
          description: transformed.anomalies.length > 0 ? 
            `${transformed.anomalies.length} anomalies detected` :
            'All health metrics within normal ranges',
          timestamp: 'Just now'
        }
      ];
      currentData.insights = [...insights, ...currentData.insights.slice(0, 2)];
      
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: currentData }));
      
      return { 
        success: true, 
        message: `Health data processed: ${transformed.metrics.totalPatients} users analyzed`, 
        fileName: file.name,
        data_id: result.data_id
      };
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
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
    
    // Search insights
    const insightResults = currentData.insights.filter(insight => 
      insight.title.toLowerCase().includes(lowerQuery) ||
      insight.description.toLowerCase().includes(lowerQuery)
    );
    
    // Search health metrics
    if (lowerQuery.includes('steps') || lowerQuery.includes('walk')) {
      results.push({
        id: 'metric-steps',
        title: 'Daily Steps Analysis',
        description: `Current average: ${currentData.metrics.totalPatients ? '8,420' : '7,200'} steps/day`,
        timestamp: 'Live data'
      });
    }
    
    if (lowerQuery.includes('heart') || lowerQuery.includes('bpm')) {
      results.push({
        id: 'metric-heart',
        title: 'Heart Rate Monitoring',
        description: 'Average resting heart rate: 72 BPM - Normal range',
        timestamp: 'Live data'
      });
    }
    
    if (lowerQuery.includes('sleep')) {
      results.push({
        id: 'metric-sleep',
        title: 'Sleep Quality Report',
        description: 'Average sleep: 7.2 hours - Sleep efficiency: 85%',
        timestamp: 'Live data'
      });
    }
    
    if (lowerQuery.includes('stress') || lowerQuery.includes('anxiety')) {
      results.push({
        id: 'metric-stress',
        title: 'Stress Level Assessment',
        description: 'Current stress index: 35/100 - Well managed',
        timestamp: 'Live data'
      });
    }
    
    if (lowerQuery.includes('hydration') || lowerQuery.includes('water')) {
      results.push({
        id: 'metric-hydration',
        title: 'Hydration Tracking',
        description: 'Daily intake: 2.1L - Meeting recommended levels',
        timestamp: 'Live data'
      });
    }
    
    // Combine results
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
    
    // Calculate impact multipliers
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
    
    // Calculate new risk levels based on changes
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
    await delay(1500);
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('sleep')) return mockChatResponses.sleep;
    if (lowerPrompt.includes('stress')) return mockChatResponses.stress;
    if (lowerPrompt.includes('habit')) return mockChatResponses.habits;
    
    return mockChatResponses.default;
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
    if (currentData.currentDataId) {
      return currentData.waterData || [];
    }
    return [];
  },

  async getHeartRateData() {
    if (currentData.currentDataId) {
      return currentData.heartRateData || [];
    }
    return [];
  },

  async getStressLevel() {
    await delay(400);
    return Math.floor(Math.random() * 40) + 20; // 20-60 range
  },

  async generateWeeklyPDF(data) {
    await delay(2000);
    // Simulate PDF generation and download
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