"use client";

import React from "react";
import StatCard from "@/components/layout/StatCard";
import { useAuthStore } from "@/store/authStore";
import { useUserDashboardStats } from "@/lib/hooks/dashboard/useDashboardHooks";
import { BookOpen, CheckCircle, Clock, BookMarked } from "lucide-react";
import StatSkeletonCard from "@/components/common/StatSkeletonCard";

const StatsSection = () => {
  // State for user to prevent hydration mismatch
  const [user, setUser] = React.useState({ full_name: "User" });
  
  React.useEffect(() => {
    // Set user only on client side
    const authUser = useAuthStore.getState().user;
    setUser({ full_name: authUser?.full_name || "User" });
  }, []);

  const { data, isLoading, isError } = useUserDashboardStats();
  
  // Default stats structure
  const defaultStats = {
    totalCourses: { value: 0, maxValue: 10 },
    completedCourses: { value: 0, maxValue: 0 },
    ongoingCourses: { value: 0, maxValue: 5 },
    hoursSpent: { value: 0, maxValue: 100 }
  };

  // Merge with actual data if available
  const stats = React.useMemo(() => ({
    ...defaultStats,
    ...(data?.data || {})
  }), [data]);

  // Stats array with proper SVG components
  const statsArray = [
    { 
      title: "Total Studied Courses", 
      icon: BookOpen,
      ...stats.totalCourses 
    },
    { 
      title: "Completed Courses", 
      icon: CheckCircle,
      ...stats.completedCourses 
    },
    { 
      title: "Ongoing Courses", 
      icon: BookMarked,
      ...stats.ongoingCourses 
    },
    { 
      title: "Hours Spent", 
      icon: Clock,
      ...stats.hoursSpent 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome back, {user.full_name}</h1>
        <p className="text-gray-600">Ready to learn today?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, index) => (
              <StatSkeletonCard key={`skeleton-${index}`} />
          ))
        ) : isError ? (
          <div className="col-span-full p-4 bg-red-50 text-red-500 rounded-lg">
            Failed to load dashboard statistics. Please try again later.
          </div>
        ) : (
          statsArray.map((stat, index) => (
            <StatCard 
              key={`stat-${index}`}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              maxValue={stat.maxValue}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default StatsSection;