import React from "react";

interface ActiveNowCardProps {
  activeInterns: number;
  activeInstructors: number;
}

export default function ActiveNowCard({ activeInterns, activeInstructors }: ActiveNowCardProps) {
  return (
    <div className="flex flex-col justify-center bg-white rounded-xl shadow-lg p-5 h-full max-h-full">
      <h2 className="text-[26px] font-semibold text-[#136A86] mb-4 lg:mb-10">
        Active Now
      </h2>

      <div className="flex flex-row justify-center items-center gap-6 sm:gap-12 py-2 w-full">
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[50px] font-bold">{activeInterns}</span>
          <span className="text-[10px] sm:text-[14px] text-[#A3A3A3]">Intern</span>
        </div>

        {/* Divider hidden on very small screens */}
        <div className="h-6 sm:h-10 w-[2px] bg-[#136A86]"></div>

        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[50px] font-bold">{activeInstructors}</span>
          <span className="text-[10px] sm:text-[14px] text-[#A3A3A3]">Instructor</span>
        </div>
      </div>
    </div>
  );
}
