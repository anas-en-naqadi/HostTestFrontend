import React from "react";
import { IconProps } from "lucide-react";

interface StatCardProps {
  /** Lucide icon component from lucide-react */
  icon: React.FC<IconProps>;
  /** Label for the card */
  title: string;
  /** Current value */
  value: number;
  /** Label in card bottom */
  subTitle: string;
}

const AdminStatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subTitle }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col">
      <div className="flex items-center mb-4 text-[#136A86]">
        <Icon size={26} className="mr-3" />
        <h3 className="text-sm md:text-base xl:text-2xl font-medium">{title}</h3>
      </div>
      
      <div className="flex flex-col sm:mt-7">
        <span className="text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-1">{value}</span>
        <span className="text-xs md:text-base text-gray-400">{subTitle}</span>
      </div>
    </div>
  );
};

export default AdminStatCard;