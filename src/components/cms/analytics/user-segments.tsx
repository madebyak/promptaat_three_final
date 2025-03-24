"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define tooltip props interface
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: UserSegment;
    value: number;
    name: string;
  }>;
}

// Define cohort data interface
interface UserSegment {
  name: string;
  value: number;
  color: string;
}

export default function UserSegments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserSegment[]>([]);

  // Function to fetch user segments data
  const fetchUserSegmentsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Make the actual API call
      const response = await fetch('/api/cms/analytics/user-segments');
      
      if (!response.ok) {
        throw new Error("Failed to fetch user segments data");
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch user segments data");
      }
      
      setData(result.data || []);
    } catch (err) {
      console.error("Error fetching user segments data:", err);
      setError("Failed to load user segments data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on initial load
  useEffect(() => {
    fetchUserSegmentsData();
  }, [fetchUserSegmentsData]);

  // COLORS for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-xs text-gray-600">Count: {data.value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : data.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-md">
          <p className="text-gray-500">No user segments data available.</p>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium mb-2">About User Segments</h4>
        <p className="text-sm text-gray-600">
          User segments classify users based on their engagement levels and activities. These segments 
          help understand user behavior patterns and can guide targeted engagement strategies.
        </p>
      </div>
    </div>
  );
}
