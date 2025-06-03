"use client";
import Sidebar from "@/components/layout/SideBar";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex h-screen">
      <aside className="h-full">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col bg-teal-50 overflow-x-hidden">
        <div className="mx-auto w-[95%] sm:w-[90%] md:w-[85%] lg:w-[90%] my-4 sm:my-6 md:my-9">
          <main className="py-2 sm:py-3 md:py-4 flex-1 overflow-y-auto -mt-4 sm:-mt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
