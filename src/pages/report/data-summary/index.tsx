// // 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Alert, DatePicker } from "antd";
import dayjs from "dayjs";
import ChartDashboard from "./components/chartDashboard";
import DataCardGrid from "./components/dataCard";
import Efficiency from "./components/efficiency";
import FaultRate from "./components/faultRate";
import Profit from "./components/profit";

// import { fetchBtcMarketInfo } from "@/pages/report/api";

const App: React.FC = () => {
  const [date, setDate] = useState(() => {
    const now = dayjs();
    return now.hour() >= 10 ? now.subtract(1, "day") : now.subtract(2, "day");
  });
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen  text-gray-800">
      {/* 顶部导航 */}
      <Alert
        showIcon
        banner
        type="warning"
        className="mb-3"
        message={
          <span>
            <strong>数据核对中：</strong>{" "}
            当前展示的数据为临时核对结果，非最终版，可能存在偏差；最终数据发布后将及时同步。
          </span>
        }
      />
      <div className="flex items-center justify-between  h-16 border-b border-gray-200">
        <div className="flex items-center gap-3"></div>
        <DatePicker
          value={date}
          onChange={(newDate) => {
            setDate(newDate!);
            setLoading(true);
          }}
          className="bg-white border border-gray-200 text-gray-800"
          suffixIcon={loading ? <LoadingOutlined spin /> : undefined}
        />
      </div>
      <div className=" grid grid-cols-2 gap-6">
        {/* 市场行情 */}
        <div className="col-span-2 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items中心 gap-2 text-lg">
              <i className="fas fa-chart-bar text-blue-500"></i>
              <span>市场行情</span>
            </div>
            <div className="text-sm text-gray-400">实时数据</div>
          </div>
          <DataCardGrid
            chartDate={date.format("YYYY-MM-DD")}
            loading={loading}
            onLoaded={() => setLoading(false)}
            // items={[
            //   { label: "算力 EH/s", value: "968.43" },
            //   { label: "全网日产出", value: "470.3" },
            //   { label: "单价 $", value: "118,394" },
            // ]}
          />
        </div>
        <div className="col-span-2 rounded-lg  " style={{ clear: "both" }}>
          <ChartDashboard
            chartDate={date.format("YYYY-MM-DD")}
            panels={[
              { title: "算力趋势", id: "powerTrend" },
              { title: "单价趋势", id: "priceTrend" },
            ]}
            loading={loading}
            onLoaded={() => setLoading(false)}
          />
        </div>
        {/* 故障率 */}
        <FaultRate
          chartDate={date.format("YYYY-MM-DD")}
          loading={loading}
          onLoaded={() => setLoading(false)}
        />
        {/* 有效率 */}
        <Efficiency
          chartDate={date.format("YYYY-MM-DD")}
          loading={loading}
          onLoaded={() => setLoading(false)}
        />

        {/* 利润预估 */}
        <Profit chartDate={date.format("YYYY-MM-DD")} />
      </div>
    </div>
  );
};
export default App;
