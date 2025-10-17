// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React from "react";
import ChartFee from "./components/chartFee";
import ChartPrice from "./components/chartPrice";

const App: React.FC = () => {
  const [venueName, setVenueName] = React.useState<string>("");
  return (
    <div className="min-h-screen" style={{ margin: "0 auto" }}>
      {/* Header Section */}
      <div className="text-center mb-12 mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">BTC价格与托管费比例趋势分析</h1>
        <p className="text-gray-500">最近半年数据</p>
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
          {venueName}
        </span>
      </div>
      {/* Custody Fee Chart */}
      <ChartFee onVenueNameChange={setVenueName} />
      {/* <div className="h-16"></div> */}
      {/* BTC Price Chart */}
      <ChartPrice />
      {/* Footer Spacer */}
      <div className="h-16"></div>
    </div>
  );
};
export default App;
