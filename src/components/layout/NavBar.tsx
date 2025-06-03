"use client";

import {
  ListFilter,
  Search,
  RotateCcw,
  Heart,
  Bell,
  Check,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Avatar from "react-avatar";
import { useFetchCoursesWithQuery } from "@/lib/hooks/useCourses";
import Spinner from "../common/spinner";
import { navigate } from "@/lib/utils/navigator";
import { useFetchFilters } from "@/lib/hooks/useFilters";
import Notifications from "../ui/Notifications";
import { fetchNotifications } from "@/lib/api/notifications";
import { NotificationItem } from "@/types/notification.types";

type TopBarProps = {
  userName: string;
  pageTitle: string;
  canBeShowed: boolean;
  canHide?: boolean;
};

type courseDropDown = {
  title: string;
  instructors: { users: { full_name: string } };
  thumbnail_url: string;
  slug: string;
};
export default function NavBar({
  userName,
  pageTitle,
  canBeShowed,
  canHide = true,
}: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isFilterOpened, setIsFilteredOpened] = useState(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [courses, setCourses] = useState<courseDropDown[]>();
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    duration: new Set<string>(),
    topic: new Set<string>(),
    level: new Set<string>(),
  });
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [showResults, setShowResults] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const { data: filterOptions, isLoading } = useFetchFilters();
  const searchParams = useSearchParams();
  const { mutateAsync: getAllCourses, isPending } = useFetchCoursesWithQuery(); // 3️⃣ Wishlist mutations
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<number>(0);
  const [isNotificationBoxOpen, setIsNotificationBoxOpen] = useState(false);
  const notificationBtnRef = useRef<HTMLButtonElement>(null);
  const notificationBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications().then((res) => {
      if (res && res) {
        setNotifications(res.notifications);
        setUnreadCounts(res.unreadCount);
      }
    });
  }, []);

  // Handle notification clearing
  const handleNotificationsClear = () => {
    setNotifications([]);
    setUnreadCounts(0);
  };

  // Handle marking notifications as read
  const handleNotificationsRead = () => {
    setUnreadCounts(0);
  };
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
  const handleNotificationToggle = () => {
    setIsNotificationBoxOpen((prev) => !prev);
  };
  useEffect(() => {
    const init = {
      duration: new Set<string>(searchParams.getAll("durations")),
      topic: new Set<string>(searchParams.getAll("topics")),
      level: new Set<string>(searchParams.getAll("levels")),
    };
    setSelectedFilters(init);
  }, [searchParams]);
  useEffect(() => {
    if (!pathname.includes("/course") && !pathname.includes("/home"))
      setSearchInput("");
  }, [pathname]);
  // Debounce search input
  useEffect(() => {
    if (!searchInput) return;
    const timer = setTimeout(() => {
      getAllCourses({ page: 1, pageSize: 6, search: searchInput }).then((res) =>
        setCourses(res.courses)
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, getAllCourses]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setShowResults(true);
    setIsFilteredOpened(false);
  };

  // Handle clicks outside the search results to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('input[type="text"]')
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    // Only listen while the dropdown is open
    if (!isFilterOpened) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // If click is inside dropdown or on the button, do nothing
      if (
        filterDropdownRef.current?.contains(target) ||
        filterButtonRef.current?.contains(target)
      )
        return;

      // Otherwise close
      setIsFilteredOpened(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpened]);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setShowResults(false);
      if (searchInput.length > 0) {
        navigate(`/intern/home`, { query: searchInput });
      }
    }
  };
  const applyFilter = () => {
    // Create URLSearchParams object to build the query string
    const params = new URLSearchParams();

    // Add selected duration filters
    if (selectedFilters.duration.size > 0) {
      selectedFilters.duration.forEach((d) => params.append("durations", d));
    }

    // Add selected topic filters
    if (selectedFilters.topic.size > 0) {
      selectedFilters.topic.forEach((t) => params.append("topics", t));
    }

    // Add selected level filters
    if (selectedFilters.level.size > 0) {
      selectedFilters.level.forEach((l) => params.append("levels", l));
    }

    // Add search query if present
    if (searchInput) {
      params.append("query", searchInput);
    }

    const queryString = params.toString();
    const targetPath = "/intern/home" + (queryString ? `?${queryString}` : "");

    // Use router.replace for proper Next.js navigation
    if (pathname.startsWith("/intern/home")) {
      window.history.replaceState({}, "", targetPath);
    } else {
      router.push(targetPath);
    }

    // Close the filter dropdown
    setIsFilteredOpened(false);

    // Set filtering state to false after redirection
    setIsFiltering(false);
  };

  const handleFilterChange = (
    type: "duration" | "topic" | "level",
    value: string
  ) => {
    // Update the selected filters immediately without triggering redirection
    setSelectedFilters((prev) => {
      const next = { ...prev };
      const setForType = new Set(prev[type]);

      if (setForType.has(value)) {
        setForType.delete(value);
      } else {
        setForType.add(value);
      }

      next[type] = setForType;
      return next;
    });
  };

  const resetFilters = () => {
    setIsFilteredOpened(false);
    // 1️⃣ Clear all selected filters in state
    setSelectedFilters({
      duration: new Set<string>(),
      topic: new Set<string>(),
      level: new Set<string>(),
    });

    // 2️⃣ Grab the existing URL params
    const params = new URLSearchParams(window.location.search);

    // 3️⃣ Remove only the filter‐related keys
    ["durations", "topics", "levels"].forEach((key) => {
      params.delete(key);
    });

    // 4️⃣ Rebuild the URL, preserving any other params
    const newSearch = params.toString(); // e.g. "query=foo&page=2"
    const newUrl = pathname + (newSearch ? `?${newSearch}` : "");

    // 5️⃣ Swap the URL without adding a history entry
    window.history.replaceState(null, "", newUrl);
  };

  return (
    <>
      {canHide && (
        <>
          <style>{`
          .styled-checkbox {
            position: absolute;
            opacity: 0;
          }
  
          .styled-checkbox + label {
            position: relative;
            cursor: pointer;
            padding: 0;
          }
  
          .styled-checkbox + label:before {
            content: '';
            margin-right: 10px;
            display: inline-block;
            vertical-align: text-top;
            width: 16px; /* Reduced size to match image */
            height: 16px; /* Reduced size to match image */
            background: white;
            border: 2px solid #49454F; /* Lighter gray border */
            border-radius: 2px;
            margin-top:3px;
          }
  
          .styled-checkbox:focus + label:before {
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.12);
          }
  
          .styled-checkbox:checked + label:before {
            background: #136A86; /* Matches the blue in the image */
            border-color: #136A86; /* Ensure border matches background */
          }
  
          .styled-checkbox:checked + label:after {
            content: '';
            position: absolute;
            left: 4px; /* Adjusted for smaller checkbox */
            top: 7px; /* Adjusted for smaller checkbox */
            background: white;
            width: 2px;
            margin-top:4px;
            height: 2px;
            box-shadow:
              2px 0 0 white,
              4px 0 0 white,
              4px -2px 0 white,
              4px -4px 0 white,
              4px -6px 0 white; /* Shortened checkmark to fit smaller box */
            transform: rotate(45deg);
          }
        `}</style>
          <header className="flex lg:flex-row flex-col my-10 justify-between gap-8 md:gap-14 items-center w-full flex-wrap lg:flex-nowrap">
            <div className="max-w-fit w-full">
              {pathname.includes("/home") ? (
                <Link
                  href={`/intern/home`}
                  onClick={() => setSearchInput("")}
                  className="uppercase font-semibold font-lora text-cyan-700 text-xl md:text-2xl 3xl:text-3xl"
                >
                  {pageTitle}
                </Link>
              ) : (
                <h1 className="uppercase font-semibold font-lora text-cyan-700 text-xl md:text-2xl 3xl:text-3xl">
                  {pageTitle}
                </h1>
              )}
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
                    placeholder="Search course here"
                    value={searchInput}
                    onKeyDown={handleKeyDown}
                    onChange={handleSearchChange}
                    onFocus={() => setShowResults(true)}
                    className="w-full pl-10 pr-4 py-2 h-12 rounded-md bg-[#F6F8FC] text-[#8C8FA5] focus:outline-none"
                  />
                </div>

                {/* Filter/Menu Icon */}
                <button
                  onClick={() => setIsFilteredOpened(!isFilterOpened)}
                  type="button"
                  ref={filterButtonRef}
                  className="text-[#8C8FA5] font-sans focus:bg-[#5CB5BD33] focus:text-[#136A86] lg:w-[101px] w-full cursor-pointer h-[3.2rem] flex bg-[#F6F8FC] font-normal text-md rounded-md p-3 items-center justify-center gap-2"
                >
                  <ListFilter size={20} /> Filter
                </button>

                {/* Search Results Dropdown */}
                {showResults && searchInput && (
                  <div
                    ref={searchResultsRef}
                    className="absolute top-14 z-50 bg-white lg:w-full rounded-md w-[94%] max-h-fit overflow-y-auto font-sans shadow-md"
                  >
                    {isPending ? (
                      <div className="flex justify-center items-center p-4">
                        <Spinner />
                      </div>
                    ) : courses && courses.length > 0 ? (
                      courses.map((course, index) => (
                        <Link
                          href={`/intern/course/${course.slug}`}
                          key={index}
                          className="flex gap-5 w-full items-center cursor-pointer hover:bg-gray-100 px-5 py-4"
                          onClick={() => {
                            setShowResults(false);
                            setSearchInput(course.title);
                          }}
                        >
                          <Image
                            src={course.thumbnail_url || "/image.jpg"}
                            alt={course.title}
                            width={80}
                            height={100}
                            priority
                            className="object-contain"
                          />
                          <div>
                            <h1 className="font-bold text-black/80">
                              {course.title}
                            </h1>
                            <span className="flex gap-2 items-center text-gray-500 font-semibold text-xs">
                              Created by{" "}
                              <span className="text-gray-600 text-sm font-semibold">
                                {course.user.full_name || "Unknown"}
                              </span>
                            </span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No courses found for {'"'}
                        {searchInput}
                        {'"'}
                      </div>
                    )}
                  </div>
                )}

                {/* Filter Dropdown */}
                {isFilterOpened && (
                  <div
                    id="dropdown"
                    ref={filterDropdownRef}
                    className={`
                      absolute top-14 z-50 bg-white rounded-md w-[94%] mx-8 px-5 pt-14 py-10
                      max-h-96 overflow-y-auto shadow-md
                  
                      transform transition-all duration-200 origin-top
                      ${
                        isFilterOpened
                          ? "scale-y-100 opacity-100"
                          : "scale-y-0 opacity-0 pointer-events-none"
                      }
                    `}
                  >
                    {isLoading ? (
                      <Spinner />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
                        {/* Duration Column */}
                        <div>
                          <h3 className="text-lg font-medium text-[#5CB5BD] mb-4">
                            Video Duration
                          </h3>
                          {filterOptions?.["Video Duration"].map((option) => (
                            <div
                              key={`duration-${option}`}
                              className="flex items-center mb-2"
                            >
                              <input
                                type="checkbox"
                                id={`duration-${option}`}
                                disabled={isFiltering}
                                checked={selectedFilters.duration.has(option)}
                                onChange={() =>
                                  handleFilterChange("duration", option)
                                }
                                className={`h-4 w-4 text-teal-600/75 rounded border-[#49454F] styled-checkbox
    `}
                              />
                              <label
                                htmlFor={`duration-${option}`}
                                className="text-[#5F6368]"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>

                        {/* Topic Column */}
                        <div>
                          <h3 className="text-lg font-medium text-[#5CB5BD] mb-4">
                            Topic
                          </h3>
                          {filterOptions?.topic.map((option) => (
                            <div
                              key={`topic-${option}`}
                              className="flex items-center mb-2"
                            >
                              <input
                                type="checkbox"
                                id={`topic-${option}`}
                                disabled={isFiltering}
                                checked={selectedFilters.topic.has(option)}
                                onChange={() =>
                                  handleFilterChange("topic", option)
                                }
                                className={`h-4 w-4 text-teal-600/75 rounded border-gray-300 styled-checkbox`}
                              />
                              <label
                                htmlFor={`topic-${option}`}
                                className="text-[#5F6368] capitalize"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>

                        {/* Level Column */}
                        <div className="flex flex-col">
                          <h3 className="text-lg font-medium text-[#5CB5BD] mb-4">
                            Level
                          </h3>
                          {filterOptions?.level.map((option) => (
                            <div
                              key={`level-${option}`}
                              className="flex items-center mb-2"
                            >
                              <input
                                type="checkbox"
                                id={`level-${option}`}
                                disabled={isFiltering}
                                checked={selectedFilters.level.has(option)}
                                onChange={() =>
                                  handleFilterChange("level", option)
                                }
                                className={`h-4 w-4 text-teal-600/75 rounded border-gray-300 styled-checkbox`}
                              />
                              <label
                                htmlFor={`level-${option}`}
                                className="text-[#5F6368] capitalize"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="relative w-full h-full h-8 mt-6">
                      <div className="absolute flex gap-2 right-2 -bottom-4">
                        <button
                          type="button"
                          onClick={applyFilter}
                          className="bg-cyan-700 cursor-pointer text-white flex gap-1 items-center justify-center text-center rounded-md text-xs w-24 h-6 hover:bg-[#5CB5BD] "
                        >
                          <Check size={10} />
                          Apply Filter
                        </button>

                        <button
                          type="button"
                          onClick={resetFilters}
                          className="bg-white text-[#136A86] border border-[#136A86] cursor-pointer flex gap-1 items-center justify-center text-center rounded-md text-xs w-24 h-6 hover:bg-[#5CB5BD33] hover:text-[#136A86] hover:border-[#5CB5BD33]"
                        >
                          <RotateCcw size={10} />
                          Reset Filter
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href="/intern/wishlist"
                  className="text-gray-400 hover:bg-[#5CB5BD33]  hover:text-[#136A86] w-[3.5rem] h-[3rem] flex justify-center items-center rounded-xl"
                >
                  <Heart size={25} />
                </Link>
                <div className="relative">
                  <button
                    ref={notificationBtnRef}
                    onClick={handleNotificationToggle}
                    type="button"
                    title="show notification"
                    className="text-gray-400 relative cursor-pointer mr-3.5 hover:bg-[#5CB5BD33]  hover:text-[#136A86] w-[3.5rem] h-[3rem] flex justify-center items-center rounded-xl"
                  >
                    <Bell size={25} />
                    {unreadCounts > 1 && (
                      <span className="w-[6px] h-[6px] absolute top-[10px] right-5 rounded-full bg-red-600"></span>
                    )}
                  </button>
                  {isNotificationBoxOpen && (
                    <div ref={notificationBoxRef}>
                      {" "}
                      <Notifications
                        onNotificationsCleared={handleNotificationsClear}
                        onNotificationsRead={handleNotificationsRead}
                        notifications={notifications}
                      />
                    </div>
                  )}
                </div>
                <Link href="/intern/profile" id="avatar">
                  <Avatar
                    name={userName}
                    round
                    size="48"
                    className="font-lora cursor-pointer font-semibold"
                    textSizeRatio={2.5}
                  />
                </Link>
              </div>
            </div>
          </header>
          {canBeShowed && (
            <hr className="text-cyan-700 w-[94%] mx-auto lg:w-full" />
          )}
        </>
      )}
    </>
  );
}
