// // 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useState } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import * as echarts from "echarts";
const App: React.FC = () => {
  const [date, setDate] = useState(dayjs());
  React.useEffect(() => {
    // 算力趋势图
    const powerChart = echarts.init(document.getElementById("powerTrend"));
    const powerOption = {
      animation: false,
      grid: {
        top: 30,
        right: 20,
        bottom: 60,
        left: 50,
      },
      xAxis: {
        type: "category",
        data: ["8-27", "8-28", "8-29", "8-30", "8-31", "9-1", "9-2"],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#1f2937",
          fontSize: 12,
        },
      },
      yAxis: {
        type: "value",
        min: 700,
        axisLine: {
          show: true,
          lineStyle: { color: "#e5e7eb" },
        },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: { color: "#f3f4f6" },
        },
        axisLabel: {
          show: true,
          color: "#1f2937",
          fontSize: 12,
        },
      },
      series: [
        {
          data: [968.43, 891.3, 850.21, 839.26, 896.33, 950.36, 968.43],
          type: "line",
          smooth: true,
          showSymbol: true,
          symbolSize: 8,
          label: {
            show: true,
            position: "top",
            color: "#1f2937",
            fontSize: 12,
          },
          lineStyle: {
            width: 3,
            color: "#4B96FF",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(75,150,255,0.3)" },
              { offset: 1, color: "rgba(75,150,255,0)" },
            ]),
          },
        },
      ],
    };
    powerChart.setOption(powerOption);
    // 单价趋势图
    const priceChart = echarts.init(document.getElementById("priceTrend"));
    const priceOption = {
      animation: false,
      grid: {
        top: 30,
        right: 20,
        bottom: 60,
        left: 50,
      },
      xAxis: {
        type: "category",
        data: ["8-27", "8-28", "8-29", "8-30", "8-31", "9-1", "9-2"],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#1f2937",
          fontSize: 12,
        },
      },
      yAxis: {
        type: "value",
        min: 100000,
        axisLine: {
          show: true,
          lineStyle: { color: "#e5e7eb" },
        },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: { color: "#f3f4f6" },
        },
        axisLabel: {
          show: true,
          color: "#1f2937",
          fontSize: 12,
        },
      },
      series: [
        {
          data: [116683, 116486, 115911, 118702, 120108, 123376, 118394],
          type: "line",
          smooth: true,
          showSymbol: true,
          symbolSize: 8,
          label: {
            show: true,
            position: "top",
            color: "#1f2937",
            fontSize: 12,
          },
          lineStyle: {
            width: 3,
            color: "#FF6B6B",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(255,107,107,0.3)" },
              { offset: 1, color: "rgba(255,107,107,0)" },
            ]),
          },
        },
      ],
    };
    priceChart.setOption(priceOption);
    // 故障率柱状图
    const faultChart = echarts.init(document.getElementById("faultRate"));
    const faultOption = {
      animation: false,
      grid: {
        top: 30,
        right: 20,
        bottom: 60,
        left: 50,
      },
      xAxis: {
        type: "category",
        data: ["北美", "阿曼", "埃塞俄比亚", "巴拉圭"],
        axisLabel: {
          color: "#1f2937",
          fontSize: 12,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#1f2937",
          fontSize: 12,
          formatter: "{value}%",
        },
      },
      legend: {
        data: ["8月1日", "8月2日", "8月3日"],
        textStyle: {
          color: "#1f2937",
        },
        top: 0,
        padding: [0, 0, 10, 0],
      },
      series: [
        {
          name: "8月1日",
          data: [0.24, 0.18, 0.04, 0.05],
          type: "bar",
          barWidth: "20%",
          itemStyle: {
            color: "#4B96FF",
          },
        },
        {
          name: "8月2日",
          data: [0.26, 0.16, 0.06, 0.09],
          type: "bar",
          barWidth: "20%",
          itemStyle: {
            color: "#50E3C2",
          },
        },
        {
          name: "8月3日",
          data: [0.22, 0.15, 0.02, 0.08],
          type: "bar",
          barWidth: "20%",
          itemStyle: {
            color: "#7C4DFF",
          },
        },
      ],
    };
    faultChart.setOption(faultOption);
    // 效率柱状图
    const efficiencyChart = echarts.init(document.getElementById("efficiency"));
    const efficiencyOption = {
      animation: false,
      grid: {
        top: 30,
        right: 20,
        bottom: 60,
        left: 50,
      },
      xAxis: {
        type: "category",
        data: ["北美", "阿曼", "埃塞俄比亚", "巴拉圭"],
        axisLabel: {
          color: "#1f2937",
          fontSize: 12,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#1f2937",
          fontSize: 12,
          formatter: "{value}%",
        },
      },
      legend: {
        data: ["8月1日", "8月2日", "8月3日"],
        textStyle: {
          color: "#1f2937",
        },
        top: 0,
        padding: [0, 0, 10, 0],
      },
      series: [
        {
          name: "8月1日",
          data: [94.5, 92.3, 93.1, 91.8],
          type: "bar",
          barWidth: "20%",
          itemStyle: {
            color: "#4B96FF",
          },
        },
        {
          name: "8月2日",
          data: [93.8, 91.9, 92.5, 92.1],
          type: "bar",
          barWidth: "20%",
          itemStyle: {
            color: "#50E3C2",
          },
        },
        {
          name: "8月3日",
          data: [94.2, 92.7, 93.4, 91.5],
          type: "bar",
          barWidth: "20%",
          itemStyle: {
            color: "#7C4DFF",
          },
        },
      ],
    };
    efficiencyChart.setOption(efficiencyOption);
  }, []);
  return (
    <div className="min-h-screen  text-gray-800">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between  h-16 border-b border-gray-200">
        <div className="flex items-center gap-3"></div>
        <DatePicker
          value={date}
          onChange={(newDate) => setDate(newDate!)}
          className="bg-white border border-gray-200 text-gray-800"
        />
      </div>
      <div className=" grid grid-cols-2 gap-6">
        {/* 市场行情 */}
        <div className="col-span-2 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-lg">
              <i className="fas fa-chart-bar text-blue-500"></i>
              <span>市场行情</span>
            </div>
            <div className="text-sm text-gray-400">实时数据</div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-gray-500 mb-2">算力 EH/s</div>
              <div className="text-2xl">968.43</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-gray-500 mb-2">全网日产出</div>
              <div className="text-2xl">470.3</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-gray-500 mb-2">单价 $</div>
              <div className="text-2xl">118,394</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-gray-500 mb-2">算力趋势</div>
              <div id="powerTrend" className="h-64"></div>
            </div>
            <div>
              <div className="text-gray-500 mb-2">单价趋势</div>
              <div id="priceTrend" className="h-64"></div>
            </div>
          </div>
        </div>
        {/* 故障率 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-lg">
              <i className="fas fa-robot text-blue-500"></i>
              <span>故障率</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-4 h-[184px] border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-gray-500">新增故障台数</div>
                      <div className="text-2xl text-gray-800">12</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-gray-500">新增故障率</div>
                      <div className="text-2xl text-gray-800">0.18%</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-gray-500">总故障台数</div>
                      <div className="text-2xl">45</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-gray-500">总故障率</div>
                      <div className="text-2xl">1.2%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left w-[20%]">地区</th>
                  <th className="p-3 text-left w-[25%]">新增故障数</th>
                  <th className="p-3 text-left w-[25%]">新增故障率</th>
                  <th className="p-3 text-left w-[30%]">总故障台数</th>
                </tr>
              </thead>
              <tbody>
                {["北美", "阿曼", "埃塞俄比亚", "巴拉圭"].map((region) => (
                  <tr key={region} className="border-b border-gray-200">
                    <td className="p-3">{region}</td>
                    <td className="p-3">{Math.floor(Math.random() * 10)}</td>
                    <td className="p-3">{(Math.random() * 0.5).toFixed(2)}%</td>
                    <td className="p-3">{Math.floor(Math.random() * 20)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left w-[20%]">类型</th>
                  <th className="p-3 text-left w-[25%]">新增故障数</th>
                  <th className="p-3 text-left w-[25%]">新增故障率</th>
                  <th className="p-3 text-left w-[30%]">总故障台数</th>
                </tr>
              </thead>
              <tbody>
                {["风冷", "水冷"].map((type) => (
                  <tr key={type} className="border-b border-gray-200">
                    <td className="p-3">{type}</td>
                    <td className="p-3">{Math.floor(Math.random() * 10)}</td>
                    <td className="p-3">{(Math.random() * 0.5).toFixed(2)}%</td>
                    <td className="p-3">{Math.floor(Math.random() * 20)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mb-6">
            <div className="text-gray-500 mb-2">近三天新增故障率</div>
            <div id="faultRate" className="h-64"></div>
          </div>
        </div>
        {/* 效率 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-lg">
              <i className="fas fa-tachometer-alt text-blue-500"></i>
              <span>效率</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-4 h-[184px] border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-gray-500">算力 EH/s</div>
                      <div className="text-xl text-gray-800">968.43</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-gray-500">全网比例</div>
                      <div className="text-xl text-gray-800">15.3%</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-gray-500">算力有效率</div>
                      <div className="text-xl text-gray-800">93.5%</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-gray-500">日产出</div>
                      <div className="text-xl">470.3</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-gray-500">MTD产出</div>
                      <div className="text-xl">3,256.8</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-gray-500">累计产出</div>
                      <div className="text-xl">1,584.6</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left w-[20%]">地区</th>
                  <th className="p-3 text-left w-[20%]">有效算力</th>
                  <th className="p-3 text-left w-[20%]">有效率</th>
                  <th className="p-3 text-left w-[20%]">日产出</th>
                  <th className="p-3 text-left w-[20%]">累计产出</th>
                </tr>
              </thead>
              <tbody>
                {["北美", "阿曼", "埃塞俄比亚", "巴拉圭"].map((region) => (
                  <tr key={region} className="border-b border-gray-200">
                    <td className="p-3">{region}</td>
                    <td className="p-3">{(Math.random() * 100 + 200).toFixed(2)} EH/s</td>
                    <td className="p-3">{(Math.random() * 5 + 90).toFixed(2)}%</td>
                    <td className="p-3">{(Math.random() * 50 + 100).toFixed(2)}</td>
                    <td className="p-3">{(Math.random() * 200 + 300).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left w-[20%]">类型</th>
                  <th className="p-3 text-left w-[20%]">有效算力</th>
                  <th className="p-3 text-left w-[20%]">有效率</th>
                  <th className="p-3 text-left w-[20%]">日产出</th>
                  <th className="p-3 text-left w-[20%]">累计产出</th>
                </tr>
              </thead>
              <tbody>
                {["风冷", "水冷"].map((type) => (
                  <tr key={type} className="border-b border-gray-200">
                    <td className="p-3">{type}</td>
                    <td className="p-3">{(Math.random() * 200 + 300).toFixed(2)} EH/s</td>
                    <td className="p-3">{(Math.random() * 5 + 90).toFixed(2)}%</td>
                    <td className="p-3">{(Math.random() * 100 + 150).toFixed(2)}</td>
                    <td className="p-3">{(Math.random() * 400 + 600).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mb-6">
            <div className="text-gray-500 mb-2">近三天有效率</div>
            <div id="efficiency" className="h-64"></div>
          </div>
        </div>
        {/* 利润预估 */}
        <div className="col-span-2 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-lg">
              <i className="fas fa-chart-pie text-blue-500"></i>
              <span>利润 - 预估 (单位: $)</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-gray-500 mb-2">日产出价值</div>
              <div className="text-2xl">$ 55,682.43</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-gray-500 mb-2">累计产出价值</div>
              <div className="text-2xl">$ 187,584.21</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-gray-500 mb-2">累计单币成本</div>
              <div className="text-2xl">$ 15,423.67</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-gray-500 mb-2">累计托管费</div>
              <div className="text-2xl">$ 37,516.84</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-gray-500 mb-2">累计单币成本-含折旧</div>
              <div className="text-2xl">$ 18,947.32</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-gray-500 mb-2">累计运维费</div>
              <div className="text-2xl">$ 9,384.21</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="overflow-x-auto border-b-2 border-gray-200 pb-6">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left w-[25%]">地区</th>
                      <th className="p-3 text-left w-[25%]">日产出价值</th>
                      <th className="p-3 text-left w-[25%]">日托管费</th>
                      <th className="p-3 text-left w-[25%]">日运维费</th>
                      <th className="p-3 text-left w-[25%] whitespace-nowrap">日单币成本</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["北美", "阿曼", "埃塞俄比亚", "巴拉圭"].map((region) => (
                      <tr key={region} className="border-b border-gray-200">
                        <td className="p-3">{region}</td>
                        <td className="p-3">{(Math.random() * 10000 + 5000).toFixed(2)}</td>
                        <td className="p-3">{(Math.random() * 1000 + 500).toFixed(2)}</td>
                        <td className="p-3">{(Math.random() * 500 + 200).toFixed(2)}</td>
                        <td className="p-3">{(Math.random() * 2000 + 1000).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="overflow-x-auto pt-4">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left w-[25%]">类型</th>
                      <th className="p-3 text-left w-[25%]">日产出价值</th>
                      <th className="p-3 text-left w-[25%]">日托管费</th>
                      <th className="p-3 text-left w-[25%]">日运维费</th>
                      <th className="p-3 text-left w-[25%] whitespace-nowrap">日单币成本</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["风冷", "水冷"].map((type) => (
                      <tr key={type} className="border-b border-gray-200">
                        <td className="p-3">{type}</td>
                        <td className="p-3">{(Math.random() * 20000 + 10000).toFixed(2)}</td>
                        <td className="p-3">{(Math.random() * 2000 + 1000).toFixed(2)}</td>
                        <td className="p-3">{(Math.random() * 1000 + 500).toFixed(2)}</td>
                        <td className="p-3">{(Math.random() * 4000 + 2000).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <div className="overflow-x-auto border-b-2 border-gray-200 pb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left w-[25%]">地区</th>
                        <th className="p-3 text-left">累计产出价值</th>
                        <th className="p-3 text-left">累计托管费</th>
                        <th className="p-3 text-left">累计运维费</th>
                        <th className="p-3 text-left">累计单币成本</th>
                      </tr>
                    </thead>
                    <tbody>
                      {["北美", "阿曼", "埃塞俄比亚", "巴拉圭"].map((region) => (
                        <tr key={region} className="border-b border-gray-200">
                          <td className="p-3">{region}</td>
                          <td className="p-3">{(Math.random() * 200000 + 100000).toFixed(2)}</td>
                          <td className="p-3">{(Math.random() * 20000 + 10000).toFixed(2)}</td>
                          <td className="p-3">{(Math.random() * 10000 + 5000).toFixed(2)}</td>
                          <td className="p-3">{(Math.random() * 40000 + 20000).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <div className="overflow-x-auto pt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left w-[25%]">类型</th>
                        <th className="p-3 text-left">累计产出价值</th>
                        <th className="p-3 text-left">累计托管费</th>
                        <th className="p-3 text-left">累计运维费</th>
                        <th className="p-3 text-left">累计单币成本</th>
                      </tr>
                    </thead>
                    <tbody>
                      {["风冷", "水冷"].map((type) => (
                        <tr key={type} className="border-b border-gray-200">
                          <td className="p-3">{type}</td>
                          <td className="p-3">{(Math.random() * 400000 + 200000).toFixed(2)}</td>
                          <td className="p-3">{(Math.random() * 40000 + 20000).toFixed(2)}</td>
                          <td className="p-3">{(Math.random() * 20000 + 10000).toFixed(2)}</td>
                          <td className="p-3">{(Math.random() * 80000 + 40000).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mt-6 border border-gray-100">
            <div className="text-lg font-medium mb-4 flex items-center gap-2">
              <i className="fas fa-calendar text-blue-500"></i>
              <span>全月情况（8-1～8-31）</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-gray-500 mb-2">MTD产出价值</div>
                <div className="text-2xl">272,330.00</div>
              </div>
              <div>
                <div className="text-gray-500 mb-2">MTD托管费</div>
                <div className="text-2xl">54,470.00</div>
              </div>
              <div>
                <div className="text-gray-500 mb-2">MTD运维费</div>
                <div className="text-2xl">27,235.00</div>
              </div>
              <div>
                <div className="text-gray-500 mb-2">MTD净收益</div>
                <div className="text-2xl">190,625.00</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div>
                <div className="text-gray-500 mb-2">预估全月产出</div>
                <div className="text-2xl">816,990.00</div>
              </div>
              <div>
                <div className="text-gray-500 mb-2">预估全月托管费</div>
                <div className="text-2xl">163,410.00</div>
              </div>
              <div>
                <div className="text-gray-500 mb-2">预估全月运维费</div>
                <div className="text-2xl">81,705.00</div>
              </div>
              <div>
                <div className="text-gray-500 mb-2">预估全月净收益</div>
                <div className="text-2xl">571,875.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;
