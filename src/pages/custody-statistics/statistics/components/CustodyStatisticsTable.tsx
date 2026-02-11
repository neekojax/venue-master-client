import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Alert, Spin, Table, Tag, Tooltip } from "antd";
import { useSelector, useSettingsStore } from "@/stores";
import { formatAmount, formatHashrate } from "@/utils/num";

import { useDailyHostingFeeRatioList } from "@/pages/custody-statistics/hook/hook.ts";
// import { exportCustodyStatisticsToExcel } from "@/utils/excel";

// 读取默认时间范围（与 dailyData.tsx 保持一致）
// const getInitialTimeRange = () => {
//   const stored = localStorage.getItem("timeRange");
//   return stored ? stored : "1days";
// };

// define props for parent-driven filtering
type Props = {
  dayRange: string; // 例如 "1"、"7"、"30"、"90"
  selectedVenues: string[];
  showHighFeeOnly: boolean;
  discountFilter?: "全部状态" | "打折" | "不变" | "分润";
  visibleColumns?: string[];
  onVenueOptionsReady?: (options: { label: string; value: string }[]) => void;
  onFilteredDataChange?: (data: any[]) => void;
  scrollY?: number; // 新增：用于控制表格内容区的垂直滚动高度
};

export default function CustodyStatisticsTable({
  dayRange,
  selectedVenues,
  showHighFeeOnly,
  discountFilter,
  visibleColumns,
  onVenueOptionsReady,
  onFilteredDataChange,
  scrollY,
}: Props) {
  // console.log("selectedVenues >> >>", selectedVenues);
  const navigate = useNavigate();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  // 根据父组件 dayRange 组装后端需要的 timeRange，例如 "7days"
  const timeRange = useMemo(() => `${dayRange}`, [dayRange]);
  const { data: statisticsData, error, isLoading } = useDailyHostingFeeRatioList(timeRange, poolType);

  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  // const [discountFilter, setDiscountFilter] = useState<"全部" | "打折" | "不变" | "分润">("全部");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [alertMessage, setAlertMessage] = useState("");
  // remove local selectedVenues/showHighFeeOnly state
  const venueOptions = useMemo(() => {
    const names = Array.from(new Set(tableData.map((i: any) => i.venue_name))).filter(Boolean) as string[];
    return names.map((name) => ({ label: name, value: name }));
  }, [tableData]);

  // notify parent when venue options ready
  useEffect(() => {
    onVenueOptionsReady?.(venueOptions);
  }, [venueOptions, onVenueOptionsReady]);

  useEffect(() => {
    // console.log("newest", statisticsData);
    setTableData([]);
    setFilteredData([]);
    if (statisticsData && statisticsData.data) {
      setAlertMessage("");
      // console.log("statisticsData >> ", statisticsData.data[0].date);
      const newData = statisticsData.data.map(
        (item: {
          date: any;
          venue_id: any;
          venue_name: any;
          hash: any;
          income_btc: any;
          managed_unit_price: any;
          power_consumption: any;
          nominal_power_consumption: any;
          power_consumption_diff: any;
          total_hosting_fee: any;
          total_income_usd: any;
          net_income: any;
          hosting_fee_ratio: any;
          discount_status: any;
          period_type: any;
          discount_price: any;
          discount_hosting_fee_ratio: any;
          discount_cost_ratio: any;
          downclock_discount_hosting_fee_ratio: any;
          downclock_discount_cost_ratio: any;
          downclock_discount: any;
          downclock_price_ranges: any;
          downclock_before_profit: any;
          downclock_after_profit: any;
          shutdown_price: any;
        }) => ({
          // 使用 复合键 确保每行唯一，避免 React 重复 key 警告
          key: `${item.venue_id}-${item.date}`,
          venue_name: item.venue_name,
          venue_id: item.venue_id,
          power_consumption: item.power_consumption,
          nominal_power_consumption: item.nominal_power_consumption,
          power_consumption_diff: item.power_consumption_diff,
          // energy_ratio: item.power_consumption,
          basic_hosting_fee: item.managed_unit_price,
          hash: item.hash,
          total_hosting_fee: item.total_hosting_fee,
          total_income_btc: item.income_btc,
          total_income_usd: item.total_income_usd,
          net_income: item.net_income,
          hosting_fee_ratio: item.hosting_fee_ratio,
          report_date: item.date,
          discount_status: item.discount_status,
          period_type: item.period_type,
          discount_price: item.discount_price,
          discount_hosting_fee_ratio: item.discount_hosting_fee_ratio,
          discount_cost_ratio: item.discount_cost_ratio,
          downclock_discount_hosting_fee_ratio: item.downclock_discount_hosting_fee_ratio,
          downclock_discount_cost_ratio: item.downclock_discount_cost_ratio,
          downclock_discount: item.downclock_discount,
          downclock_price_ranges: item.downclock_price_ranges,
          downclock_before_profit: item.downclock_before_profit,
          downclock_after_profit: item.downclock_after_profit,
          shutdown_price: item.shutdown_price,
        }),
      );
      setTableData(newData);
    } else {
      setTableData([]);
      const now = new Date();
      const hour = now.getHours();
      if (timeRange === "1days" && hour < 10) {
        setAlertMessage("今日数据处理中，请稍后查看，或者查看近三天的数据");
      } else {
        setAlertMessage("");
      }
    }
  }, [statisticsData, timeRange]);

  useEffect(() => {
    const groupKeys = [
      "discount_status",
      "discount_price",
      "discount_hosting_fee_ratio",
      "discount_cost_ratio",
    ];
    const visibleGroupKeys =
      Array.isArray(visibleColumns) && visibleColumns.length > 0
        ? groupKeys.filter((k) => (visibleColumns as string[]).includes(k))
        : groupKeys;
    const groupFirstKey = visibleGroupKeys[0];
    const groupLastKey = visibleGroupKeys[visibleGroupKeys.length - 1];
    const greenGroupKeys = [
      "downclock_discount",
      "downclock_discount_hosting_fee_ratio",
      "downclock_discount_cost_ratio",
      "shutdown_price",
      "downclock_price_ranges",
      "downclock_before_profit",
      "downclock_after_profit",
    ];
    const visibleGreenGroupKeys =
      Array.isArray(visibleColumns) && visibleColumns.length > 0
        ? greenGroupKeys.filter((k) => (visibleColumns as string[]).includes(k))
        : greenGroupKeys;
    const greenGroupFirstKey = visibleGreenGroupKeys[0];
    const greenGroupLastKey = visibleGreenGroupKeys[visibleGreenGroupKeys.length - 1];
    const allColumns = [
      // {
      //   title: (
      //     <span className="fee-ratio-title" style={{ padding: 0, margin: 0 }}>
      //       No
      //     </span>
      //   ),
      //   dataIndex: "index",
      //   key: "index",
      //   onHeaderCell: () => ({ className: "fee-ratio-header" }),
      //   width: 55,
      //   render: (_: any, __: any, index: number) => {
      //     return <span>{(currentPage - 1) * pageSize + index + 1}</span>;
      //   },
      // },
      {
        title: <span className="fee-ratio-title">场地名</span>,
        dataIndex: "venue_name",
        key: "venue_name",
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        width: 200,
        sorter: (a: any, b: any) => a.venue_name.localeCompare(b.venue_name),
        render: (text: string) => {
          const isSpecialVenue = text === "Arct-HF01-J XP-AR-US" || text === "ARCT Technologies-HF02-AR-US";
          return (
            <Tooltip
              title={text}
              placement="top"
              overlayInnerStyle={{ color: "white" }}
              style={{ color: "white" }}
            >
              <div
                style={{
                  width: "200px",
                  overflow: "hidden",
                  color: isSpecialVenue ? "red" : "#333",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: isSpecialVenue ? "bold" : "normal",
                }}
              >
                {isSpecialVenue && (
                  <Tag color="red" style={{ marginLeft: 2 }}>
                    补充
                  </Tag>
                )}
                <span>{text}</span>
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: <span className="fee-ratio-title">24h算力</span>,
        dataIndex: "hash",
        key: "hash",
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        width: 140,
        sorter: (a: any, b: any) =>
          (typeof a.hash === "number" ? a.hash : parseFloat(a.hash)) -
          (typeof b.hash === "number" ? b.hash : parseFloat(b.hash)),
        render: (text: any) => (
          <span>
            <span>{formatHashrate(text, "TH", 2, "EH")}</span>
          </span>
        ),
      },
      {
        title: <span className="fee-ratio-title">收益(BTC/USD/净USD)</span>,
        dataIndex: "total_income_btc",
        key: "total_income_btc",
        width: 220,
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        sorter: (a: any, b: any) =>
          (typeof a.total_income_btc === "number" ? a.total_income_btc : parseFloat(a.total_income_btc)) -
          (typeof b.total_income_btc === "number" ? b.total_income_btc : parseFloat(b.total_income_btc)),
        render: (text: any, record: any) => (
          <>
            <Tag color="gold" style={{ marginBottom: 8 }}>
              {text.toFixed(4)}
              <span style={{ marginLeft: 2, color: "rgba(0,0,0,0.45)" }}>BTC</span>
            </Tag>
            <Tag color="green">
              <span style={{ marginRight: 3 }}>{formatAmount(record.total_income_usd, 2, "$")}</span>
              <span style={{ marginLeft: 2, color: "rgba(0,0,0,0.45)" }}>/</span>
              <span style={{ marginLeft: 3 }}>{formatAmount(record.net_income, 2, "$")}</span>
            </Tag>
          </>
        ),
      },
      {
        title: (
          <span className="fee-ratio-title">
            预估功耗
            <Tooltip title="收到的最新一期电费账单总功耗，等于“账单分摊电量/对应期间矿池算力”">
              <InfoCircleOutlined style={{ marginLeft: 6, color: "#999" }} />
            </Tooltip>
          </span>
        ),
        dataIndex: "power_consumption",
        key: "power_consumption",
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        width: 140,
        sorter: (a: any, b: any) =>
          (typeof a.power_consumption === "number" ? a.power_consumption : parseFloat(a.power_consumption)) -
          (typeof b.power_consumption === "number" ? b.power_consumption : parseFloat(b.power_consumption)),
        render: (text: any) => {
          const num = typeof text === "number" ? text : parseFloat(text);
          return <>{Number.isFinite(num) ? num.toFixed(2) : text}</>;
        },
      },
      {
        dataIndex: "nominal_power_consumption",
        key: "nominal_power_consumption",
        title: <span className="fee-ratio-title">额定功耗</span>,
        width: 120,
        // sorter: (a: any, b: any) =>
        //   (typeof a.nominal_power_consumption === "number" ? a.nominal_power_consumption : parseFloat(a.nominal_power_consumption)) -
        //   (typeof b.nominal_power_consumption === "number" ? b.nominal_power_consumption : parseFloat(b.nominal_power_consumption)),
        render: (text: any) => (
          <>
            <span>{text.toFixed(2)}</span>
          </>
        ),
      },
      {
        dataIndex: "power_consumption_diff",
        key: "power_consumption_diff",
        title: <span className="fee-ratio-title">功耗差异</span>,
        width: 120,
        sorter: (a: any, b: any) =>
          (typeof a.power_consumption_diff === "number"
            ? a.power_consumption_diff
            : parseFloat(a.power_consumption_diff)) -
          (typeof b.power_consumption_diff === "number"
            ? b.power_consumption_diff
            : parseFloat(b.power_consumption_diff)),
        render: (text: any) => {
          const num = typeof text === "number" ? text : parseFloat(text);
          return (
            <>
              <span style={{ color: num > 10 ? "red" : "green" }}>
                {Number.isFinite(num) ? num.toFixed(2) : text}%
              </span>
            </>
          );
        },
      },
      {
        dataIndex: "hosting_fee_ratio",
        key: "hosting_fee_ratio",
        title: <span className="fee-ratio-title">总托管费</span>,
        width: 140,
        render: (text: any, record: any) => (
          <span>
            <span style={{ display: "none" }}>{text.toFixed(2)}</span>
            <span>{formatAmount(record.total_hosting_fee, 2, "$")}</span>
          </span>
        ),
      },
      {
        title: <span className="fee-ratio-title">正常托管费占比</span>,
        dataIndex: "hosting_fee_ratio",
        key: "hosting_fee_ratio",
        width: 140,
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        onCell: (record: any) => {
          const val = record?.hosting_fee_ratio;
          const num = typeof val === "number" ? val : parseFloat(val);
          if (!Number.isFinite(num)) return { className: "" };
          if (num >= 100) return { className: "fee-ratio-loss" };
          if (num >= 90) return { className: "fee-ratio-high" };
          if (num < 80) return { className: "fee-ratio-profit" };
          return { className: "fee-ratio-low" };
        },
        render: (text: any) => {
          const num = typeof text === "number" ? text : parseFloat(text);
          return <span>{Number.isFinite(num) ? `${num.toFixed(2)}%` : `${text}%`}</span>;
        },
        sorter: (a: any, b: any) => {
          const av =
            typeof a.hosting_fee_ratio === "number" ? a.hosting_fee_ratio : parseFloat(a.hosting_fee_ratio);
          const bv =
            typeof b.hosting_fee_ratio === "number" ? b.hosting_fee_ratio : parseFloat(b.hosting_fee_ratio);
          return av - bv;
        },
      },
      {
        title: <span className="fee-ratio-title">正常托管单价</span>,
        dataIndex: "basic_hosting_fee",
        key: "basic_hosting_fee",
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        width: 120,
        sorter: (a: any, b: any) =>
          (typeof a.basic_hosting_fee === "number" ? a.basic_hosting_fee : parseFloat(a.basic_hosting_fee)) -
          (typeof b.basic_hosting_fee === "number" ? b.basic_hosting_fee : parseFloat(b.basic_hosting_fee)),
        render: (text: any) => {
          const num = typeof text === "number" ? text : parseFloat(text);
          return <>{"$ " + (Number.isFinite(num) ? num.toFixed(4) : text)}</>;
        },
      },
      {
        title: (
          <span className="fee-ratio-title">
            预期折扣效果
            <Tooltip title="假定寄售期均可执行分润1%策略">
              <InfoCircleOutlined style={{ marginLeft: 6, color: "#999" }} />
            </Tooltip>
          </span>
        ),
        width: 130,
        dataIndex: "discount_status",
        key: "discount_status",
        onHeaderCell: () => ({
          className: `fee-blue-header border-t border-slate-200 ${
            groupFirstKey === "discount_status" ? "border-l border-slate-200" : ""
          } ${groupLastKey === "discount_status" ? "border-r border-slate-200" : ""}`,
        }),
        onCell: () => ({
          className: `bg-indigo-50/30 ${
            groupFirstKey === "discount_status" ? "border-l border-slate-200" : ""
          } ${groupLastKey === "discount_status" ? "border-r border-slate-200" : ""}`,
        }),
        render: (text: any) => {
          // 允许后端返回英文或中文状态，统一到三类：打折、不变、分润
          const status = String(text || "").toUpperCase();
          let label = "不变";
          let color: any = "default";

          if (status.includes("DISCOUNT") || text.includes("打折")) {
            label = text;
            color = "green"; // 打折：绿色
          } else if (status.includes("PROFIT") || text === "分润") {
            label = "分润";
            color = "geekblue"; // 分润：蓝色
          } else {
            label = "不变";
            color = "orange"; // 不变：橙色
          }

          return <Tag color={color}>{label}</Tag>;
        },
      },
      {
        title: (
          <span className="fee-ratio-title">
            预估执行托管单价{" "}
            <Tooltip title="寄售期统一依据我方留存收入1%作为利润、收入99%用于支付托管运维费倒推托管单价">
              <InfoCircleOutlined style={{ marginLeft: 6, color: "#999" }} />
            </Tooltip>
          </span>
        ),
        width: 150,
        dataIndex: "discount_price",
        key: "discount_price",
        onHeaderCell: () => ({
          className: `fee-blue-header border-t border-slate-200 ${
            groupFirstKey === "discount_price" ? "border-l border-slate-200" : ""
          } ${groupLastKey === "discount_price" ? "border-r border-slate-200" : ""}`,
        }),
        onCell: () => ({
          className: `bg-indigo-50/30 ${
            groupFirstKey === "discount_price" ? "border-l border-slate-200" : ""
          } ${groupLastKey === "discount_price" ? "border-r border-slate-200" : ""}`,
        }),
        render: (text: any, row: any) =>
          Number.isFinite(text) && text !== 0 && row.discount_status !== "不变"
            ? "$ " + text.toFixed(4)
            : "--",
        // render: (text: any) => ((Number.isFinite(text) && text !== 0 ? "$ " + text.toFixed(4) : "--")),
        // render: (text: any) => ((Number.isFinite(text) && text !== 0 ? "$ " + text.toFixed(4) : "--")),
      },
      {
        title: (
          <span className="fee-ratio-title">
            折后托管费占比{" "}
            <Tooltip title="等于“打折或分润后托管费/（该期产币数*平均币价）”">
              <InfoCircleOutlined style={{ marginLeft: 6, color: "#999" }} />
            </Tooltip>
          </span>
        ),
        width: 140,
        dataIndex: "discount_hosting_fee_ratio",
        key: "discount_hosting_fee_ratio",
        onHeaderCell: () => ({
          className: `fee-blue-header border-t border-slate-200 ${
            groupFirstKey === "discount_hosting_fee_ratio" ? "border-l border-slate-200" : ""
          } ${groupLastKey === "discount_hosting_fee_ratio" ? "border-r border-slate-200" : ""}`,
        }),
        onCell: () => ({
          className: `bg-indigo-50/30 ${
            groupFirstKey === "discount_hosting_fee_ratio" ? "border-l border-slate-200" : ""
          } ${groupLastKey === "discount_hosting_fee_ratio" ? "border-r border-slate-200" : ""}`,
        }),
        // onCell: (record: any) => {
        //   const val = record?.discount_hosting_fee_ratio;
        //   const num = typeof val === "number" ? val : parseFloat(val);
        //   if (!Number.isFinite(num) || num === 0) return { className: "" };
        //   if (num >= 100) return { className: "fee-ratio-loss" };
        //   if (num >= 90) return { className: "fee-ratio-high" };
        //   if (num < 80) return { className: "fee-ratio-profit" };
        //   return { className: "fee-ratio-low" };
        // },
        render: (text: any, record: any) => {
          const val = record?.discount_hosting_fee_ratio;
          const num = typeof val === "number" ? val : parseFloat(val);
          if (!Number.isFinite(num) || num === 0) return `--`;
          let color: any = "#25252D";
          if (num >= 100) color = "red";
          else if (num >= 90) color = "orange";
          else if (num < 80) color = "green";
          return <span style={{ color }}>{`${num.toFixed(2)}%`}</span>;
        },
      },
      {
        title: (
          <span className="fee-ratio-title">
            折后成本比
            <Tooltip title="等于“（打折或分润后托管费+运维费）/（该期产币数*平均币价）”">
              <InfoCircleOutlined style={{ marginLeft: 6, color: "#999" }} />
            </Tooltip>
          </span>
        ),
        width: 140,
        dataIndex: "discount_cost_ratio",
        key: "discount_cost_ratio",
        onHeaderCell: () => ({
          className: `fee-blue-header border-t border-slate-200 ${
            groupFirstKey === "discount_cost_ratio" ? "border-l border-slate-200" : ""
          } ${groupLastKey === "discount_cost_ratio" ? "border-r border-slate-200" : ""}`,
        }),
        onCell: () => ({
          className: `bg-indigo-50/30 ${
            groupFirstKey === "discount_cost_ratio" ? "border-l border-slate-200" : ""
          } ${groupLastKey === "discount_cost_ratio" ? "border-r border-slate-200" : ""}`,
        }),
        // onCell: (record: any) => {
        //   const val = record?.discount_cost_ratio;
        //   const num = typeof val === "number" ? val : parseFloat(val);
        //   if (!Number.isFinite(num)) return { className: "" };
        //   if (num >= 100) return { className: "fee-ratio-loss" };
        //   if (num >= 90) return { className: "fee-ratio-high" };
        //   if (num < 80) return { className: "fee-ratio-profit" };
        //   return { className: "fee-ratio-low" };
        // },
        render: (text: any, record: any) => {
          const val = record?.discount_cost_ratio;
          const num = typeof val === "number" ? val : parseFloat(val);
          if (!Number.isFinite(num) || num === 0) return `--`;
          let color: any = "#25252D";
          if (num >= 100) color = "red";
          else if (num >= 90) color = "orange";
          else if (num < 80) color = "green";
          return <span style={{ color }}>{`${num.toFixed(2)}%`}</span>;
        },
      },

      {
        title: <span className="fee-ratio-title">降频后折扣</span>,
        width: 120,
        dataIndex: "downclock_discount",
        key: "downclock_discount",
        onHeaderCell: () => ({
          className: [
            "bg-emerald-100/50",
            "fee-green-header",
            "border-t",
            "border-slate-200",
            greenGroupFirstKey === "downclock_discount" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "downclock_discount" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        onCell: () => ({
          className: [
            "bg-emerald-50/30",
            greenGroupFirstKey === "downclock_discount" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "downclock_discount" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        render: (text: any) => {
          // 允许后端返回英文或中文状态，统一到三类：打折、不变、分润
          const status = String(text || "").toUpperCase();
          let label = "不变";
          let color: any = "default";

          if (status.includes("DISCOUNT") || text.includes("打折")) {
            label = text;
            color = "green"; // 打折：绿色
          } else if (status.includes("PROFIT") || text === "分润") {
            label = "分润";
            color = "geekblue"; // 分润：蓝色
          } else {
            label = "不变";
            color = "orange"; // 不变：橙色
          }

          return (
            <div className="">
              <Tag color={color}>{label}</Tag>
            </div>
          );
        },
        // render: (text: any) => (text === "MONTHLY" ? "月" : "日"),
      },
      {
        title: <span className="fee-ratio-title">降频后托管费占比</span>,
        width: 140,
        dataIndex: "downclock_discount_hosting_fee_ratio",
        key: "downclock_discount_hosting_fee_ratio",
        onHeaderCell: () => ({
          className: [
            "bg-emerald-100/50",
            "fee-green-header",
            "border-t",
            "border-slate-200",
            greenGroupFirstKey === "downclock_discount_hosting_fee_ratio" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "downclock_discount_hosting_fee_ratio" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        onCell: () => ({
          className: [
            "bg-emerald-50/30",
            greenGroupFirstKey === "downclock_discount_hosting_fee_ratio" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "downclock_discount_hosting_fee_ratio" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        // onHeaderCell: () => ({ className: "fee-ratio-header" }),
        // onCell: (record: any) => {
        //   const val = record?.downclock_discount_hosting_fee_ratio;
        //   const num = typeof val === "number" ? val : parseFloat(val);
        //   if (!Number.isFinite(num)) return { className: "" };
        //   if (num >= 100) return { className: "fee-ratio-loss" };
        //   if (num >= 90) return { className: "fee-ratio-high" };
        //   if (num < 80) return { className: "fee-ratio-profit" };
        //   return { className: "fee-ratio-low" };
        // },
        render: (text: any, record: any) => {
          const val = record?.downclock_discount_hosting_fee_ratio;
          const num = typeof val === "number" ? val : parseFloat(val);
          if (!Number.isFinite(num) || num === 0) return `--`;
          let color: any = "#25252D";
          if (num >= 100) color = "red";
          else if (num >= 90) color = "orange";
          else if (num < 80) color = "green";
          return (
            <div className="">
              <span style={{ color }}>{`${num.toFixed(2)}%`}</span>
            </div>
          );
        },
      },
      {
        title: <span className="fee-ratio-title">降频后成本比</span>,
        width: 140,
        dataIndex: "downclock_discount_cost_ratio",
        key: "downclock_discount_cost_ratio",
        onHeaderCell: () => ({
          className: [
            "bg-emerald-100/50",
            "fee-green-header",
            "border-t",
            "border-slate-200",
            greenGroupFirstKey === "downclock_discount_cost_ratio" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "downclock_discount_cost_ratio" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        onCell: () => ({
          className: [
            "bg-emerald-50/30",
            greenGroupFirstKey === "downclock_discount_cost_ratio" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "downclock_discount_cost_ratio" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        // onHeaderCell: () => ({ className: "fee-ratio-header" }),
        // onCell: (record: any) => {
        //   const val = record?.downclock_discount_hosting_fee_ratio;
        //   const num = typeof val === "number" ? val : parseFloat(val);
        //   if (!Number.isFinite(num)) return { className: "" };
        //   if (num >= 100) return { className: "fee-ratio-loss" };
        //   if (num >= 90) return { className: "fee-ratio-high" };
        //   if (num < 80) return { className: "fee-ratio-profit" };
        //   return { className: "fee-ratio-low" };
        // },
        render: (text: any, record: any) => {
          const val = record?.downclock_discount_cost_ratio;
          const num = typeof val === "number" ? val : parseFloat(val);
          if (!Number.isFinite(num) || num === 0) return `--`;
          let color: any = "#25252D";
          if (num >= 100) color = "red";
          else if (num >= 90) color = "orange";
          else if (num < 80) color = "green";
          return (
            <div className="">
              <span style={{ color }}>{`${num.toFixed(2)}%`}</span>
            </div>
          );
        },
      },
      {
        title: <span className="fee-ratio-title">关机币价</span>,
        width: 120,
        dataIndex: "shutdown_price",
        key: "shutdown_price",
        onHeaderCell: () => ({
          className: [
            "bg-emerald-100/50",
            "fee-green-header",
            "border-t",
            "border-slate-200",
            greenGroupFirstKey === "shutdown_price" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "shutdown_price" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        onCell: () => ({
          className: [
            "bg-emerald-50/30",
            greenGroupFirstKey === "shutdown_price" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "shutdown_price" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        render: (text: any) => {
          const num = typeof text === "number" ? text : parseFloat(text);
          const content =
            Number.isFinite(num) && num !== 0
              ? num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : `--`;
          return <div className="">{content}</div>;
        },
      },

      {
        title: <span className="fee-ratio-title">降频价格区间</span>,
        width: 120,
        dataIndex: "downclock_price_ranges",
        key: "downclock_price_ranges",
        onHeaderCell: () => ({
          className: [
            "bg-emerald-100/50",
            "fee-green-header",
            "border-t",
            "border-slate-200",
            greenGroupFirstKey === "downclock_price_ranges" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "downclock_price_ranges" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        onCell: () => ({
          className: [
            "bg-emerald-50/30",
            greenGroupFirstKey === "downclock_price_ranges" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "downclock_price_ranges" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        render: (text: any) => {
          if (!Array.isArray(text) || text.length === 0) return `--`;
          const formatted = text
            .map((pair: any) => {
              if (!Array.isArray(pair) || pair.length < 2) return null;
              const a = Math.round(Number(pair[0]));
              const b = Math.round(Number(pair[1]));
              return `[${a},${b}]`;
            })
            .filter(Boolean)
            .join(" ,");
          const content = formatted || `--`;
          return <div className="">{content}</div>;
        },
      },
      {
        title: <span className="fee-ratio-title">降频前利润</span>,
        width: 120,
        dataIndex: "downclock_before_profit",
        key: "downclock_before_profit",
        onHeaderCell: () => ({
          className: [
            "bg-emerald-100/50",
            "fee-green-header",
            "border-t",
            "border-slate-200",
            greenGroupFirstKey === "downclock_before_profit" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "downclock_before_profit" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        onCell: () => ({
          className: [
            "bg-emerald-50/30",
            greenGroupFirstKey === "downclock_before_profit" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "downclock_before_profit" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        render: (text: any) => {
          const content = Number.isFinite(text) && text !== 0 ? `${text.toFixed(2)}` : `--`;
          return <div className="">{content}</div>;
        },
      },
      {
        title: <span className="fee-ratio-title">降频后利润</span>,
        width: 120,
        dataIndex: "downclock_after_profit",
        key: "downclock_after_profit",
        onHeaderCell: () => ({
          className: [
            "bg-emerald-100/50",
            "fee-green-header",
            "border-t",
            "border-slate-200",
            greenGroupFirstKey === "downclock_after_profit" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "downclock_after_profit" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        onCell: () => ({
          className: [
            "bg-emerald-50/30",
            greenGroupFirstKey === "downclock_after_profit" ? "border-l border-slate-200" : "",
            greenGroupLastKey === "downclock_after_profit" ? "border-r border-slate-200" : "",
          ]
            .filter(Boolean)
            .join(" "),
        }),
        render: (text: any) => {
          const content = Number.isFinite(text) && text !== 0 ? `${text.toFixed(2)}` : `--`;
          return <div className="">{content}</div>;
        },
      },
      {
        title: <span className="fee-ratio-title">周期类型</span>,
        width: 120,
        dataIndex: "period_type",
        key: "period_type",
        // render: (text: any) => (text === "MONTHLY" ? "月" : "日"),
      },
      {
        title: <span className="fee-ratio-title">收益日期</span>,
        width: 120,
        dataIndex: "report_date",
        key: "report_date",
        sorter: (a: any, b: any) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime(),
        render: (text: any) => {
          const date = new Date(text);
          const month = date.getMonth() + 1;
          const day = date.getDate();
          return `${month}-${day}`;
        },
      },
    ];
    const cols =
      Array.isArray(visibleColumns) && visibleColumns.length > 0
        ? allColumns.filter((c: any) => !c.key || visibleColumns.includes(c.key))
        : allColumns;
    setColumns(cols);
  }, [timeRange, currentPage, pageSize, visibleColumns]);

  // apply filtering based on parent props
  useEffect(() => {
    // const normalizeLower = (s: any) =>
    //   String(s ?? "")
    //     .trim()
    //     .toLowerCase();
    const normalizeDiscountStatus = (val: any): "打折" | "不变" | "分润" => {
      const s = String(val || "")
        .trim()
        .toUpperCase();
      if (s.includes("DISCOUNT") || s.includes("打折")) return "打折";
      if (s.includes("PROFIT") || s.includes("分润")) return "分润";
      return "不变";
    };

    // const filtered = tableData.filter((item: any) => {
    //   const ratioVal = item?.hosting_fee_ratio;
    //   const ratioNum = typeof ratioVal === "number" ? ratioVal : parseFloat(ratioVal);
    //   const hasSelection = Array.isArray(selectedVenues) && selectedVenues.length > 0;
    //   const matchesSelectedVenues = hasSelection
    //     ? selectedVenues.some(
    //       (name) =>
    //         String(name || "")
    //           .trim()
    //           .toLowerCase().length > 0 &&
    //         String(item?.venue_name || "")
    //           .trim()
    //           .toLowerCase()
    //           .includes(
    //             String(name || "")
    //               .trim()
    //               .toLowerCase(),
    //           ),
    //     )
    //     : true;

    //   // 当选择了场地名时，只按场地过滤；未选择时才考虑“仅高费率”筛选
    //   const passesHighFee = showHighFeeOnly ? ratioNum > 90 : true;

    //   const matchesDiscount =
    //     discountFilter === "全部状态"
    //       ? true
    //       : normalizeDiscountStatus(item?.discount_status) === discountFilter;

    //   return (hasSelection ? matchesSelectedVenues : passesHighFee) && matchesDiscount;
    // });

    const filtered = tableData.filter((item: any) => {
      const ratioNum = Number(item?.hosting_fee_ratio);
      const safeRatio = Number.isFinite(ratioNum) ? ratioNum : 0;

      const cleanVenues = (selectedVenues || [])
        .map((v) =>
          String(v || "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean);

      const hasSelection = cleanVenues.length > 0;

      const matchesSelectedVenues =
        !hasSelection ||
        cleanVenues.some((name) =>
          String(item?.venue_name || "")
            .toLowerCase()
            .includes(name),
        );

      const passesHighFee = showHighFeeOnly && !hasSelection ? safeRatio > 90 : true;

      const matchesDiscount =
        discountFilter === "全部状态"
          ? true
          : normalizeDiscountStatus(item?.discount_status) === discountFilter;

      return matchesSelectedVenues && passesHighFee && matchesDiscount;
    });

    setFilteredData(filtered);
    // 重置到第一页，避免切换场地名后仍停留在旧页码
    setCurrentPage(1);
  }, [tableData, showHighFeeOnly, selectedVenues, discountFilter]);

  // notify parent of filtered data changes
  useEffect(() => {
    onFilteredDataChange?.(filteredData);
  }, [filteredData, onFilteredDataChange]);

  // 当筛选结果更新时，将表格滚动位置复位到顶部，提升可见性
  useEffect(() => {
    const tableBody = document.querySelector(".ant-table-body");
    if (tableBody) {
      (tableBody as HTMLElement).scrollTop = 0;
    }
  }, [filteredData]);

  if (isLoading) {
    return <Spin style={{ marginTop: 20 }} />;
  }
  if (error) {
    return <Alert message="错误" description={error.message} type="error" showIcon />;
  }

  return (
    <div>
      {alertMessage ? (
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">提示：</strong>
          <span className="block sm:inline">{alertMessage}</span>
        </div>
      ) : (
        <Table
          pagination={{
            position: ["bottomCenter"],
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "30", "50"],
            defaultPageSize: 20,
            showTotal: (total) => `共 ${total} 条`,
            total: filteredData?.length,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
              const tableBody = document.querySelector(".ant-table-body");
              if (tableBody) {
                (tableBody as HTMLElement).scrollTop = 0;
              }
            },
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/custody-menu/statisticsDetail/${(record as any).venue_id}`),
            style: { cursor: "pointer" },
          })}
          rowKey={(record) => {
            const rec: any = record as any;
            // 优先使用我们在映射时生成的唯一 key
            if (rec.key) return String(rec.key);
            const vid = rec.venue_id ?? rec.id ?? rec._id ?? rec.miner_name;
            const date = rec.report_date ?? "";
            if (vid) return `${vid}-${date}`;
            return `${Math.random()}-${date}`; // 兜底，尽量减少重复概率
          }}
          columns={columns}
          dataSource={filteredData}
          sticky={{ offsetHeader: 64 }}
          scroll={{ x: "max-content", y: scrollY ?? 480 }}
          style={{ marginTop: "15px", width: "100%" }}
        />
      )}
    </div>
  );
}
