import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Spin, Table, Tag, Tooltip } from "antd";
import { useSelector, useSettingsStore } from "@/stores";
import { formatAmount } from "@/utils/num";

import { useMonthlyCustodyStatisticsList } from "@/pages/custody-statistics/hook/hook.ts";

type Props = {
  month: string; // YYYY-MM
  selectedVenues: string[];
  showHighFeeOnly: boolean;
  onVenueOptionsReady?: (options: { label: string; value: string }[]) => void;
  onFilteredDataChange?: (data: any[]) => void;
  scrollY?: number; // 新增：用于控制表格内容区的垂直滚动高度
};

export default function CustodyStatisticsMonthTable({
  month,
  selectedVenues,
  showHighFeeOnly,
  onVenueOptionsReady,
  onFilteredDataChange,
  scrollY,
}: Props) {
  const navigate = useNavigate();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  // 计算当月的起止日期（YYYY-MM-DD）
  const [startDate, endDate] = useMemo(() => {
    const [y, m] = month.split("-").map((s) => parseInt(s, 10));
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const now = new Date();
    const isCurrentMonth = y === now.getFullYear() && m === now.getMonth() + 1;
    const lastDay = isCurrentMonth ? now.getDate() : new Date(y, m, 0).getDate();
    const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return [start, end];
  }, [month]);

  // 使用按月接口
  const {
    data: statisticsData,
    error,
    isLoading,
  } = useMonthlyCustodyStatisticsList(poolType, startDate, endDate);

  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [alertMessage, setAlertMessage] = useState("");

  const venueOptions = useMemo(() => {
    const names = Array.from(new Set(tableData.map((i: any) => i.venue_name))).filter(Boolean) as string[];
    return names.map((name) => ({ label: name, value: name }));
  }, [tableData]);

  // 通知父组件：场地选项就绪
  useEffect(() => {
    onVenueOptionsReady?.(venueOptions);
  }, [venueOptions, onVenueOptionsReady]);

  // 数据映射
  useEffect(() => {
    setTableData([]);
    setFilteredData([]);
    if (statisticsData && statisticsData.data) {
      setAlertMessage("");
      const newData = statisticsData.data.map((item: any) => ({
        key: item.venue_id,
        venue_name: item.venue_name,
        venue_id: item.venue_id,
        power_consumption: item.power_consumption,
        nominal_power_consumption: item.nominal_power_consumption,
        power_consumption_diff: item.power_consumption_diff,
        energy_ratio: item.power_consumption,
        basic_hosting_fee: item.managed_unit_price,
        hash: item.hash,
        total_hosting_fee: item.total_hosting_fee,
        total_income_btc: item.income_btc,
        total_income_usd: item.total_income_usd,
        net_income: item.net_income,
        hosting_fee_ratio: item.hosting_fee_ratio,
        report_date: item.date,
      }));
      setTableData(newData);
    } else {
      setTableData([]);
      setAlertMessage("");
    }
  }, [statisticsData]);

  // 列定义（分页编号依赖 currentPage/pageSize）
  useEffect(() => {
    setColumns([
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
      // {
      //   title: <span className="fee-ratio-title">24h算力</span>,
      //   dataIndex: "hash",
      //   key: "hash",
      //   onHeaderCell: () => ({ className: "fee-ratio-header" }),
      //   width: "10%",
      //   sorter: (a: any, b: any) =>
      //     (typeof a.hash === "number" ? a.hash : parseFloat(a.hash)) -
      //     (typeof b.hash === "number" ? b.hash : parseFloat(b.hash)),
      //   render: (text: any) => (
      //     <span>
      //       <span>{formatHashrate(text, "TH", 2, "EH")}</span>
      //     </span>
      //   ),
      // },
      {
        title: <span className="fee-ratio-title">收益(BTC/USD/净USD)</span>,
        dataIndex: "total_income_btc",
        key: "total_income_btc",
        width: 280,
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
        title: <span className="fee-ratio-title">预估能耗</span>,
        dataIndex: "energy_ratio",
        key: "energy_ratio",
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        width: 140,
        sorter: (a: any, b: any) =>
          (typeof a.energy_ratio === "number" ? a.energy_ratio : parseFloat(a.energy_ratio)) -
          (typeof b.energy_ratio === "number" ? b.energy_ratio : parseFloat(b.energy_ratio)),
        render: (text: any) => {
          const num = typeof text === "number" ? text : parseFloat(text);
          return <>{Number.isFinite(num) ? num.toFixed(2) : text}</>;
        },
      },
      {
        dataIndex: "nominal_power_consumption",
        key: "nominal_power_consumption",
        title: <span className="fee-ratio-title">额定能耗</span>,
        width: 120,
        render: (text: any) => (
          <>
            <span>{text.toFixed(2)}</span>
          </>
        ),
      },
      {
        dataIndex: "power_consumption_diff",
        key: "power_consumption_diff",
        title: <span className="fee-ratio-title">能耗差异</span>,
        width: 120,
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
        title: <span className="fee-ratio-title">托管费占比</span>,
        dataIndex: "hosting_fee_ratio",
        key: "hosting_fee_ratio",
        width: 140,
        sorter: (a: any, b: any) => {
          const av =
            typeof a.hosting_fee_ratio === "number" ? a.hosting_fee_ratio : parseFloat(a.hosting_fee_ratio);
          const bv =
            typeof b.hosting_fee_ratio === "number" ? b.hosting_fee_ratio : parseFloat(b.hosting_fee_ratio);
          return av - bv;
        },
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        onCell: (record: any) => {
          const val = record?.hosting_fee_ratio;
          const num = typeof val === "number" ? val : parseFloat(val);
          return {
            className: num >= 90 ? "fee-ratio-high" : "fee-ratio-low",
          };
        },
        render: (text: any) => {
          const num = typeof text === "number" ? text : parseFloat(text);
          return <span>{Number.isFinite(num) ? `${num.toFixed(2)}%` : `${text}%`}</span>;
        },
      },
      {
        title: <span className="fee-ratio-title">单价</span>,
        dataIndex: "basic_hosting_fee",
        key: "basic_hosting_fee",
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        width: 120,
        sorter: (a: any, b: any) =>
          (typeof a.basic_hosting_fee === "number" ? a.basic_hosting_fee : parseFloat(a.basic_hosting_fee)) -
          (typeof b.basic_hosting_fee === "number" ? b.basic_hosting_fee : parseFloat(b.basic_hosting_fee)),
        render: (text: any) => {
          const num = typeof text === "number" ? text : parseFloat(text);
          return <>{Number.isFinite(num) ? num.toFixed(2) : text} $/kwh</>;
        },
      },
      // {
      //   title: <span className="fee-ratio-title">收益日期</span>,
      //   width: 120,
      //   dataIndex: "report_date",
      //   key: "report_date",
      //   sorter: (a: any, b: any) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime(),
      //   render: (text: any) => {
      //     const date = new Date(text);
      //     const month = date.getMonth() + 1;
      //     const day = date.getDate();
      //     return `${month}-${day}`;
      //   },
      // },
    ]);
  }, [startDate, endDate, currentPage, pageSize]);

  // 父驱动的筛选条件联动刷新 filteredData
  useEffect(() => {
    const filtered = tableData.filter((item: any) => {
      const ratioVal = item?.hosting_fee_ratio;
      const ratioNum = typeof ratioVal === "number" ? ratioVal : parseFloat(ratioVal);
      const matchesHighFee = showHighFeeOnly ? ratioNum > 90 : true;
      const matchesSelectedVenues =
        selectedVenues.length > 0 ? selectedVenues.includes(item.venue_name) : true;
      return matchesHighFee && matchesSelectedVenues;
    });
    setFilteredData(filtered);
  }, [tableData, showHighFeeOnly, selectedVenues]);

  // 通知父组件：过滤后的数据
  useEffect(() => {
    onFilteredDataChange?.(filteredData);
  }, [filteredData, onFilteredDataChange]);

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
        <>
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
            rowKey={(record) =>
              (record as any).venue_id ||
              (record as any).id ||
              (record as any)._id ||
              (record as any).miner_name ||
              Math.random()
            }
            columns={columns}
            dataSource={filteredData}
            sticky={{ offsetHeader: 64 }}
            scroll={{ x: "max-content", y: scrollY ?? 480 }}
            style={{ marginTop: "15px", width: "100%" }}
          />
        </>
      )}
    </div>
  );
}
