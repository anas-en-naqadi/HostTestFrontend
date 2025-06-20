"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Plus, Search } from "lucide-react";
import Avatar from "react-avatar";
import { useAuthStore } from "@/store/authStore";
import Notifications from "./Notifications";
import { NotificationItem } from "@/types/notification.types";
import { fetchNotifications } from "@/lib/api/notifications";
import Link from "next/link";
import { useSearchContext } from "@/contexts/SearchContext";

interface AdminPageHeaderProps {
  title: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  addButtonText?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showDivider?: boolean;
}

export default function AdminPageHeader({
  title,
  showAddButton = false,
  onAddClick,
  addButtonText = "Add",
  searchPlaceholder = "Search here",
  onSearch,
  showDivider = true,
}: AdminPageHeaderProps) {
  const [searchInput, setSearchInput] = useState<string>("");
  const [unreadCounts, setUnreadCounts] = useState<number>(2);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [isNotificationBoxOpen, setIsNotificationBoxOpen] = useState(false);
  const notificationBtnRef = useRef<HTMLButtonElement>(null);
  const notificationBoxRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  // Handle notification toggle
  const handleNotificationToggle = () => {
    setIsNotificationBoxOpen((prev) => !prev);
  };
  useEffect(() => {
    fetchNotifications().then((res) => {
      if (res && res) {
        setNotifications(res.notifications);
        setUnreadCounts(res.unreadCount);
      }
    });
  }, []);
  // Close notification box when clicking outside
  useEffect(() => {
    if (!isNotificationBoxOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both the notification box AND button
      if (
        event.target instanceof Node &&
        notificationBtnRef.current &&
        !notificationBtnRef.current.contains(event.target) &&
        notificationBoxRef.current &&
        !notificationBoxRef.current.contains(event.target)
      ) {
        setIsNotificationBoxOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationBoxOpen]);

  const handleNotificationsClear = () => {
    setNotifications([]);
    setUnreadCounts(0);
  };

  // Handle marking notifications as read
  const handleNotificationsRead = () => {
    setUnreadCounts(0);
  };
  // Access the global search context
  const { globalSearchQuery, setGlobalSearchQuery } = useSearchContext();

  // Update local search input when global search context changes
  useEffect(() => {
    setSearchInput(globalSearchQuery);
  }, [globalSearchQuery]);

  // Handle search input change - automatically trigger search as user types
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    // Update the global search context to sync with all tables
    setGlobalSearchQuery(value);

    // Also call the onSearch prop for backward compatibility
    onSearch?.(value);
  };

  // Keep the Enter key functionality for backward compatibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch?.(searchInput);
    }
  };

  return (
    <>
      <header className="flex lg:flex-row flex-col my-10 justify-between gap-8 md:gap-14 items-center w-full flex-wrap lg:flex-nowrap">
        <div className="max-w-fit w-full">
          <h1 className="uppercase font-semibold font-lora text-[#136A86] text-xl md:text-2xl 2xl:text-3xl">
            {title}
          </h1>
        </div>

        <div className="w-full lg:flex-row flex-col flex items-center justify-center gap-6 md:gap-14">
          <div className="flex gap-4 md:gap-8 w-full px-4 lg:px-0 items-center justify-center relative flex-wrap lg:flex-nowrap">
            {/* Search Input */}
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchInput}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 h-12 rounded-md bg-[#F6F8FC] text-[#8C8FA5] focus:outline-none"
              />
            </div>

            {/* Add Button (Optional) */}
            {showAddButton && (
              <button
                onClick={onAddClick}
                className="text-[#8C8FA5] font-sans lg:w-[160px] w-full cursor-pointer h-12 flex font-normal text-base rounded-[12px] p-3 items-center justify-center gap-2 hover:bg-[#5CB5BD33] hover:text-[#136A86] whitespace-nowrap"
              >
                <Plus size={20} className="flex-shrink-0" />
                <span className="truncate">{addButtonText}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Notification Bell */}
            <div className="relative">
              <button
                ref={notificationBtnRef}
                onClick={handleNotificationToggle}
                type="button"
                title="show notification"
                className="text-[#8C8FA5] relative cursor-pointer mr-3.5 hover:bg-[#5CB5BD33] hover:text-[#136A86] w-[3.5rem] h-[3rem] flex justify-center items-center rounded-xl"
              >
                <Bell size={25} />
                {unreadCounts > 0 && (
                  <span className="w-[6px] h-[6px] absolute top-[10px] right-5 rounded-full bg-red-600"></span>
                )}
              </button>
              {isNotificationBoxOpen && (
                <div ref={notificationBoxRef}>
                  <Notifications
                    onNotificationsCleared={handleNotificationsClear}
                    onNotificationsRead={handleNotificationsRead}
                    notifications={notifications}
                  />
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div>
              <Link href={"/intern/profile"} passHref>
                <Avatar
                  name={user?.full_name}
                  round
                  size="48"
                  className="font-lora cursor-pointer font-semibold"
                  textSizeRatio={2.5}
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {showDivider && <hr className="text-cyan-700 w-full mb-6" />}
    </>
  );
}
