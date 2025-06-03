"use client";
import Avatar from "react-avatar";
import { Flag } from "lucide-react";
import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import { timeAgo } from "@/utils/formatTimeAgo";

type Announcement = {
  id: number;
  content: string;
  title: string;
  created_at: string;
};
interface AnnouncementProps {
  announcements: Announcement[];
  instructor: {users:{id:number;full_name:string}};
}

export default function Announcements({
  announcements,
  instructor,
}: AnnouncementProps) {
  if(announcements.length===0){
    return (
      <div className="xl:-mt-4">
      <h1 className="font-semibold lg:text-2xl md:text-xl sm:text-lg">No announcements posted yet</h1>
      <p className="font-normal lg:text-base text-sm mt-3">The instructor hasn’t added any announcements to this course yet. Announcements are used to inform you of updates or additions to the course.</p>
      </div>
    )
  }
  return (
    <>
      {announcements.map((a) => {
        const content = DOMPurify.sanitize(a.content);
        return (
       <>
          <div key={a.id} className="flex flex-col mb-6 mt-2 lg:mt-0">
            <div className="flex gap-3 flex-wrap items-center">
              <Avatar
                name={instructor.full_name}
                round
                size="63"
                className="font-lora font-semibold"
                textSizeRatio={2.7}
              />
              <div>
                <h1 className="text-md lg:text-lg font-bold ">
                  {instructor.full_name}
                </h1>
                <span className="text-gray-500/80 text-[10px] lg:text-xs font-semibold flex items-center gap-2">
                  <Flag size={9} format={"round"} /> Posted an announcement .{" "}
                  {timeAgo(a.created_at)}
                </span>
              </div>
            </div>
            <div className="p-4">{parse(content)}</div>
          </div>
         
        </>
        );
      })}
    </>
  );
}
