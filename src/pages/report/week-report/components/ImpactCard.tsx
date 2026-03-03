import React from "react";
import { ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

interface DataItem {
  venue_name: string;
  rate: number;
}

interface HeatImpactCardProps {
  title: string;
  data: DataItem[];
  onReload?: () => void;
  border?: "none" | "default";
  diff?: boolean;
}

const ImpactCard: React.FC<HeatImpactCardProps> = ({ title, data, onReload, border, diff }) => {
  let color = "blue-500";
  if (title == "高温影响率排名") {
    color = "orange-500";
  } else if (title == "限电影响率排名") {
    color = "yellow-500";
  }
  const containerCls = ["bg-white", "p-4", "rounded-[4px]", "shadow-sm"];
  if (border !== "none") {
    containerCls.push("border", "border-[#F0F2F5]");
  }
  return (
    <div className={containerCls.join(" ")}>
      {title !== "" && (
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <Button type="text" icon={<ReloadOutlined />} onClick={onReload} />
        </div>
      )}
      <div className="space-y-4 p-4" style={{ padding: "1.1rem", paddingTop: "0px", paddingLeft: "0.8rem" }}>
        {data
          .sort((a, b) => b.rate - a.rate)
          .slice(0, 5)
          .map((item, index) => (
            <div key={item.venue_name} className="flex items-center ">
              <div
                className={`w-5 h-5  rounded-full text-sm flex items-center justify-center mr-3 ${
                  index < 3
                    ? `bg-${diff ? (item.rate > 0 ? "green-500" : item.rate < 0 ? "red-500" : "gray-400") : color} text-white `
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1" style={{ fontSize: "13px" }}>
                  <span className="font-medium">{item.venue_name}</span>
                  <span
                    className={`text-${diff ? (item.rate > 0 ? "green-500" : item.rate < 0 ? "red-500" : "gray-500") : color}`}
                  >
                    {diff
                      ? `${item.rate > 0 ? "+" : item.rate < 0 ? "-" : ""}${Math.abs(item.rate).toFixed(2)}%`
                      : `${item.rate.toFixed(2)}%`}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div
                    className={`bg-${diff ? (item.rate > 0 ? "green-500" : item.rate < 0 ? "red-500" : "gray-400") : color} h-1 rounded-full `}
                    style={{ width: `${Math.min(Math.abs(item.rate), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ImpactCard;
