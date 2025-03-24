"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define cohort data interface
interface RetentionCohort {
  cohort: string;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
  week5: number;
  week6: number;
  week7: number;
  week8: number;
}

export default function UserRetentionCohort() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RetentionCohort[]>([]);

  // Function to fetch retention cohort data
  const fetchRetentionData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Make the actual API call
      const response = await fetch('/api/cms/analytics/user-retention');
      
      if (!response.ok) {
        throw new Error("Failed to fetch retention data");
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch retention data");
      }
      
      setData(result.data || []);
    } catch (err) {
      console.error("Error fetching retention data:", err);
      setError("Failed to load retention data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial load
  useEffect(() => {
    fetchRetentionData();
  }, []);

  // Function to get cell color based on retention rate
  const getCellColor = (value: number | null) => {
    if (value === null) return "bg-gray-100";
    if (value >= 70) return "bg-green-100";
    if (value >= 40) return "bg-yellow-100";
    return "bg-red-50";
  };

  return (
    <div className="w-full">
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
          <p className="text-gray-500">No retention data available.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableCaption>User retention by cohort (% retained)</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] sticky left-0 bg-white z-10">Cohort</TableHead>
                <TableHead>Week 1</TableHead>
                <TableHead>Week 2</TableHead>
                <TableHead>Week 3</TableHead>
                <TableHead>Week 4</TableHead>
                <TableHead>Week 5</TableHead>
                <TableHead>Week 6</TableHead>
                <TableHead>Week 7</TableHead>
                <TableHead>Week 8</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((cohort, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium sticky left-0 bg-white z-10">{cohort.cohort}</TableCell>
                  <TableCell className={getCellColor(cohort.week1)}>{cohort.week1 ?? "-"}%</TableCell>
                  <TableCell className={getCellColor(cohort.week2)}>{cohort.week2 ?? "-"}%</TableCell>
                  <TableCell className={getCellColor(cohort.week3)}>{cohort.week3 ?? "-"}%</TableCell>
                  <TableCell className={getCellColor(cohort.week4)}>{cohort.week4 ?? "-"}%</TableCell>
                  <TableCell className={getCellColor(cohort.week5)}>{cohort.week5 ?? "-"}%</TableCell>
                  <TableCell className={getCellColor(cohort.week6)}>{cohort.week6 ?? "-"}%</TableCell>
                  <TableCell className={getCellColor(cohort.week7)}>{cohort.week7 ?? "-"}%</TableCell>
                  <TableCell className={getCellColor(cohort.week8)}>{cohort.week8 ?? "-"}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium mb-2">About User Retention</h4>
        <p className="text-sm text-gray-600">
          Each row represents a cohort of users who signed up in a given month. 
          The percentages show what portion of users from that cohort were still 
          active in subsequent weeks.
        </p>
      </div>
    </div>
  );
}
