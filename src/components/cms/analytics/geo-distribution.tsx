"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface GeoData {
  country: string;
  users: number;
}

// Define tooltip props interface
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: GeoData;
  }>;
}

export default function GeoDistribution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GeoData[]>([]);

  // Function to fetch geographical distribution data
  const fetchGeoData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Make the actual API call
      const response = await fetch('/api/cms/analytics/geo-distribution');
      
      if (!response.ok) {
        throw new Error("Failed to fetch geographical distribution data");
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch geographical distribution data");
      }
      
      setData(result.data || []);
    } catch (err) {
      console.error("Error fetching geographical distribution data:", err);
      setError("Failed to load geographical distribution data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial load
  useEffect(() => {
    fetchGeoData();
  }, []);

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="text-sm font-medium">{data.country}</p>
          <p className="text-xs text-gray-600">Users: {data.users.toLocaleString()}</p>
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
          <p className="text-gray-500">No geographical distribution data available.</p>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="country" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="users" fill="#8884d8" name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
