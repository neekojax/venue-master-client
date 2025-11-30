import { useEffect, useState } from "react";
import * as echarts from "echarts";
import { BarChart2, Inbox } from "lucide-react";
import { ReactEcharts } from "@/components/react-echarts";

import { fetchLastestHashRateEfficiency } from "@/pages/mining/api.tsx";

// @ts-ignore
const MiningEfficiencyCard = ({ poolType }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFrame, setTimeFrame] = useState("30");

  const fetchData = async (timeFrame: string) => {
    setLoading(true);
    try {
      const Result = await fetchLastestHashRateEfficiency(poolType, timeFrame);
      const formattedData = Result.data?.map((item: { date: any; efficiency: any }) => ({
        date: item.date,
        efficiency: item.efficiency,
      }));
      const sortedData = formattedData.sort(
        (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
          // @ts-ignore
          new Date(a.date) - new Date(b.date),
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
    const dates = data.map((item) => item.date);
    // @ts-ignore
    const efficiencies = data.map((item) => item.efficiency);

    return {
      grid: {
        top: 10,
        right: 10,
        left: 0,
        bottom: 0,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: {
            color: "#0ea5e9",
            width: 1,
            type: "dashed",
          },
        },
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#e2e8f0",
        textStyle: {
          color: "#1e293b",
        },
      },
      xAxis: {
        type: "category",
        data: dates,
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#94a3b8",
          fontSize: 10,
          formatter: (value: string) => value.slice(5),
        },
      },
      yAxis: {
        type: "value",
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
      },
      series: [
        {
          data: efficiencies,
          type: "line",
          smooth: true,
          symbol: "none",
          lineStyle: {
            width: 3,
            color: "#0ea5e9",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0.05, color: "rgba(14, 165, 233, 0.2)" },
              { offset: 0.95, color: "rgba(14, 165, 233, 0)" },
            ]),
          },
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
          <div className="p-1.5 bg-green-50 rounded-lg ring-1 ring-green-100/50">
            <BarChart2 size={18} className="text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">算力达成率</h2>
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

export default MiningEfficiencyCard;
