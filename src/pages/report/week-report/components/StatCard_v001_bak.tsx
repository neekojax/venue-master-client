import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: string; // fontawesome 的图标名
  iconColor: string;
  trend: string;
  // trend: "up" | "down";
  trendValue: string;
  trendText: string;
  trendColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  trend,
  trendValue,
  trendText,
  trendColor,
}) => {
  // console.log("trend", trend);
  return (
    <div className="bg-white p-4 rounded-[4px] border border-[#F0F2F5] shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[#64748B]">{title}</span>
        <i className={`fas fa-${icon} ${iconColor}`}></i>
      </div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className={`${trendColor} mb-3`}>
        <i className={`fas fa-arrow-${trend} mr-1`}></i>
        <span>
          {trendValue} {trendText}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
