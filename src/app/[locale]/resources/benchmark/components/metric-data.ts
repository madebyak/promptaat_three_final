// Sample data for metrics dashboard
// In a real implementation, this would come from an API or database

export interface MetricData {
  title: string
  value: string
  description: string
  trend?: { 
    value: string
    positive: boolean 
  }
}

export interface AllMetricsData {
  industrySpecific: MetricData
  accuracy: MetricData
  quality: MetricData
  timeEfficiency: MetricData
  satisfaction: MetricData
  creativity: MetricData
}

export const getMetricsData = (locale: string): AllMetricsData => {
  if (locale === 'ar') {
    return {
      industrySpecific: {
        title: 'تغطية الصناعة',
        value: '25+',
        description: 'قطاعات صناعية مغطاة بواسطة مكتبة البرومبتات لدينا',
        trend: {
          value: 'تمت إضافة فئتين',
          positive: true
        }
      },
      accuracy: {
        title: 'الدقة',
        value: '٪92',
        description: 'متوسط دقة النتائج باستخدام برومبتات مقارنة بالبرومبتات العامة',
        trend: {
          value: '٪8+',
          positive: true
        }
      },
      quality: {
        title: 'الجودة',
        value: '4.2/5',
        description: 'متوسط تقييم جودة المخرجات بناءً على تقييمات المستخدمين',
        trend: {
          value: '٪12+',
          positive: true
        }
      },
      timeEfficiency: {
        title: 'كفاءة الوقت',
        value: '83 ثانية',
        description: 'متوسط الوقت المستغرق لكل برومبت معقد',
        trend: {
          value: '٪5-',
          positive: false
        }
      },
      satisfaction: {
        title: 'رضا المستخدم',
        value: '٪92',
        description: 'نسبة المستخدمين الراضين عن نتائج البرومبتات',
        trend: {
          value: '٪7+',
          positive: true
        }
      },
      creativity: {
        title: 'الإبداع',
        value: '٪85',
        description: 'تحسين الإبداع في المخرجات مقارنة بالبرومبتات العامة',
        trend: {
          value: '٪10+',
          positive: true
        }
      }
    }
  }
  
  // Default to English
  return {
    industrySpecific: {
      title: 'Industry Coverage',
      value: '25+',
      description: 'Industry sectors covered by our prompt library',
      trend: {
        value: '2 Categories added',
        positive: true
      }
    },
    accuracy: {
      title: 'Accuracy',
      value: '92%',
      description: 'Average accuracy of results using Promptaat vs generic prompts',
      trend: {
        value: '+8%',
        positive: true
      }
    },
    quality: {
      title: 'Quality',
      value: '4.2/5',
      description: 'Average quality rating of outputs based on user reviews',
      trend: {
        value: '+12%',
        positive: true
      }
    },
    timeEfficiency: {
      title: 'Time Efficiency',
      value: '83 seconds',
      description: 'Average time per complex prompt',
      trend: {
        value: '-5%',
        positive: false
      }
    },
    satisfaction: {
      title: 'User Satisfaction',
      value: '92%',
      description: 'Percentage of users satisfied with prompt results',
      trend: {
        value: '+7%',
        positive: true
      }
    },
    creativity: {
      title: 'Creativity',
      value: '85%',
      description: 'Creativity enhancement in outputs compared to generic prompts',
      trend: {
        value: '+10%',
        positive: true
      }
    }
  }
}
