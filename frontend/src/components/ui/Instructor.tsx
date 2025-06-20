"use client";

import Avatar from "react-avatar";
import DOMPurify from "isomorphic-dompurify";
import ReactQuill from "react-quill-new";

interface InstructorProps {
  instructor: {
    full_name: string;
    specialization?: string;
    description?: string;
    avatar_url?: string;
  };
}

export default function Instructor({ instructor }: InstructorProps) {
  return (
    <div className="w-full p-4 md:p-5 space-y-6 md:space-y-8">
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 md:gap-6 w-full">
        {/* Title - full width on mobile, 1 column on desktop */}
        <div className="md:col-span-1">
          <h2 className="text-lg md:text-xl font-bold md:sticky md:top-4">
            Instructor
          </h2>
        </div>

        {/* Content - full width on mobile, 3 columns on desktop */}
        <div className="md:col-span-3 space-y-4 md:space-y-6">
          {/* Instructor Profile */}
          <div className="flex sm:flex-row items-start gap-4 md:gap-6">
            <div className="flex-shrink-0">
              <Avatar
                name={instructor.full_name}
                round
                size="64"
                className="font-sans font-semibold w-16 h-16 md:w-20 md:h-20"
              />
            </div>
            <div className="space-y- md:space-y- mt-3 -ml-2">
              <h3 className="text-base md:text-[18px] font-bold text-[#136A86]">
                {instructor.full_name}
              </h3>
              {instructor.specialization && (
                <p className="text-xs md:text-[12px] font-medium text-[#8C8FA5]">
                  {instructor.specialization}
                </p>
              )}
            </div>
          </div>

          {/* Instructor Description */}
          {instructor.description && (
            <div className="prose prose-sm max-w-none">
              <ReactQuill
                value={DOMPurify.sanitize(instructor.description!)}
                theme="snow"
                modules={{ toolbar: false }}
                readOnly={true}
                className="my-quill"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
