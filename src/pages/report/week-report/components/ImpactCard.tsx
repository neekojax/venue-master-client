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
}

const ImpactCard: React.FC<HeatImpactCardProps> = ({ title, data, onReload }) => {
  let color = "blue-500";
  if (title == "高温影响率排名") {
    color = "orange-500";
  } else if (title == "限电影响率排名") {
    color = "yellow-500";
  }
  return (
    <div className="bg-white p-4 rounded-[4px] border border-[#F0F2F5] shadow-sm">
      {/* 标题 + 刷新按钮 */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <Button type="text" icon={<ReloadOutlined />} onClick={onReload} />
      </div>

      {/* 排行内容 */}
      <div className="space-y-4">
        {data
          .sort((a, b) => b.rate - a.rate)
          .slice(0, 5)
          .map((item, index) => (
            <div key={item.venue_name} className="flex items-center">
              {/* 排名序号 */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                  index < 3 ? `bg-${color} text-white ` : "bg-gray-100 text-gray-500"
                }`}
              >
                {index + 1}
              </div>

              {/* 名称 + 百分比 + 进度条 */}
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.venue_name}</span>
                  <span className={`text-${color}`}>{item.rate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div className={`bg-${color} h-1 rounded-full `} style={{ width: `${item.rate}%` }}></div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ImpactCard;
