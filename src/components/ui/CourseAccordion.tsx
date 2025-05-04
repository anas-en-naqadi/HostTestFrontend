"use client";

import { formatDuration } from "@/utils/formatDuration";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Clock, ChevronDown } from "lucide-react";
import { FileText, ClipboardList, FileVideo } from "lucide-react";

type Lesson = {
  id: number;
  title: string;
  content_type: string;
};

type Module = {
  id: number;
  title: string;
  duration: number;
  orderPosition:number;
  lessons: Lesson[];
};

type Props = {
  modules: Module[];
};

export default function CourseModules({ modules }: Props) {
  return (
    <Accordion type="multiple" className="w-full bg-[#E4F4F9]">
      {modules.map((module, index) => (
        <AccordionItem
          key={module.id}
          value={`item-${index}`}
          className="border-none"
        >
          <AccordionTrigger
            className="
              group flex justify-between items-center 
              px-5 w-full py-3 font-semibold 
          -   after:hidden no-underline hover:no-underline focus:outline-none
          +   [&>svg]:hidden
            "
          >
            <div className="flex items-center gap-2">
              {/* Chevron icon that rotates on open */}
              <ChevronDown
                fill="currentColor"
                strokeWidth={1}
                className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180 "
              />

              <span className="text-xs sm:text-md font-bold">
                Module {index + 1}: {module.title}
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-4 lg:gap-6 text-xs font-normal">
              <span className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-[#5CB5BD]" />
                {formatDuration(module.duration)}
              </span>
              <span className="text-[#5CB5BD]">|</span>
              <span>
                {module.lessons.length.toString().padStart(2, "0")} Lectures
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-4 mb-3 bg-white py-4">
            {module.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="py-1.5 text-md font-normal mb-1 flex items-center gap-2"
              >
                {lesson.content_type === "video" ? (
                  <FileVideo size={14} className="text-[#136A86]" />
                ) : lesson.content_type === "article" ? (
                  <FileText size={14} className="text-[#136A86]" />
                ) : (
                  <ClipboardList size={14} className="text-[#136A86]" />
                )}

                <span className="text-md first-letter:uppercase">
                  {" "}
                  {lesson.title}
                </span>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
