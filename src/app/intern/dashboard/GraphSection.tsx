"use client";

import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  BarElement,
  Filler,
  ScriptableContext,
} from "chart.js";
import { useDashboardChartData } from "@/lib/hooks/dashboard/useDashboardHooks";
import Spinner from "@/components/common/spinner";


ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  BarElement,
  Filler
);

export default function GraphSection() {
  const { data, isLoading, isError } = useDashboardChartData();

  if (isLoading) {
    return (
      <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-md aspect-video flex items-center justify-center">
          <Spinner />
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-md aspect-video flex items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      // <ErrorAlert 
      //   title="Failed to load chart data" 
      //   message="Could not load dashboard charts. Please try again later." 
      // />
      <div>
        Error
      </div>
    );
  }

  // Prepare time spending chart data
  const timeSpendingData = {
    labels: data?.timeSpendingData?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Time Spending",
        data: data?.timeSpendingData?.values || [0, 0, 0, 0, 0, 0, 0],
        borderColor: "#136A86",
        backgroundColor: "rgba(19, 106, 134, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#136A86",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: (ctx: ScriptableContext<"line">) => {
          // Highlight today's data point
          const today = new Date().getDay();
          const adjustedDayIndex = today === 0 ? 6 : today - 1; // Convert to Mon-Sun format
          return ctx.dataIndex === adjustedDayIndex ? 8 : 4;
        },
        pointHoverRadius: 6,
      },
    ],
  };

  const timeSpendingOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Time Spending",
        align: "start" as const,
        color: "#136A86",
        font: { size: 16, weight: "bold" as const },
        padding: { bottom: 10 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...(data?.timeSpendingData?.values || [1])) * 1.2 || 8,
        ticks: {
          stepSize: 2,
          callback: (value: string | number) => `${value}h`,
          color: "#A0A5AC",
          font: { size: 10 },
        },
        grid: { display: false },
      },
      x: {
        ticks: { color: "#A0A5AC", font: { size: 10 } },
        grid: { display: false },
      },
    },
  };

  // Prepare grade distribution chart data
  const gradeDistributionData = {
    labels: data?.gradeDistributionData?.labels || ["90-100%", "80-89%", "70-79%", "60-69%", "<60%"],
    datasets: [
      {
        label: "Number of Quizzes",
        data: data?.gradeDistributionData?.values || [0, 0, 0, 0, 0],
        backgroundColor: "#136A86",
        borderRadius: 8,
      },
    ],
  };

  const gradeDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Quiz Score Distribution",
        align: "start" as const,
        color: "#136A86",
        font: { size: 16, weight: "bold" as const },
        padding: { bottom: 10 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: "#A0A5AC",
          font: { size: 10 },
        },
        grid: { display: false },
      },
      x: {
        ticks: { color: "#A0A5AC", font: { size: 10 } },
        grid: { display: false },
      },
    },
  };

  // Calculate which day is "today" for highlighting
  const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  const todayIndex = today === 0 ? 6 : today - 1; // Convert to Mon-Sun format (0 = Monday)

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Line Chart Section */}
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <div className="relative w-full aspect-video">
            <Line data={timeSpendingData} options={timeSpendingOptions} />
          
          </div>
        </div>

        {/* Bar Chart Section */}
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <div className="relative w-full aspect-video">
            <Bar data={gradeDistributionData} options={gradeDistributionOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}