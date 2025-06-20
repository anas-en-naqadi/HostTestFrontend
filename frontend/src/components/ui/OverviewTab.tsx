import { useState } from "react";
import ReactQuill from "react-quill-new";
import DOMPurify from "isomorphic-dompurify";

interface OverviewTabProps {
  description: string;
  whatYouWillLearn?: string[];
  requirements?: string[];
}

export default function OverviewTab({
  description,
  whatYouWillLearn = [],
  requirements = [],
}: OverviewTabProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_DESCRIPTION_PARAGRAPHS = 2;

  const needsTruncation =
    description.split("\n\n").length > MAX_DESCRIPTION_PARAGRAPHS;

  return (
    <div className="w-full px-4  lg:p-4 space-y-6 md:space-y-8">
      <div className="flex flex-col 2xl:grid 2xl:grid-cols-4 gap-4 2xl:gap-6 w-full">
        {/* <div className="flex flex-col space-y-4 md:space-y-6"> */}
        {/* Title - now full width on mobile, column on desktop */}
        <div className="md:col-span-1">
          <h2 className="text-lg md:text-xl font-bold md:sticky md:top-4">
            Description
          </h2>
        </div>

        {/* Content - full width on mobile, 3 columns on desktop */}
        <div className="md:col-span-3 space-y-6 md:space-y-8">
          {/* Description Content */}
          <ReactQuill
            value={DOMPurify.sanitize(description)}
            theme="snow"
            modules={{ toolbar: false }}
            readOnly={true}
            className="my-quill"
          />

          {/* Show More button */}
          {needsTruncation && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-[#136A86] font-medium hover:underline cursor-pointer text-sm md:text-base"
            >
              Show more...
            </button>
          )}

          {/* Expanded content */}
          {isExpanded && (
            <>
              {/* What You'll Learn */}
              {whatYouWillLearn.length > 0 && (
                <div className="mt-6 md:mt-8">
                  <h3 className="text-base font-bold mb-3">
                    What You&apos;ll Learn
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    {whatYouWillLearn.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm md:text-base"
                      >
                        <span className="text-[#136A86] mt-0.5 md:mt-1">✓</span>
                        <span className="text-black">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {requirements.length > 0 && (
                <div className="mt-6 md:mt-8">
                  <h3 className="text-base font-bold mb-3">
                    Are there any course requirements or prerequisites?
                  </h3>
                  <ul className="space-y-1 md:space-y-2">
                    {requirements.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm md:text-base"
                      >
                        <span className="text-black">• {item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Show Less button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="text-[#136A86] font-medium hover:underline mt-4 cursor-pointer text-sm md:text-base"
              >
                Show less...
              </button>
            </>
          )}
          <hr className="text-[#136A86]" />
        </div>
      </div>
    </div>
  );
}
