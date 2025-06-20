"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiGrid,
  FiBook,
  FiUser,
  FiHeart,
  FiSettings,
  FiLogOut,
  FiUsers,
  FiBookOpen,
  FiBarChart2,
  FiActivity,
  FiLock,
} from "react-icons/fi";
import { Languages, Shapes, Bell, Trophy } from "lucide-react";
import { useLogout } from "@/lib/hooks/auth/useLogout";
import { useAuthStore } from "@/store/authStore";

// Define a type for the navigation links
interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  section: "main" | "account" | "system";
}



export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { mutate: logout, isPending } = useLogout();
  const { user } = useAuthStore();
  const userRole = user?.role?.toLowerCase() || "intern";

  // Base links for interns
  const baseInternLinks: NavLink[] = [
    { href: "/intern/home", label: "Homepage", icon: FiHome, section: "main" },
    {
      href: "/intern/dashboard",
      label: `${userRole !== "intern" ? "Intern" : ""} Dashboard`,
      icon: FiGrid,
      section: "main",
    },
    {
      href: "/intern/my-learning",
      label: "My learning",
      icon: FiBook,
      section: "main",
    },
    {
      href: "/intern/profile",
      label: "Profile",
      icon: FiUser,
      section: "account",
    },
    {
      href: "/intern/certificates",
      label: "Certificates",
      icon: Trophy,
      section: "account",
    },
    {
      href: "/intern/wishlist",
      label: "My Wishlist",
      icon: FiHeart,
      section: "account",
    },
  ];

  // Additional links for instructors
  const instructorAdditionalLinks: NavLink[] = [
    {
      href: "/instructor/dashboard",
      label: `${userRole === "admin" ? "Instructor" : ""} Dashboard`,
      icon: FiBarChart2,
      section: "main",
    },
    {
      href: "/instructor/courses",
      label: "Courses",
      icon: FiBookOpen,
      section: "main",
    },
    {
      href: "/instructor/categories",
      label: "Categories",
      icon: Shapes,
      section: "main",
    },
    {
      href: "/instructor/announcements",
      label: "Announcements",
      icon: Bell,
      section: "main",
    },
    {
      href: "/instructor/quiz",
      label: "Quiz",
      icon: Languages,
      section: "main",
    },
  ];

  // Additional links for admins
  const adminAdditionalLinks: NavLink[] = [
    {
      href: "/admin/dashboard",
      label: `${userRole === "admin" ? "" : "Admin"} Dashboard`,
      icon: FiBarChart2,
      section: "main",
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: FiUsers,
      section: "main",
    },
    {
      href: "/admin/activity-logs",
      label: "Activity Logs",
      icon: FiActivity,
      section: "main",
    },
    {
      href: "/admin/roles",
      label: "Roles",
      icon: FiLock,
      section: "main",
    },
  ];


  const activeClasses = "bg-[#E4F4F9] text-[#136A86] ";
  const inactiveClasses =
    "text-[#E4F4F9] active:bg-[#E4F4F9] active:text-[#136A86] active:bg-opacity-10 hover:bg-[#5CB5BD] hover:text-white";



  // Determine which links to show based on user role
  let navLinks: NavLink[] = [...baseInternLinks];

  if (userRole === "instructor") {
    navLinks = [...baseInternLinks, ...instructorAdditionalLinks];
  } else if (userRole === "admin") {
    navLinks = [...baseInternLinks, ...instructorAdditionalLinks, ...adminAdditionalLinks];
  }



  // Filter links by section
  const firstGroupLinks = navLinks.filter((link) => link.section === "main");
  const accountLinks = navLinks.filter((link) => link.section === "account");
  const systemLinks = navLinks.filter((link) => link.section === "system");

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-[#136A86] p-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`group fixed top-0 left-0 h-screen bg-[#136A86] text-white flex flex-col p-4 transition-all ease-in-out duration-300 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:static
          md:w-16 md:overflow-hidden md:hover:w-[296px]`}
      >
        {/* Logo */}
        <Link
          href={"/intern/home"}
          className="px-4 py-6 md:mt-[50px] h-[38px] flex-shrink-0"
        >
          <Image
            src="/SideBar_logo.svg"
            alt={`${process.env.PLATFORM_NAME || "Forge"} logo`}
            width={154}
            height={38}
            className="opacity-0 md:group-hover:opacity-100 w-[154px] h-auto transition-opacity duration-200"
            priority
          />
        </Link>

        {/* Nav Links */}
        <div className="flex flex-col flex-1 group-hover:overflow-y-scroll">
          <div className="mt-[60px]">
            {/* First group links */}
            {firstGroupLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center transition-all duration-200 ${pathname === href ? activeClasses : inactiveClasses
                  } px-4 py-2 md:px-0 ${isOpen
                    ? "justify-start gap-3"
                    : "md:justify-center gap-0 md:group-hover:px-4 md:group-hover:justify-start md:group-hover:gap-3"
                  } rounded-md mt-3 cursor-pointer`}
              >
                <Icon className="h-5 w-5" />
                <span
                  className={`${isOpen ? "inline-block ml-2" : "hidden"
                    } md:group-hover:inline-block ml-2 transition-opacity duration-200`}
                >
                  {label}
                </span>
              </Link>
            ))}

            {/* My Account section */}
            {accountLinks.length > 0 && (
              <>
                <h2
                  className={`${isOpen ? "block" : "hidden"
                    } mt-10 mb-2 text-sm font-semibold text-[#5CB5BD] uppercase md:group-hover:block transition-opacity duration-200`}
                >
                  My Account
                </h2>

                {accountLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center transition-all duration-200 ${pathname === href ? activeClasses : inactiveClasses
                      } px-4 py-2 md:px-0 ${isOpen
                        ? "justify-start gap-3"
                        : "md:justify-center gap-0 md:group-hover:px-4 md:group-hover:justify-start md:group-hover:gap-3"
                      } rounded-md mt-3 cursor-pointer`}
                  >
                    <Icon className="h-5 w-5" />
                    <span
                      className={`${isOpen ? "inline-block ml-2" : "hidden"
                        } md:group-hover:inline-block ml-2 transition-opacity duration-200`}
                    >
                      {label}
                    </span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* System section */}
          <div className="mt-auto mb-6">
            <h2
              className={`${isOpen ? "block" : "hidden"
                } mb-2 text-sm font-semibold text-[#5CB5BD] uppercase md:group-hover:block transition-opacity duration-200`}
            >
              System
            </h2>

            {/* Settings link */}
            {systemLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center transition-all duration-200 ${pathname === href ? activeClasses : inactiveClasses
                  } px-4 py-2 md:px-0 ${isOpen
                    ? "justify-start gap-3"
                    : "md:justify-center gap-0 md:group-hover:px-4 md:group-hover:justify-start md:group-hover:gap-3"
                  } rounded-md mt-3 cursor-pointer`}
              >
                <Icon className="h-5 w-5" />
                <span
                  className={`${isOpen ? "inline-block ml-2" : "hidden"
                    } md:group-hover:inline-block ml-2 transition-opacity duration-200`}
                >
                  {label}
                </span>
              </Link>
            ))}

            {/* Logout button */}
            <button
              onClick={() => logout()}
              disabled={isPending}
              type="button"
              className={`flex items-center transition-all duration-200 ${inactiveClasses} px-4 py-2 w-full text-left md:px-0 ${isOpen
                  ? "justify-start gap-3"
                  : "md:justify-center gap-0 md:group-hover:px-4 md:group-hover:justify-start md:group-hover:gap-3"
                } rounded-md mt-3 cursor-pointer`}
            >
              <FiLogOut className="h-5 w-5" />
              <span
                className={`${isOpen ? "inline-block ml-2" : "hidden"
                  } md:group-hover:inline-block ml-2 transition-opacity duration-200`}
              >
                {isPending ? "Logging out..." : "Logout account"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}