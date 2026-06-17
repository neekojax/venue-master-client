import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Pagination, Spin, Typography } from "antd";
import { ROUTE_PATHS } from "@/constants/common";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import { downloadAllWeeklyReports, getVenueBasicInfo, getWeeklyReportPage } from "@/pages/venue/api.tsx";
import WeeklyBusinessReport from "@/pages/venue/venue-detail/components/WeeklyBusinessReport";
import {
  normalizeWeeklyPageResponse,
  type WeeklyReportRow,
} from "@/pages/venue/venue-detail/components/weeklyMock";

const { Title, Text } = Typography;

type VenueBasicInfo = {
  venue_name?: string;
};

export default function VenueWeeklyReportPage() {
  useAuthRedirect();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const { venueId } = useParams<{ venueId: string }>();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<WeeklyReportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [basicInfo, setBasicInfo] = useState<VenueBasicInfo | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchBasicInfo = async () => {
      if (!venueId) return;
      try {
        const response = await getVenueBasicInfo(poolType, Number(venueId));
        setBasicInfo(response.data || null);
      } catch (_error) {
        setBasicInfo(null);
      }
    };

    fetchBasicInfo();
  }, [venueId, poolType]);

  useEffect(() => {
    const fetchData = async () => {
      if (!venueId) return;
      setLoading(true);
      try {
        const response = await getWeeklyReportPage(poolType, Number(venueId), page, pageSize);
        const normalized = normalizeWeeklyPageResponse(response.data);
        setRows(
          normalized.data.map((item, index) => ({
            key: `${item.weekStart}-${item.weekEnd}-${index}`,
            weekNo: Math.ceil(
              (new Date(item.weekStart).getTime() -
                new Date(new Date(item.weekStart).getFullYear(), 0, 1).getTime()) /
                86400000 /
                7 +
                1,
            ),
            weekLabel: item.weekLabel,
            startDate: item.weekStart,
            endDate: item.weekEnd,
            theoreticalHashrate: item.averageTheoreticalPower,
            actualHashrate: item.averagePower24h,
            hashEffectiveRate: item.averageHashEffectiveRate,
            incomeBtc: item.weeklyBtcOutput,
            incomeEfficiency: item.outputEfficiency,
            netEffectiveRate: item.forecastHashEfficiency,
            faultCount: item.averageFailure,
            faultRate: item.averageFailureRate,
            pendingCount: item.averagePendingRepair,
            pendingRate: item.averagePendingRepairRate,
            scrapCount: item.averageScrap,
            highTemperatureImpactRate: item.averageHighTemperatureImpactRate,
            limitImpactRate: item.averageLimitImpactRate,
            weeklyOnlineCount: item.weekShelved,
            weeklyOfflineCount: item.weekUnshelved,
          })),
        );
        setTotal(normalized.total);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [venueId, poolType, page, pageSize]);

  const handleDownload = async () => {
    if (!venueId) return;

    try {
      setDownloading(true);
      const response: any = await downloadAllWeeklyReports(poolType, Number(venueId));
      const blob = response?.data instanceof Blob ? response.data : response;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${basicInfo?.venue_name || "场地"}_运营周报.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Title level={2} className="!mb-1">
            场地运营周报
          </Title>
          {basicInfo?.venue_name ? <Text type="secondary">{basicInfo.venue_name}</Text> : null}
        </div>
        <div className="flex items-center gap-3">
          <Button type="primary" loading={downloading} onClick={handleDownload}>
            下载周报
          </Button>
          <Link to={ROUTE_PATHS.miningSiteDetail(Number(venueId || 0))}>
            <Button>返回场地详情</Button>
          </Link>
        </div>
      </div>

      <Spin spinning={loading}>
        <WeeklyBusinessReport data={rows} />
        <div className="mt-6 flex justify-center">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            pageSizeOptions={["10", "20", "30"]}
            onChange={(nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            }}
          />
        </div>
      </Spin>
    </div>
  );
}
