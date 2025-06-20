import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Define types for both data formats
interface PerformanceData {
  week: string;
  trainers: number;
  instructors: number;
}

interface EnrollmentData {
  week: string;
  newEnrollments: number;
  completions: number;
}

// Union type to accept either format
type ChartData = PerformanceData[] | EnrollmentData[];

interface PerformanceChartProps {
  data?: ChartData;
  performanceData?: PerformanceData[];
}

export default function PerformanceChart({ data, performanceData }: PerformanceChartProps) {
  // Determine which data to use and its format
  const chartData = data || performanceData || [];
  
  // Check if we have enrollment data by looking for newEnrollments property
  const isEnrollmentData = chartData.length > 0 && 'newEnrollments' in chartData[0];

  // Dynamic line config based on data type
  const lineConfigs = isEnrollmentData
    ? [
        { key: "newEnrollments", name: "New Enrollments", color: "#23C9FF" },
        { key: "completions", name: "Completions", color: "#C49F26" }
      ]
    : [
        { key: "trainers", name: "Trainers", color: "#23C9FF" },
        { key: "instructors", name: "Instructors", color: "#C49F26" }
      ];

  // Title based on data type
  const title = isEnrollmentData ? "Enrollments" : "Performance";

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 h-full sm:max-h-full">
      <div className="mb-3">
        <h2 className="text-lg md:text-[26px] font-semibold text-[#136A86]">{title}</h2>
        <p className="text-[10px] sm:text-[14px] text-black">Last Month</p>
      </div>
      <div className="w-full h-full max-h-[180px] 2xl:max-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData} 
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="week" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#666' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#666' }} 
            />
            <Tooltip />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ paddingBottom: "10px", fontSize: "12px" }} 
            />
            {lineConfigs.map(config => (
              <Line 
                key={config.key}
                type="monotone" 
                dataKey={config.key} 
                stroke={config.color} 
                strokeWidth={2} 
                dot={{ stroke: config.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }} 
                name={config.name} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}