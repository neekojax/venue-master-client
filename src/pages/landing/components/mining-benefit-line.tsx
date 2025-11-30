import { useEffect, useState } from "react";
import * as echarts from "echarts";
import { Inbox, TrendingUp } from "lucide-react";
import { ReactEcharts } from "@/components/react-echarts";

import { fetchMiningBenefitLine } from "@/pages/landing/api.ts";

// @ts-ignore
const MiningBenefitCard = ({ poolType }) => {
  const [data, setData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("30");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async (timeFrame: string) => {
    try {
      const Result = await fetchMiningBenefitLine(poolType, timeFrame);
      const formattedData = Result.data.map(
        (item: { time: any; income_usd: any; hosting_fee: any; fee_percentage: any }) => ({
          time: item.time,
          income_usd: item.income_usd,
          hosting_fee: item.hosting_fee,
          fee_percentage: item.fee_percentage,
        }),
      );
      const sortedData = formattedData.sort(
        (a: { time: string | number | Date }, b: { time: string | number | Date }) =>
          // @ts-ignore
          new Date(a.time) - new Date(b.time),
      );
      setData(sortedData);
    } catch (error) {
      console.error("Error fetching hash rate efficiency:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(timeFrame);
  }, [poolType, timeFrame]);

  const getOption = () => {
    // @ts-ignore
    const times = data.map((item) => item.time);
    // @ts-ignore
    const income_usd = data.map((item) => item.income_usd);
    // @ts-ignore
    const hosting_fee = data.map((item) => item.hosting_fee);
    // @ts-ignore
    const fee_percentage = data.map((item) => item.fee_percentage);

    return {
      grid: {
        top: 30,
        right: 40,
        left: 10,
        bottom: 0,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#e2e8f0",
        textStyle: { color: "#1e293b" },
      },
      xAxis: {
        type: "category",
        data: times,
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#94a3b8",
          fontSize: 10,
          formatter: (value: string) => value.slice(5),
        },
      },
      yAxis: [
        {
          type: "value",
          name: "金额 (USD)",
          splitLine: {
            lineStyle: {
              color: "#f1f5f9",
              type: "dashed",
            },
          },
          axisLabel: {
            color: "#94a3b8",
            fontSize: 10,
          },
          axisLine: { show: false },
        },
        {
          type: "value",
          name: "占比 (%)",
          min: 0,
          max: 100,
          splitLine: { show: false },
          axisLabel: {
            color: "#94a3b8",
            fontSize: 10,
          },
          axisLine: { show: false },
        },
      ],
      series: [
        {
          name: "收益",
          data: income_usd,
          type: "line",
          smooth: true,
          symbol: "none",
          lineStyle: { width: 3, color: "#3b82f6" },
        },
        {
          name: "支出",
          data: hosting_fee,
          type: "line",
          smooth: true,
          symbol: "none",
          lineStyle: { width: 2, color: "#fb923c" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0.05, color: "rgba(251, 146, 60, 0.2)" },
              { offset: 0.95, color: "rgba(251, 146, 60, 0)" },
            ]),
          },
        },
        {
          name: "托管费占比",
          data: fee_percentage,
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbol: "none",
          lineStyle: { width: 2, color: "#10b981", type: "dashed" }, // 使用绿色虚线
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="w-40 h-8 bg-slate-100 rounded"></div>
          <div className="w-32 h-8 bg-slate-100 rounded"></div>
        </div>
        <div className="flex-1 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-50 rounded-lg ring-1 ring-orange-100/50">
            <TrendingUp size={18} className="text-orange-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">收益+支出</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 rounded-full bg-emerald-500"></span>
            </div>
          </div>
          <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100">
            {["7", "30", "90"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeFrame(t)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  timeFrame === t
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                }`}
              >
                {t}天
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        {data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="p-4 bg-slate-50 rounded-full mb-3">
              <Inbox size={24} />
            </div>
            <span className="text-sm">暂无数据</span>
          </div>
        ) : (
          <ReactEcharts option={getOption()} style={{ height: "100%", width: "100%" }} />
        )}
      </div>
    </div>
  );
};

export default MiningBenefitCard;
