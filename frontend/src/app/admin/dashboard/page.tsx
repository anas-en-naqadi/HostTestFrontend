"use client";
import AdminStatCard from "@/components/ui/AdminStatCard";
import PopularCoursesCard from "@/components/ui/PopularCoursesCard";
import PerformanceChart from "@/components/ui/PerformanceChart";
import ActiveNowCard from "@/components/ui/ActiveNowCard";
import {
  User,     
  UserCog,
  Book,      
  LayoutGrid         
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useAdminDashboard } from "@/lib/hooks/dashboard/useAdminDashboard";
import { formatDate } from "@/utils/formatDate";

export default function DashBoard() {
  const { user } = useAuthStore();
  const userFullName = user?.full_name || "";
  
  // Use the dashboard hook
  const { 
    loading,
    error, 
    stats, 
    performanceData, 
    popularCourses, 
  } = useAdminDashboard();

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>Failed to load dashboard data. Please try again later.</p>
      </div>
    );
  }

  // Use skeleton data while loading
  const fallbackStats = {
    trainers: 0,
    instructors: 0,
    courses: 0,
    categories: 0,
    activeInterns: 0,
    activeInstructors: 0,
  };

  return (
    <div className="flex flex-col font-sans gap-6 h-full w-full p-4 sm:p-0 sm:pt-10">
      {/* Header section */}
      <div className="mb-2 flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-medium text-[#333]">
            Welcome back, <span className="font-bold">{userFullName}</span>
          </h1>
          <p className="text-sm text-[#5CB5BD] mt-1">
            Your last login was : {formatDate(user?.last_login || null)}
          </p>
        </div>
        
        
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Stats cards section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 sm:max-h-[387px] xl:min-h-[450px]">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-5 animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <AdminStatCard
                icon={User}
                title="Total Trainers"
                value={stats?.trainers || 0}
                subTitle="Intern"
              />
              <AdminStatCard
                icon={UserCog}
                title="Total Instructors"
                value={stats?.instructors || 0}
                subTitle="Instructor"
              />
              <AdminStatCard
                icon={Book}
                title="Total Courses"
                value={stats?.courses || 0}
                subTitle="Course"
              />
              <AdminStatCard
                icon={LayoutGrid}
                title="Total Categories"
                value={stats?.categories || 0}
                subTitle="Categorie"
              />
            </>
          )}
        </div>
        {/* Popular Courses */}
        <div className="lg:col-span-1 sm:max-h-[387px] xl:min-h-[450px]">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-5 h-full w-full animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-full mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-16 h-12 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <PopularCoursesCard courses={popularCourses || []} />
          )}
        </div>
      </div>
      {/* Bottom section - Performance chart and Popular courses */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-5 h-64 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6 mb-6"></div>
              <div className="flex-1 h-40 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <PerformanceChart data={performanceData || []} />
          )}
        </div>
        {/* Active Now Section */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-5 h-full animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ) : (
            <ActiveNowCard
              activeInterns={stats?.activeInterns || 0}
              activeInstructors={stats?.activeInstructors || 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}