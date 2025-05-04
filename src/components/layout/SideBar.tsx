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
} from "react-icons/fi";
import { useLogout } from "@/lib/hooks/auth/useLogout";

const navLinks = [
  { href: "/intern/home", label: "Homepage", icon: FiHome },
  { href: "/intern/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/intern/my-learning", label: "My learning", icon: FiBook },
  { href: "/intern/profile", label: "Profile", icon: FiUser },
  { href: "/intern/wishlist", label: "My Wishlist", icon: FiHeart },
  { href: "/intern/settings", label: "Setting", icon: FiSettings },
];

export default function Sidebar() {
 
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { mutate: logout, isPending } = useLogout();

  const activeClasses = "bg-[#E4F4F9] text-[#136A86] ";
  const inactiveClasses = "text-[#E4F4F9] active:bg-[#E4F4F9] active:text-[#136A86] active:bg-opacity-10 hover:bg-[#5CB5BD] hover:text-white";

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
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static
          md:w-16 md:overflow-hidden md:hover:w-[296px]`}
      >
        {/* Logo */}
        <Link href={"/intern/home"} className="px-4 py-6 md:mt-[50px] h-[38px] flex-shrink-0">
          <Image
            src="/SideBar_logo.svg"
            alt="FORGE logo"
            width={154}
            height={38}
            className="opacity-0 md:group-hover:opacity-100 w-[154px] h-auto transition-opacity duration-200"
            priority
          />
        </Link>
        {/* </div> */}

        {/* Nav Links */}
        <div className="flex flex-col flex-1">
          <div className="mt-[60px]">
            {navLinks.slice(0, 3).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center transition-all duration-200 ${
                  pathname === href ? activeClasses : inactiveClasses
                } px-4 py-2 md:px-0 ${
                  isOpen
                    ? "justify-start gap-3"
                    : "md:justify-center gap-0 md:group-hover:px-4 md:group-hover:justify-start md:group-hover:gap-3"
                } rounded-md mt-3 cursor-pointer`}
              >
                <Icon className="h-5 w-5" />
                <span
                  className={`${
                    isOpen
                      ? "inline-block ml-2"
                      : "hidden"
                  } md:group-hover:inline-block ml-2 transition-opacity duration-200`}
                >
                  {label}
                </span>
              </Link>
            ))}

            <h2 className={`${isOpen ? "block" : "hidden"} mt-10 mb-2 text-sm font-semibold text-[#5CB5BD] uppercase md:group-hover:block transition-opacity duration-200`}>My Account</h2>

            {navLinks.slice(3, 5).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center transition-all duration-200 ${
                  pathname === href ? activeClasses : inactiveClasses
                } px-4 py-2 md:px-0 ${
                  isOpen
                    ? "justify-start gap-3"
                    : "md:justify-center gap-0 md:group-hover:px-4 md:group-hover:justify-start md:group-hover:gap-3"
                } rounded-md mt-3 cursor-pointer`}
              >
                <Icon className="h-5 w-5" />
                <span
                  className={`${
                    isOpen
                      ? "inline-block ml-2"
                      : "hidden"
                  } md:group-hover:inline-block ml-2 transition-opacity duration-200`}
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-auto mb-6">
            <h2 className={`${isOpen ? "block" : "hidden"} mb-2 text-sm font-semibold text-[#5CB5BD] uppercase md:group-hover:block transition-opacity duration-200`}>System</h2>

            {navLinks.slice(5).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center transition-all duration-200 ${
                  pathname === href ? activeClasses : inactiveClasses
                } px-4 py-2 md:px-0 ${
                  isOpen
                    ? "justify-start gap-3"
                    : "md:justify-center gap-0 md:group-hover:px-4 md:group-hover:justify-start md:group-hover:gap-3"
                } rounded-md mt-3 cursor-pointer`}
              >
                <Icon className="h-5 w-5" />
                <span
                  className={`${
                    isOpen
                      ? "inline-block ml-2"
                      : "hidden"
                  } md:group-hover:inline-block ml-2 transition-opacity duration-200`}
                >
                  {label}
                </span>
              </Link>
            ))}
            <button
              onClick={() => logout()}
              disabled={isPending}
              type="button"
              className={`flex items-center transition-all duration-200 ${
                inactiveClasses
              } px-4 py-2 w-full text-left md:px-0 ${
                isOpen
                  ? "justify-start gap-3"
                  : "md:justify-center gap-0 md:group-hover:px-4 md:group-hover:justify-start md:group-hover:gap-3"
              } rounded-md mt-3 cursor-pointer`}
            >
              <FiLogOut className="h-5 w-5" />
              <span
                className={`${
                  isOpen
                    ? "inline-block ml-2"
                    : "hidden"
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
