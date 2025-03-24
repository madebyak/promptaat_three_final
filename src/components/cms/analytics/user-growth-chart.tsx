"use client";

import { useState, useEffect } from "react";
import { 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UserGrowthDataPoint {
  date: string;
  count: number;
}

export default function UserGrowthChart() {
  const [timeRange, setTimeRange] = useState("year");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserGrowthDataPoint[]>([]);

  // Function to fetch user growth data
  const fetchUserGrowthData = async (range: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Make the actual API call
      const response = await fetch(`/api/cms/analytics/user-growth?range=${range}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch user growth data");
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch user growth data");
      }
      
      setData(result.data || []);
    } catch (err) {
      console.error("Error fetching user growth data:", err);
      setError("Failed to load user growth data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when time range changes
  useEffect(() => {
    fetchUserGrowthData(timeRange);
  }, [timeRange]);

  // Handler for time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

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
      <div className="flex justify-end">
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
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "4px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                padding: "8px"
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              name="New Users"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
