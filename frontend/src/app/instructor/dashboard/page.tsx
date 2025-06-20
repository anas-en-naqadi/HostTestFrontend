'use client';

import AdminStatCard from '@/components/ui/AdminStatCard';
import PopularCoursesCard from '@/components/ui/PopularCoursesCard';
import PerformanceChart from '@/components/ui/PerformanceChart';
import StatCard from '@/components/ui/InstructorStateCard';
import { Book, UserCheck, Users, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useInstructorDashboard } from '@/lib/hooks/dashboard/useInstructorDashboard';
import { formatDate } from '@/utils/formatDate';

export default function DashBoard() {
  const { user } = useAuthStore();
  const userFullName = user?.full_name || '';

  const {
    stats,
    performance,
    popularCourses,
    isLoading,
    error,
  } = useInstructorDashboard();

  if (error)
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error.message}
      </div>
    );

  return (
    <div className="flex flex-col gap-6 h-full w-full p-4 sm:p-0 sm:pt-10 font-sans">
      {/* Header */}
      <div className="mb-2 flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-medium text-[#333]">
            Welcome back,{' '}
            <span className="font-bold">{userFullName}</span>
          </h1>
          <p className="text-sm text-[#5CB5BD] mt-1">
            Your last login was:{' '}
            {formatDate(user?.last_login ?? null)}
          </p>
        </div>
      </div>

      {/* Top Stats & Popular Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:max-h-[387px] xl:min-h-[450px]">
          <AdminStatCard
            icon={Book}
            title="Total Courses"
            value={stats?.totalCourses ?? 0}
            subTitle="Courses"
          />
          <AdminStatCard
            icon={UserCheck}
            title="Total Trainers"
            value={stats?.totalStudents ?? 0}
            subTitle="Trainers"
          />
          <AdminStatCard
            icon={CheckCircle2}
            title="Total Completions"
            value={stats?.totalCompletions ?? 0}
            subTitle="Completions"
          />
          <AdminStatCard
            icon={Users}
            title="Active Interns"
            value={stats?.activeInterns ?? 0}
            subTitle="Interns"
          />
        </div>

        {/* Popular Courses */}
        <div className="lg:col-span-1 sm:max-h-[387px] xl:min-h-[450px]">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-5 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-16 h-12 bg-gray-200 rounded" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            popularCourses && (
              <PopularCoursesCard courses={popularCourses} />
            )
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Enrollment + Completion Today */}
        <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:max-h-[387px] 2xl:min-h-[520px]">
          <StatCard
            title="Today's Enrollments"
            value={stats?.newEnrollments ?? 0}
            label="Enrollments"
            isForEnrollment
            color="#1B7F9E"
            bgColor="#EAF6FA"
          />
          <StatCard
            title="Today's Completions"
            value={stats?.newCompletions ?? 0}
            label="Completions"
            isForEnrollment={false}
            color="#1B7F9E"
            bgColor="#EAF6FA"
          />
        </div>

        {/* Performance Chart */}
        <div className="lg:col-span-3">
          {performance ? (
            <PerformanceChart data={performance} />
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-5 h-64 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/6 mb-6" />
              <div className="h-40 bg-gray-200 rounded" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
