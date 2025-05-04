"use client"
import Sidebar from "@/components/layout/SideBar";
import NavBar from "@/components/layout/NavBar";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
export default function InternPanelLayout({
  children  
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const username = (useAuthStore.getState() as {user:{full_name:string}})?.user?.full_name || "User";
  const getTitle = () => {
    if (pathname.includes("/my-learning")) return {name:"my learning",show:false};
    if (pathname.includes("/wishlist")) return {name:"wishlist",show:false};
    if (pathname.includes("/profile")) return {name: "my profile", show:false};
    if (pathname.includes("/course") && !pathname.includes("/learn")) return {name:"About Course",show:true};
    if (pathname.includes("/dashboard")) return {name:"Dashboard",show:false};
    if (pathname.includes("/home")) return {name:"HomePage",show:true};
    return {name:"learn",show:false};
  };
  return (
    <div className="flex h-screen">
      <aside className="h-full">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col bg-teal-50 overflow-x-hidden">
        <div className="mx-auto w-[95%] sm:w-[90%] md:w-[85%] lg:w-[90%] my-4 sm:my-6 md:my-9">
          <NavBar pageTitle={getTitle().name} canBeShowed={getTitle().show} canHide={getTitle().name !== "learn"} userName={username} />
          <main className="py-2 sm:py-3 md:py-4 flex-1 overflow-y-auto -mt-4 sm:-mt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
