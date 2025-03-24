"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivationData {
  date: string;
  activationRate: number;
  target: number;
}

export default function ActivationMetrics() {
  const [timeRange, setTimeRange] = useState("year");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ActivationData[]>([]);
  
  // Function to fetch activation data
  const fetchActivationData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Make the actual API call
      const response = await fetch(`/api/cms/analytics/activation-rate?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch activation data");
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch activation data");
      }
      
      setData(result.data || []);
    } catch (err) {
      console.error("Error fetching activation data:", err);
      setError("Failed to load activation data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Fetch data when time range changes
  useEffect(() => {
    fetchActivationData();
  }, [fetchActivationData]);

  // Handler for time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  // Calculate current activation rate
  const currentActivationRate = data.length > 0 ? data[data.length - 1].activationRate : 0;
  
  // Determine if we're above or below target
  const latestTarget = data.length > 0 ? data[data.length - 1].target : 0;
  const isAboveTarget = currentActivationRate >= latestTarget;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-500">Current Activation Rate</div>
          <div className="text-3xl font-bold">
            {currentActivationRate}%
            <span className={`ml-2 text-sm ${isAboveTarget ? 'text-green-500' : 'text-red-500'}`}>
              {isAboveTarget ? '↑' : '↓'} 
              vs {latestTarget}% target
            </span>
          </div>
        </div>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className={`h-full w-full ${loading ? 'opacity-50' : ''}`}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              formatter={(value) => [`${value}%`, "Activation Rate"]}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "4px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                padding: "8px"
              }}
            />
            <Legend />
            <ReferenceLine y={latestTarget} label="Target" stroke="#ff7300" strokeDasharray="3 3" />
            <Bar dataKey="activationRate" name="Activation Rate" fill="#8884d8">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.activationRate >= entry.target ? '#4ade80' : '#8884d8'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium mb-2">About Activation Rate</h4>
        <p className="text-sm text-gray-600">
          User activation rate measures the percentage of registered users who have used at least
          one prompt. It&apos;s a key indicator of initial product adoption and onboarding success.
        </p>
      </div>
    </div>
  );
}
