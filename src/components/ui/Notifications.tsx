"use client";
import { RotateCcw } from "lucide-react";
import Image from "next/image";
import { timeAgo } from "@/utils/formatTimeAgo";
import Link from "next/link";
import { NotificationItem } from "@/types/notification.types";
import DOMPurify from "isomorphic-dompurify";
import parse from "html-react-parser";
import {
  readAllNotifications,
  removeAllNotifications,
} from "@/lib/api/notifications";
import { useEffect, useState } from "react";
import Spinner from "../common/spinner";

export default function Notifications({
  notifications,
  onNotificationsCleared,
  onNotificationsRead,
}: {
  notifications: NotificationItem[];
  onNotificationsCleared: () => void;
  onNotificationsRead: () => void;
}) {
  const [fetchedNotifications, setFetchedNotifications] = useState<
    NotificationItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set notifications immediately to avoid showing "No notifications yet" message
    setFetchedNotifications(notifications);
    setIsLoading(false);

    // Mark notifications as read when the component mounts (box is opened)
    const markNotificationsAsRead = async () => {
      if (notifications.length > 0) {
        try {
          await readAllNotifications();
          // Call the callback to update parent state
          onNotificationsRead();
        } catch (error) {
          console.error("Error marking notifications as read:", error);
        }
      }
    };

    markNotificationsAsRead();
  }, [notifications, onNotificationsRead]);

  const clearNotifications = async () => {
    setIsLoading(true);
    await removeAllNotifications()
      .then((status) => {
        if (status === 200) {
          setFetchedNotifications([]);
          // Call the callback to update parent state
          onNotificationsCleared();
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div
      className={`
        bg-[#E4F4F9] z-50 
        w-[90vw] sm:w-[400px] md:w-[450px] lg:w-[473px] 
        max-h-[90vh] sm:max-h-[490px] 
        shadow-md rounded-md 
        px-3 sm:px-6 
        py-8 sm:py-10 
        absolute top-15 
        right-0 sm:-right-5 md:-right-9 lg:-right-13 
        ${notifications.length > 4 ? "overflow-y-scroll" : "overflow-hidden"}
      `}
    >
      {/* Triangle pointer - fixed position */}
      <div
        className="
            absolute -top-2 
            right-8 sm:right-12 md:right-16 lg:right-20
            w-0 h-0 
            border-l-[10px] border-l-transparent
            border-r-[10px] border-r-transparent
            border-b-[10px] border-b-[#E4F4F9]
            z-10
          "
      />

      <div className="flex justify-between flex-1 w-full items-center mt-2">
        <h1 className="font-bold text-xl sm:text-2xl">Notifications</h1>
        {fetchedNotifications.length > 0 && (
          <button
            onClick={clearNotifications}
            type="button"
            className="flex cursor-pointer items-center gap-1 bg-[#136A86] rounded-lg -mr-1 sm:-mr-3 h-[26px] text-white text-xs font-medium p-2"
          >
            <RotateCcw size={10} />
            Clear Notifications
          </button>
        )}
      </div>
      {/* notifications container */}
      {isLoading ? (
        <Spinner />
      ) : fetchedNotifications.length > 0 ? (
        <div className="flex flex-col mt-5">
          {fetchedNotifications.map((n, index) => (
            <div key={index}>
              <Link
                href={
                  n.type.toLowerCase() === "announcement"
                    ? `/intern/course/${n.metadata.slug}/learn`
                    : n.type.toLocaleLowerCase() === "intern_registration"
                    ? ``
                    : `/intern/course/${n.metadata.slug}`
                }
                className="flex justify-between items-center gap-2 sm:gap-4 cursor-pointer"
              >
                {n.metadata.thumbnail_url && (
                  <Image
                    src={n.metadata.thumbnail_url}
                    width={43}
                    height={48}
                    alt="Notification thumbnail"
                    className="h-[45px] w-[35px] sm:h-[55px] sm:w-[43px] object-cover rounded"
                  />
                )}
                <div className="flex flex-col w-full">
                  <h1 className="font-bold text-sm sm:text-base text-[#136A86]">
                    {n.title}
                  </h1>
                  <span className="font-medium text-xs flex-1 text-left">
                    {parse(DOMPurify.sanitize(n.content!))}
                  </span>
                </div>
                <span className="text-xs text-[#8C8FA5] whitespace-nowrap font-normal">
                  {timeAgo(n.created_at)}
                </span>
              </Link>
              {index !== fetchedNotifications.length - 1 && (
                <hr className="my-3 text-[#136A86] rounded-[0.5px]" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center gap-4 sm:gap-6 w-full sm:w-[266px] mt-8 my-3 mx-auto">
          <h1 className="text-[#136A86] text-base sm:text-lg font-bold">
            No Notifications Yet
          </h1>
          <Image
            src="/notifications.svg"
            alt="no-notifications"
            width={150}
            height={100}
            className="w-[130px] h-[90px] sm:w-[176px] sm:h-[120px]"
          />
          <p className="font-medium text-xs text-center px-4 sm:px-0">
            You have no notifications right now ! We'll notify you when there is
            something new.
          </p>
        </div>
      )}
    </div>
  );
}
