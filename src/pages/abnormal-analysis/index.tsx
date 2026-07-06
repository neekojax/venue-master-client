import { useEffect, useMemo, useState } from "react";
import {
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  EnvironmentOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Col,
  Empty,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { ReactEcharts } from "@/components/react-echarts";
import {
  type AbnormalAnalysisDetailItem,
  type AbnormalAnalysisDetailResponse,
  type AllSiteAnomalyStatsResponse,
  type AnomalyStats,
  fetchAbnormalAnalysisDetail,
  fetchAllSiteAnomalyStats,
  fetchSiteAnomalySiteList,
  fetchSiteAnomalyStats,
  type SiteAnomalySiteListItem,
  type SiteAnomalySiteListResponse,
  type SiteAnomalyStatsResponse,
} from "./api";
import { type SiteInfo, SITES } from "./data";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { useSelector, useSettingsStore } from "@/stores";

import "./index.css";

const { Text } = Typography;

type HistoryPoint = { date: string; abnormalCount: number; onShelfMax?: number; refreshedCount?: number };
type DismantledFilter = "all" | "在架" | "下架" | "未知";
type AssetFilter = "all" | "自有" | "非自有" | "未知";

function safeSiteAnomalyList(data: SiteAnomalySiteListResponse | null): SiteAnomalySiteListItem[] {
  return Array.isArray(data?.list) ? data.list : [];
}

function safeDailyPoints(data: AllSiteAnomalyStatsResponse | null) {
  return Array.isArray(data?.dailyLast30Days) ? data.dailyLast30Days : [];
}

function safeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function statsCards(stats: SiteInfo["abnormalStats"]) {
  return [
    { label: "最近1日异常", val: stats.yesterday, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "最近7日异常", val: stats.day7, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "最近15日异常", val: stats.day15, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "最近30日异常", val: stats.day30, color: "text-slate-600", bg: "bg-slate-100" },
    { label: "累计异常", val: stats.all, color: "text-purple-600", bg: "bg-purple-50" },
  ].map((item, idx) => (
    <div
      key={idx}
      className={`p-2 px-3 rounded-lg border border-slate-100/80 ${item.bg} transition-all hover:scale-[1.02] flex flex-col justify-between ${
        idx === 4 ? "col-span-2 sm:col-span-1" : ""
      }`}
    >
      <div className="text-[11px] text-slate-500 font-medium mb-0.5">{item.label}</div>
      <div className={`text-lg font-bold font-mono ${item.color}`}>
        {item.val} <span className="text-[10px] font-sans text-slate-400 font-normal">台</span>
      </div>
    </div>
  ));
}

function buildLineOption(data: HistoryPoint[], lineColor: string, tooltipBg: string) {
  return {
    tooltip: {
      trigger: "axis",
      backgroundColor: tooltipBg,
      borderRadius: 8,
      borderWidth: 0,
      textStyle: { color: "#f8fafc" },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        const point = data[p.dataIndex];
        if (!point) return "";
        const onShelf = point.onShelfMax ?? "-";
        const refreshed = point.refreshedCount ?? "-";
        return `${point.date}<br/>异常矿机数：${point.abnormalCount}<br/>期望在架：${onShelf}<br/>刷新数：${refreshed}`;
      },
    },
    grid: { left: 0, right: 10, top: 8, bottom: 0, containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.map((d) => d.date),
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      axisTick: { show: false },
      axisLabel: { color: "#64748b", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#64748b", fontSize: 11 },
      splitLine: { lineStyle: { color: "#e2e8f0", type: "dashed" } },
    },
    series: [
      {
        name: "异常矿机数",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        data: data.map((d) => d.abnormalCount),
        lineStyle: { color: lineColor, width: 2.5 },
        itemStyle: { color: lineColor },
      },
    ],
  };
}

export default function AbnormalAnalysisPage() {
  useAuthRedirect();

  // 场地异常统计选中场地
  const [selectedSiteName, setSelectedSiteName] = useState<string>(SITES[0].name);
  // 全场统计：真实接口数据（昨日/7日/15日/30日/全部 + 最近30日逐日曲线）
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [allSiteData, setAllSiteData] = useState<AllSiteAnomalyStatsResponse | null>(null);
  const [allSiteLoading, setAllSiteLoading] = useState(false);
  const [siteAnomalyListData, setSiteAnomalyListData] = useState<SiteAnomalySiteListResponse | null>(null);
  const [siteAnomalyListLoading, setSiteAnomalyListLoading] = useState(false);
  const [selectedSiteData, setSelectedSiteData] = useState<SiteAnomalyStatsResponse | null>(null);
  const [selectedSiteLoading, setSelectedSiteLoading] = useState(false);
  const [detailData, setDetailData] = useState<AbnormalAnalysisDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailPage, setDetailPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(10);

  useEffect(() => {
    if (!poolType) return;
    let active = true;
    setAllSiteLoading(true);
    fetchAllSiteAnomalyStats(poolType)
      .then((res) => {
        if (active) setAllSiteData((res?.data as AllSiteAnomalyStatsResponse) ?? null);
      })
      .catch((err) => {
        console.log("allSiteAnomalyStats error", err);
        if (active) setAllSiteData(null);
      })
      .finally(() => {
        if (active) setAllSiteLoading(false);
      });
    return () => {
      active = false;
    };
  }, [poolType]);

  useEffect(() => {
    if (!poolType) return;
    let active = true;
    setSiteAnomalyListLoading(true);
    fetchSiteAnomalySiteList(poolType)
      .then((res) => {
        if (active) {
          const data = (res?.data as SiteAnomalySiteListResponse) ?? null;
          const list = safeSiteAnomalyList(data);
          setSiteAnomalyListData(data);
          const firstSiteName = list[0]?.siteName;
          if (firstSiteName) {
            setSelectedSiteName((current) => {
              const exists = list.some((item) => item.siteName === current);
              return exists ? current : firstSiteName;
            });
          }
        }
      })
      .catch((err) => {
        console.log("siteAnomalySiteList error", err);
        if (active) setSiteAnomalyListData(null);
      })
      .finally(() => {
        if (active) setSiteAnomalyListLoading(false);
      });
    return () => {
      active = false;
    };
  }, [poolType]);

  // 搜索筛选参数
  const [searchSite, setSearchSite] = useState<string>("all");
  const [searchMac, setSearchMac] = useState<string>("");
  const [searchSN, setSearchSN] = useState<string>("");
  const [searchMinerId, setSearchMinerId] = useState<string>("");
  const [searchDismantled, setSearchDismantled] = useState<DismantledFilter>("all");
  const [searchAsset, setSearchAsset] = useState<AssetFilter>("all");

  // 已应用的筛选（点击搜索后生效）
  const [filters, setFilters] = useState({
    site: "all" as string,
    mac: "",
    sn: "",
    minerId: "",
    dismantled: "all" as DismantledFilter,
    asset: "all" as AssetFilter,
  });

  const handleSearch = () => {
    setDetailPage(1);
    setFilters({
      site: searchSite,
      mac: searchMac.trim(),
      sn: searchSN.trim(),
      minerId: searchMinerId.trim(),
      dismantled: searchDismantled,
      asset: searchAsset,
    });
    message.success("筛选已应用");
  };

  const handleReset = () => {
    setDetailPage(1);
    setSearchSite("all");
    setSearchMac("");
    setSearchSN("");
    setSearchMinerId("");
    setSearchDismantled("all");
    setSearchAsset("all");
    setFilters({
      site: "all",
      mac: "",
      sn: "",
      minerId: "",
      dismantled: "all",
      asset: "all",
    });
    message.info("筛选已重置");
  };

  useEffect(() => {
    if (!poolType) return;
    let active = true;
    setDetailLoading(true);
    fetchAbnormalAnalysisDetail(poolType, {
      ...(filters.site !== "all" ? { siteName: filters.site } : {}),
      ...(filters.mac ? { mac: filters.mac } : {}),
      ...(filters.sn ? { controlBoardSN: filters.sn } : {}),
      ...(filters.minerId ? { minerId: filters.minerId } : {}),
      ...(filters.dismantled !== "all" ? { isDismantled: filters.dismantled } : {}),
      ...(filters.asset !== "all" ? { assetOwnership: filters.asset } : {}),
      page: detailPage,
      pageSize: detailPageSize,
    })
      .then((res) => {
        if (active) setDetailData((res?.data as AbnormalAnalysisDetailResponse) ?? null);
      })
      .catch((err) => {
        console.log("abnormalAnalysisDetail error", err);
        if (active) setDetailData(null);
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });
    return () => {
      active = false;
    };
  }, [detailPage, detailPageSize, filters, poolType]);

  const detailList = useMemo<AbnormalAnalysisDetailItem[]>(
    () => (Array.isArray(detailData?.list) ? detailData!.list : []),
    [detailData],
  );
  const detailTotal = typeof detailData?.total === "number" ? detailData.total : detailList.length;

  const selectedSite = useMemo((): SiteInfo => {
    return SITES.find((s) => s.name === selectedSiteName) || SITES[0];
  }, [selectedSiteName]);

  const siteAnomalyList = useMemo(() => safeSiteAnomalyList(siteAnomalyListData), [siteAnomalyListData]);
  const hasSiteListData = siteAnomalyList.length > 0;

  const selectedSiteSummary = useMemo((): SiteAnomalySiteListItem | null => {
    return siteAnomalyList.find((site) => site.siteName === selectedSiteName) ?? null;
  }, [selectedSiteName, siteAnomalyList]);

  useEffect(() => {
    if (!poolType || !selectedSiteSummary?.siteCode) {
      setSelectedSiteData(null);
      setSelectedSiteLoading(false);
      return;
    }
    let active = true;
    setSelectedSiteLoading(true);
    fetchSiteAnomalyStats(poolType, selectedSiteSummary.siteCode)
      .then((res) => {
        if (active) setSelectedSiteData((res?.data as SiteAnomalyStatsResponse) ?? null);
      })
      .catch((err) => {
        console.log("siteAnomalyStats error", err);
        if (active) setSelectedSiteData(null);
      })
      .finally(() => {
        if (active) setSelectedSiteLoading(false);
      });
    return () => {
      active = false;
    };
  }, [poolType, selectedSiteSummary?.siteCode]);

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${type} 已复制到剪贴板`);
  };

  // 全场折线图：基于真实接口的 dailyLast30Days（逐日 anomaly）
  const globalLineData: HistoryPoint[] = useMemo(
    () =>
      safeDailyPoints(allSiteData).map((d) => ({
        date: d.date,
        abnormalCount: d.anomaly,
        onShelfMax: d.onShelfMax,
        refreshedCount: d.refreshedCount,
      })),
    [allSiteData],
  );
  const globalLineOption = useMemo(
    () => buildLineOption(globalLineData, "#4f46e5", "#0f172a"),
    [globalLineData],
  );
  const hasAllSiteTrendData = globalLineData.length > 0;
  const selectedSiteLineData: HistoryPoint[] = useMemo(() => {
    const apiPoints = Array.isArray(selectedSiteData?.dailyLast30Days)
      ? selectedSiteData!.dailyLast30Days
      : [];
    if (apiPoints.length > 0) {
      return apiPoints.map((d) => ({
        date: d.date,
        abnormalCount: d.anomaly,
        onShelfMax: d.onShelfMax,
        refreshedCount: d.refreshedCount,
      }));
    }
    return selectedSite.history30Days;
  }, [selectedSite.history30Days, selectedSiteData]);
  const siteLineOption = useMemo(
    () => buildLineOption(selectedSiteLineData, "#0d9488", "#134e4a"),
    [selectedSiteLineData],
  );
  const hasSelectedSiteTrendData = selectedSiteLineData.length > 0;

  const selectedSiteStatsCards = useMemo(() => {
    if (selectedSiteData?.stats) {
      const stats = selectedSiteData.stats;
      const windows = [
        {
          label: "最近1日异常",
          val: stats.yesterday?.anomaly ?? 0,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
        {
          label: "最近7日异常",
          val: stats.last7Days?.anomaly ?? 0,
          color: "text-orange-600",
          bg: "bg-orange-50",
        },
        {
          label: "最近15日异常",
          val: stats.last15Days?.anomaly ?? 0,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          label: "最近30日异常",
          val: stats.last30Days?.anomaly ?? 0,
          color: "text-slate-600",
          bg: "bg-slate-100",
        },
        { label: "累计异常", val: stats.allTime?.anomaly ?? 0, color: "text-purple-600", bg: "bg-purple-50" },
      ];
      return windows.map((item, idx) => (
        <div
          key={idx}
          className={`p-2 px-3 rounded-lg border border-slate-100/80 ${item.bg} transition-all hover:scale-[1.02] flex flex-col justify-between ${
            idx === 4 ? "col-span-2 sm:col-span-1" : ""
          }`}
        >
          <div className="text-[11px] text-slate-500 font-medium mb-0.5">{item.label}</div>
          <div className={`text-lg font-bold font-mono ${item.color}`}>
            {item.val} <span className="text-[10px] font-sans text-slate-400 font-normal">台</span>
          </div>
        </div>
      ));
    }

    if (selectedSiteSummary) {
      const windows = [
        { label: "全部异常", val: selectedSiteSummary.anomaly, color: "text-rose-600", bg: "bg-rose-50" },
        {
          label: "期望在架",
          val: selectedSiteSummary.onShelfMax,
          color: "text-slate-700",
          bg: "bg-slate-100",
        },
        {
          label: "刷新数",
          val: selectedSiteSummary.refreshedCount,
          color: "text-teal-700",
          bg: "bg-teal-50",
        },
        {
          label: "异常比例",
          val: `${selectedSiteSummary.anomalyRatio}%`,
          color: "text-amber-700",
          bg: "bg-amber-50",
        },
      ];
      return windows.map((item, idx) => (
        <div
          key={idx}
          className={`p-2 px-3 rounded-lg border border-slate-100/80 ${item.bg} transition-all hover:scale-[1.02] flex flex-col justify-between`}
        >
          <div className="text-[11px] text-slate-500 font-medium mb-0.5">{item.label}</div>
          <div className={`text-lg font-bold font-mono ${item.color}`}>
            {item.val}
            {typeof item.val === "number" ? (
              <span className="text-[10px] font-sans text-slate-400 font-normal"> 台</span>
            ) : null}
          </div>
        </div>
      ));
    }

    return statsCards(selectedSite.abnormalStats);
  }, [selectedSite.abnormalStats, selectedSiteData, selectedSiteSummary]);

  const columns = [
    {
      title: "场地",
      dataIndex: "site",
      key: "site",
      render: (text: string) => (
        <span className="font-medium text-slate-700 flex items-center gap-1.5">
          <EnvironmentOutlined className="text-slate-400" />
          {text}
        </span>
      ),
    },
    {
      title: "MAC 地址",
      dataIndex: "mac",
      key: "mac",
      render: (text: string) => (
        <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 flex items-center justify-between group max-w-[170px]">
          <span>{text}</span>
          <Tooltip title="复制 MAC">
            <CopyOutlined
              className="text-slate-400 hover:text-blue-500 cursor-pointer ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleCopyText(text, "MAC 地址")}
            />
          </Tooltip>
        </span>
      ),
    },
    {
      title: "控制板 SN",
      dataIndex: "controlBoardSN",
      key: "controlBoardSN",
      render: (text: string) => (
        <span className="font-mono text-xs text-slate-500 flex items-center justify-between group max-w-[150px]">
          <span>{text}</span>
          <Tooltip title="复制 SN">
            <CopyOutlined
              className="text-slate-400 hover:text-blue-500 cursor-pointer ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleCopyText(text, "控制板 SN")}
            />
          </Tooltip>
        </span>
      ),
    },
    {
      title: "机型",
      dataIndex: "model",
      key: "model",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "矿工号",
      dataIndex: "minerCode",
      key: "minerCode",
      render: (value: string[]) => {
        const list = safeStringArray(value);
        if (list.length === 0) return <span className="text-slate-400">-</span>;
        const text = list.join(", ");
        return (
          <span className="font-semibold text-slate-800 flex items-center justify-between gap-2 group max-w-[220px]">
            <span className="truncate">{text}</span>
            <Tooltip title="复制矿工号">
              <CopyOutlined
                className="text-slate-400 hover:text-blue-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopyText(text, "矿工号")}
              />
            </Tooltip>
          </span>
        );
      },
    },
    {
      title: "IP 地址",
      dataIndex: "ipAddress",
      key: "ipAddress",
      render: (value: string[]) => {
        const list = safeStringArray(value);
        if (list.length === 0) return <span className="text-slate-400">-</span>;
        const text = list.join(", ");
        return (
          <span className="font-mono text-xs text-slate-600 flex items-center justify-between gap-2 group max-w-[220px]">
            <span className="truncate">{text}</span>
            <Tooltip title="复制 IP">
              <CopyOutlined
                className="text-slate-400 hover:text-blue-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopyText(text, "IP 地址")}
              />
            </Tooltip>
          </span>
        );
      },
    },
    {
      title: "刷新时间",
      dataIndex: "refreshTime",
      key: "refreshTime",
      sorter: (a: AbnormalAnalysisDetailItem, b: AbnormalAnalysisDetailItem) =>
        String(a.refreshTime || "").localeCompare(String(b.refreshTime || "")),
      defaultSortOrder: "descend" as const,
      render: (text: string, record: AbnormalAnalysisDetailItem) => {
        if (record.isDismantled === "下架") {
          return <span className="text-slate-400">-</span>;
        }
        return (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-700 font-medium">{text || "-"}</span>
          </div>
        );
      },
    },
    {
      title: "是否下架",
      dataIndex: "isDismantled",
      key: "isDismantled",
      render: (text: string) => {
        if (text === "下架") {
          return (
            <Tag color="error" icon={<CloseCircleOutlined />}>
              下架
            </Tag>
          );
        } else if (text === "在架") {
          return (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              在架
            </Tag>
          );
        } else {
          return (
            <Tag color="warning" icon={<QuestionCircleOutlined />}>
              未知
            </Tag>
          );
        }
      },
    },
    {
      title: "下架时间",
      dataIndex: "dismantledTime",
      key: "dismantledTime",
      render: (text: string) => <span className="text-xs text-slate-500">{text}</span>,
    },
    {
      title: "产权",
      dataIndex: "assetOwnership",
      key: "assetOwnership",
      render: (text: string) => {
        let color = "default";
        if (text === "自有") color = "processing";
        else if (text === "非自有") color = "warning";
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  // 全场统计卡片：基于真实接口的五个时间窗口（anomaly 为异常矿机数）
  const allSiteStatsCards = (stats?: AnomalyStats) => {
    const windows = [
      { label: "最近1日异常", val: stats?.yesterday?.anomaly ?? 0, color: "text-rose-600", bg: "bg-rose-50" },
      {
        label: "最近7日异常",
        val: stats?.last7Days?.anomaly ?? 0,
        color: "text-orange-600",
        bg: "bg-orange-50",
      },
      {
        label: "最近15日异常",
        val: stats?.last15Days?.anomaly ?? 0,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
      },
      {
        label: "最近30日异常",
        val: stats?.last30Days?.anomaly ?? 0,
        color: "text-slate-600",
        bg: "bg-slate-100",
      },
      { label: "累计异常", val: stats?.allTime?.anomaly ?? 0, color: "text-purple-600", bg: "bg-purple-50" },
    ];
    return windows.map((item, idx) => (
      <div
        key={idx}
        className={`p-2 px-3 rounded-lg border border-slate-100/80 ${item.bg} transition-all hover:scale-[1.02] flex flex-col justify-between ${
          idx === 4 ? "col-span-2 sm:col-span-1" : ""
        }`}
      >
        <div className="text-[11px] text-slate-500 font-medium mb-0.5">{item.label}</div>
        <div className={`text-lg font-bold font-mono ${item.color}`}>
          {item.val} <span className="text-[10px] font-sans text-slate-400 font-normal">台</span>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-full bg-slate-50 -m-4 p-6 flex flex-col gap-6">
      <div className="max-w-[1600px] mx-auto w-full space-y-6">
        <Row gutter={[20, 20]}>
          {/* 左侧: 全场统计 + 场地异常统计 */}
          <Col xs={24} lg={16} xl={17} className="space-y-6">
            {/* 1. 全场统计 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                  <span className="text-sm font-bold text-slate-800">全场统计</span>
                </div>
                <Tag color="purple">全部场地 · {allSiteData?.siteCount ?? "-"} 个</Tag>
              </div>
              <Spin spinning={allSiteLoading} tip="全场统计加载中...">
                <div className="p-3.5">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                    {allSiteStatsCards(allSiteData?.stats)}
                  </div>
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between mb-2">
                      <Text className="text-xs font-bold text-slate-500 font-mono">
                        全场折线图 (最近30日折线图)
                      </Text>
                      <span className="text-[11px] text-slate-400">实时更新</span>
                    </div>
                    <div className="h-[135px] w-full">
                      {hasAllSiteTrendData ? (
                        <ReactEcharts option={globalLineOption} />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无全场趋势数据" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Spin>
            </div>

            {/* 2. XX场地异常统计 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden border-t-2 border-t-teal-500">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-teal-600 rounded-full"></div>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedSiteSummary?.siteName ?? selectedSiteName}异常统计
                  </span>
                </div>
                <Tag color="cyan">
                  {selectedSiteSummary?.siteCode ?? (hasSiteListData ? "当前场地" : "暂无数据")}
                </Tag>
              </div>
              <Spin spinning={selectedSiteLoading} tip="场地统计加载中...">
                <div className="p-3.5">
                  {hasSiteListData ? (
                    <>
                      <div
                        className={`grid gap-2 mb-3 ${
                          selectedSiteData?.stats
                            ? "grid-cols-2 sm:grid-cols-5"
                            : "grid-cols-2 sm:grid-cols-4"
                        }`}
                      >
                        {selectedSiteStatsCards}
                      </div>
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between mb-2">
                          <Text className="text-xs font-bold text-slate-500 font-mono">
                            {selectedSiteName}折线图 (最近30日折线图)
                          </Text>
                          {selectedSiteData?.stats ? (
                            <span className="text-xs text-teal-600 font-medium">
                              30日异常: {selectedSiteData.stats.last30Days?.anomaly ?? 0} 台
                            </span>
                          ) : selectedSiteSummary ? (
                            <span className="text-xs text-teal-600 font-medium">
                              期望在架: {selectedSiteSummary.onShelfMax} 台
                            </span>
                          ) : (
                            <span className="text-xs text-teal-600 font-medium">
                              矿机总数: {selectedSite.totalRigs} 台
                            </span>
                          )}
                        </div>
                        <div className="h-[135px] w-full">
                          {hasSelectedSiteTrendData ? (
                            <ReactEcharts option={siteLineOption} />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无场地趋势数据" />
                            </div>
                          )}
                        </div>
                        {selectedSiteSummary && !selectedSiteData?.stats ? (
                          <div className="mt-2 text-[11px] text-slate-400">
                            当前仅场地列表接入真实接口，单场地最近30日曲线仍使用页面示例数据。
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <div className="py-10">
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无场地异常数据" />
                    </div>
                  )}
                </div>
              </Spin>
            </div>
          </Col>

          {/* 右侧: 场地列表 */}
          <Col xs={24} lg={8} xl={7}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <SlidersOutlined className="text-slate-500" />
                  <span className="text-sm font-bold text-slate-800">场地列表</span>
                </div>
                <Badge count={siteAnomalyListData?.total ?? 0} color="#0f172a" />
              </div>
              <Spin spinning={siteAnomalyListLoading} tip="场地列表加载中...">
                <div className="p-3.5 flex flex-col flex-1">
                  <div className="text-xs text-slate-400 mb-3 font-mono leading-relaxed">
                    点击下方场地卡片，查看该场地昨日异常汇总
                  </div>
                  <div className="abnormal-slider flex flex-col gap-3 overflow-y-auto pr-1 max-h-[505px]">
                    {hasSiteListData ? (
                      siteAnomalyList.map((site) => {
                        const isSelected = selectedSiteName === site.siteName;
                        const normalCount = site.onShelfMax - Math.max(site.anomaly, 0);
                        const barPercent =
                          site.onShelfMax > 0
                            ? Math.min(100, Math.max(0, (normalCount / site.onShelfMax) * 100))
                            : 0;

                        return (
                          <div
                            key={site.siteCode || site.siteName}
                            onClick={() => {
                              setSelectedSiteName(site.siteName);
                              message.info(`已选择场地: ${site.siteName}`);
                            }}
                            className={`group relative py-2.5 px-3 rounded-lg border cursor-pointer transition-all duration-300 select-none ${
                              isSelected
                                ? "bg-slate-900 border-slate-900 shadow-md text-white scale-[1.01]"
                                : "bg-white border-slate-200 text-slate-800 hover:border-slate-400 hover:bg-slate-50 shadow-sm"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute right-3.5 top-3 h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping"></div>
                            )}

                            <div className="flex items-start justify-between mb-1.5 gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <EnvironmentOutlined
                                  className={
                                    isSelected
                                      ? "text-amber-400"
                                      : "text-slate-400 group-hover:text-slate-600"
                                  }
                                />
                                <span
                                  className={`font-semibold text-xs transition-colors truncate ${
                                    isSelected ? "text-white" : "text-slate-800"
                                  }`}
                                >
                                  {site.siteName}
                                </span>
                              </div>
                              <span
                                className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                                  isSelected ? "bg-slate-800 text-amber-400" : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                异常 {site.anomaly} 台
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] gap-2">
                                <span className={isSelected ? "text-slate-400" : "text-slate-500"}>
                                  刷新/期望:{" "}
                                  <span className="font-mono">
                                    {site.refreshedCount}/{site.onShelfMax}
                                  </span>
                                </span>
                                <span
                                  className={`font-mono font-semibold ${
                                    site.anomalyRatio > 1.5
                                      ? isSelected
                                        ? "text-rose-400"
                                        : "text-rose-600"
                                      : isSelected
                                        ? "text-teal-400"
                                        : "text-teal-600"
                                  }`}
                                >
                                  异常 {site.anomalyRatio}%
                                </span>
                              </div>

                              <div
                                className={`w-full h-1 rounded-full overflow-hidden ${
                                  isSelected ? "bg-slate-800" : "bg-slate-100"
                                }`}
                              >
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    site.anomalyRatio > 1.5
                                      ? isSelected
                                        ? "bg-rose-400"
                                        : "bg-rose-500"
                                      : isSelected
                                        ? "bg-emerald-400"
                                        : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${barPercent}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-10">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无场地列表数据" />
                      </div>
                    )}
                  </div>
                </div>
              </Spin>
            </div>
          </Col>
        </Row>

        {/* 异常信息详情栏 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-slate-900 rounded-full"></div>
              <span className="text-base font-bold text-slate-800">异常信息详情栏</span>
            </div>
            <Space>
              <span className="text-xs text-slate-500">
                检索到 <span className="font-bold text-slate-900 font-mono">{detailTotal}</span> 台矿机
              </span>
              <span className="inline-block w-px h-3 bg-slate-200 align-middle mx-1.5"></span>
              <Tag color="cyan">最新时间可按排序</Tag>
            </Space>
          </div>

          <div className="p-5 border-b border-slate-100 bg-slate-50/30">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6} lg={4}>
                <div className="text-xs text-slate-500 mb-1.5 font-medium">场地</div>
                <Select
                  style={{ width: "100%" }}
                  placeholder="选择场地"
                  value={searchSite}
                  onChange={(val) => setSearchSite(val)}
                  options={[
                    { value: "all", label: "全部场地" },
                    ...siteAnomalyList.map((s) => ({ value: s.siteName, label: s.siteName })),
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={6} lg={4}>
                <div className="text-xs text-slate-500 mb-1.5 font-medium">MAC 地址</div>
                <Input
                  placeholder="搜索 MAC 模糊匹配"
                  value={searchMac}
                  onChange={(e) => setSearchMac(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6} lg={4}>
                <div className="text-xs text-slate-500 mb-1.5 font-medium">控制板 SN</div>
                <Input
                  placeholder="控制板 SN"
                  value={searchSN}
                  onChange={(e) => setSearchSN(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6} lg={4}>
                <div className="text-xs text-slate-500 mb-1.5 font-medium">矿工号</div>
                <Input
                  placeholder="矿工号"
                  value={searchMinerId}
                  onChange={(e) => setSearchMinerId(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6} lg={4}>
                <div className="text-xs text-slate-500 mb-1.5 font-medium">下架</div>
                <Select
                  style={{ width: "100%" }}
                  placeholder="是否下架"
                  value={searchDismantled}
                  onChange={(val) => setSearchDismantled(val)}
                  options={[
                    { value: "all", label: "全部" },
                    { value: "在架", label: "在架" },
                    { value: "下架", label: "下架" },
                    { value: "未知", label: "未知" },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={6} lg={4}>
                <div className="text-xs text-slate-500 mb-1.5 font-medium">产权</div>
                <Select
                  style={{ width: "100%" }}
                  placeholder="产权"
                  value={searchAsset}
                  onChange={(val) => setSearchAsset(val)}
                  options={[
                    { value: "all", label: "全部" },
                    { value: "自有", label: "自有" },
                    { value: "非自有", label: "非自有" },
                    { value: "未知", label: "未知" },
                  ]}
                />
              </Col>
            </Row>

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-dashed border-slate-200">
              <Button icon={<ReloadOutlined />} onClick={handleReset} className="hover:border-slate-400">
                重置
              </Button>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                搜索
              </Button>
            </div>
          </div>

          <Table
            loading={detailLoading}
            columns={columns}
            dataSource={detailList}
            rowKey="id"
            pagination={{
              current: detailPage,
              pageSize: detailPageSize,
              total: detailTotal,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total: number) => `共 ${total} 项`,
              className: "px-6 py-4",
              onChange: (page: number, pageSize: number) => {
                setDetailPage(page);
                setDetailPageSize(pageSize);
              },
            }}
            locale={{
              emptyText: (
                <div className="py-12 text-center">
                  <AlertOutlined className="text-4xl text-slate-300 mb-3" />
                  <div className="text-slate-500 font-medium">没有找到符合条件的矿机数据</div>
                  <div className="text-xs text-slate-400 mt-1">请尝试放宽筛选条件，或重置搜索筛选器。</div>
                  <Button onClick={handleReset} className="mt-4" size="small">
                    重置筛选
                  </Button>
                </div>
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}
