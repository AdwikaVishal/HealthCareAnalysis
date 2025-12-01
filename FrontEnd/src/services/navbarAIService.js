import { api } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Service for generating dynamic navbar content using LLM
 * Based on user health data, generates personalized navigation items, 
 * greetings, and health status indicators
 */
export const navbarAIService = {
  /**
   * Generate personalized greeting based on health metrics
   */
  async generatePersonalizedGreeting(metrics) {
    try {
      // Check if backend is available
      try {
        await fetch(`${API_BASE_URL}/health`);
      } catch (error) {
        return this.generateMockGreeting(metrics);
      }

      // Call LLM backend for greeting generation
      const response = await fetch(`${API_BASE_URL}/ai/navbar-greeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: {
            avgSteps: metrics.avgSteps,
            avgHeartRate: metrics.avgHeartRate,
            avgSleep: metrics.avgSleep,
            avgWater: metrics.avgWater,
          },
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        return this.generateMockGreeting(metrics);
      }

      const data = await response.json();
      return data.greeting || this.generateMockGreeting(metrics);
    } catch (error) {
      console.warn('Error generating greeting with LLM:', error);
      return this.generateMockGreeting(metrics);
    }
  },

  /**
   * Generate health status badge text based on current metrics
   */
  async generateHealthStatusBadge(metrics) {
    try {
      // Check if backend is available
      try {
        await fetch(`${API_BASE_URL}/health`);
      } catch (error) {
        return this.generateMockHealthStatus(metrics);
      }

      const response = await fetch(`${API_BASE_URL}/ai/health-status-badge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: {
            avgSteps: metrics.avgSteps,
            avgHeartRate: metrics.avgHeartRate,
            avgSleep: metrics.avgSleep,
            avgWater: metrics.avgWater,
          },
        }),
      });

      if (!response.ok) {
        return this.generateMockHealthStatus(metrics);
      }

      const data = await response.json();
      return data.status || this.generateMockHealthStatus(metrics);
    } catch (error) {
      console.warn('Error generating health status:', error);
      return this.generateMockHealthStatus(metrics);
    }
  },

  /**
   * Generate dynamic navigation recommendations based on health data
   */
  async generateNavRecommendations(metrics, currentPage) {
    try {
      // Check if backend is available
      try {
        await fetch(`${API_BASE_URL}/health`);
      } catch (error) {
        return this.getDefaultNavRecommendations(currentPage);
      }

      const response = await fetch(`${API_BASE_URL}/ai/nav-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: {
            avgSteps: metrics.avgSteps,
            avgHeartRate: metrics.avgHeartRate,
            avgSleep: metrics.avgSleep,
            avgWater: metrics.avgWater,
          },
          currentPage: currentPage,
        }),
      });

      if (!response.ok) {
        return this.getDefaultNavRecommendations(currentPage);
      }

      const data = await response.json();
      return data.recommendations || this.getDefaultNavRecommendations(currentPage);
    } catch (error) {
      console.warn('Error generating nav recommendations:', error);
      return this.getDefaultNavRecommendations(currentPage);
    }
  },

  /**
   * Generate contextual action items for navbar based on user health trends
   */
  async generateActionItems(metrics) {
    try {
      // Check if backend is available
      try {
        await fetch(`${API_BASE_URL}/health`);
      } catch (error) {
        return this.generateMockActionItems(metrics);
      }

      const response = await fetch(`${API_BASE_URL}/ai/action-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: {
            avgSteps: metrics.avgSteps,
            avgHeartRate: metrics.avgHeartRate,
            avgSleep: metrics.avgSleep,
            avgWater: metrics.avgWater,
          },
        }),
      });

      if (!response.ok) {
        return this.generateMockActionItems(metrics);
      }

      const data = await response.json();
      return data.actions || this.generateMockActionItems(metrics);
    } catch (error) {
      console.warn('Error generating action items:', error);
      return this.generateMockActionItems(metrics);
    }
  },

  /**
   * Generate alert/notification based on health anomalies
   */
  async generateHealthAlert(anomalies) {
    try {
      // Check if backend is available
      try {
        await fetch(`${API_BASE_URL}/health`);
      } catch (error) {
        return this.generateMockAlert(anomalies);
      }

      const response = await fetch(`${API_BASE_URL}/ai/health-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anomalies: anomalies || [],
        }),
      });

      if (!response.ok) {
        return this.generateMockAlert(anomalies);
      }

      const data = await response.json();
      return data.alert || this.generateMockAlert(anomalies);
    } catch (error) {
      console.warn('Error generating health alert:', error);
      return this.generateMockAlert(anomalies);
    }
  },

  // ====== MOCK DATA GENERATORS ======

  generateMockGreeting(metrics) {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    const stepsStatus =
      metrics.avgSteps >= 8000
        ? 'You\'re crushing your step goals'
        : metrics.avgSteps >= 5000
          ? 'You\'re on track with steps'
          : 'Time to get moving';

    const sleepStatus =
      metrics.avgSleep >= 7
        ? 'Well-rested'
        : metrics.avgSleep >= 6
          ? 'Decent sleep'
          : 'Need more sleep';

    return `Good ${timeOfDay}! ${stepsStatus} and feeling ${sleepStatus.toLowerCase()}.`;
  },

  generateMockHealthStatus(metrics) {
    let status = 'Optimal';
    let color = 'green';

    const healthScore =
      (metrics.avgSteps / 10000) * 0.3 +
      (metrics.avgSleep / 8) * 0.3 +
      ((100 - Math.abs(metrics.avgHeartRate - 70)) / 100) * 0.2 +
      (metrics.avgWater / 2.5) * 0.2;

    if (healthScore >= 0.8) {
      status = 'Excellent';
      color = 'emerald';
    } else if (healthScore >= 0.6) {
      status = 'Good';
      color = 'blue';
    } else if (healthScore >= 0.4) {
      status = 'Fair';
      color = 'yellow';
    } else {
      status = 'Needs Attention';
      color = 'red';
    }

    return { status, color, score: Math.round(healthScore * 100) };
  },

  getDefaultNavRecommendations(currentPage) {
    const recommendations = {
      '/': [
        { label: 'View Trends', icon: 'TrendingUp', path: '/trends' },
        { label: 'Get Insights', icon: 'Lightbulb', path: '/insights' },
      ],
      '/trends': [
        { label: 'Check Forecast', icon: 'Zap', path: '/forecast' },
        { label: 'View Dashboard', icon: 'BarChart3', path: '/' },
      ],
      '/insights': [
        { label: 'Talk to Assistant', icon: 'MessageCircle', path: '/health-assistant' },
        { label: 'Visit Wellness Hub', icon: 'Heart', path: '/wellness-center' },
      ],
      '/forecast': [
        { label: 'Review Trends', icon: 'TrendingUp', path: '/trends' },
        { label: 'Get Insights', icon: 'Lightbulb', path: '/insights' },
      ],
    };

    return recommendations[currentPage] || [];
  },

  generateMockActionItems(metrics) {
    const items = [];

    if (metrics.avgSteps < 5000) {
      items.push({
        title: 'Low Activity',
        message: 'Try taking a 15-minute walk',
        urgency: 'high',
        action: '/wellness-center',
      });
    }

    if (metrics.avgSleep < 6.5) {
      items.push({
        title: 'Inadequate Sleep',
        message: 'Aim for 7-9 hours tonight',
        urgency: 'high',
        action: '/insights',
      });
    }

    if (metrics.avgHeartRate > 85) {
      items.push({
        title: 'Elevated Heart Rate',
        message: 'Practice some relaxation techniques',
        urgency: 'medium',
        action: '/health-assistant',
      });
    }

    if (metrics.avgWater < 1.5) {
      items.push({
        title: 'Low Hydration',
        message: 'Increase water intake today',
        urgency: 'medium',
        action: '/wellness-center',
      });
    }

    return items.length > 0
      ? items
      : [
          {
            title: 'Keep it Up!',
            message: 'Your health metrics look great',
            urgency: 'low',
            action: '/',
          },
        ];
  },

  generateMockAlert(anomalies) {
    if (!anomalies || anomalies.length === 0) {
      return null;
    }

    const highPriorityAnomalies = anomalies.filter((a) => a.reason && a.reason.includes('Urgent'));

    if (highPriorityAnomalies.length > 0) {
      return {
        type: 'critical',
        message: `${highPriorityAnomalies.length} critical health metrics detected`,
        details: highPriorityAnomalies.map((a) => a.reason).join(', '),
      };
    }

    return {
      type: 'warning',
      message: `${anomalies.length} health metrics need attention`,
      details: anomalies[0]?.reason || 'Review your health data',
    };
  },
};
