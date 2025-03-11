import { useState, useEffect } from 'react';

interface PopularPrompt {
  id: string;
  titleEn: string;
  titleAr: string;
  copyCount: number;
  createdAt: string;
}

export interface DashboardMetrics {
  promptCount: number;
  userCount: number;
  categoryCount: number;
  subcategoryCount: number;
  totalCategories: number;
  promptUsage: number;
  recentPrompts: PopularPrompt[];
}

interface UseDashboardMetricsResult {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch dashboard metrics
 */
export function useDashboardMetrics(): UseDashboardMetricsResult {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cms/dashboard/metrics');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard metrics');
      }
      
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch metrics on mount
  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
}
