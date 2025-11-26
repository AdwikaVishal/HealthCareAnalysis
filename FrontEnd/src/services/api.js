import { mockMetrics, mockTrendData, mockDiseaseData, mockAgeGroups, mockInsights, generateRandomData, parseCSVData, mockForecastData, mockRiskData, mockWeeklyData, mockHabits, mockSleepQuality, mockChatResponses } from './mockData.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let currentData = {
  metrics: mockMetrics,
  trendData: mockTrendData,
  diseaseData: mockDiseaseData,
  ageGroups: mockAgeGroups,
  insights: mockInsights,
  searchResults: []
};

export const updateData = (newData) => {
  currentData = { ...currentData, ...newData };
};

export const api = {
  async getMetrics() {
    await delay(500);
    return currentData.metrics;
  },

  async getTrendData() {
    await delay(700);
    return currentData.trendData;
  },

  async getDiseaseData() {
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
    await delay(1000);
    currentData.trendData = generateRandomData();
    return currentData;
  },

  async uploadFile(file) {
    await delay(2000);
    const success = true;
    if (success) {
      const text = await file.text();
      const parsedData = parseCSVData(text);
      
      currentData.metrics = parsedData.metrics;
      currentData.diseaseData = parsedData.healthData;
      currentData.trendData = generateRandomData();
      
      const insights = [
        {
          id: Date.now(),
          type: 'success',
          title: 'Health Data Processed',
          description: `Analyzed ${parsedData.metrics.totalPatients} health records with avg ${parsedData.metrics.avgSteps} steps/day`,
          timestamp: 'Just now'
        },
        {
          id: Date.now() + 1,
          type: parsedData.metrics.criticalCases > 0 ? 'warning' : 'success',
          title: 'Health Assessment',
          description: parsedData.metrics.criticalCases > 0 ? 
            `${parsedData.metrics.criticalCases} individuals need health attention` :
            'All individuals show healthy vital signs',
          timestamp: 'Just now'
        }
      ];
      currentData.insights = [...insights, ...currentData.insights.slice(0, 2)];
      
      // Trigger live updates
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: currentData }));
      
      return { 
        success: true, 
        message: `Health data processed: ${parsedData.metrics.totalPatients} records analyzed`, 
        fileName: file.name,
        data: parsedData
      };
    } else {
      throw new Error('File processing failed. Please check your CSV format and try again.');
    }
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