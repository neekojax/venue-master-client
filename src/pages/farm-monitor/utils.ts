import dayjs from "dayjs";
import type { FarmSite, FarmStatus } from "./mockData";
import type {
  BoundSiteItem,
  HashrateTimeSeriesPoint,
  KpiSummary,
  LatestFinishedProbeTask,
  OverviewPoint,
  TaskSnapshotQueryParams,
  TimeRange,
} from "./types";
import { formatHashrate } from "@/utils/num";

const EMPTY_KPI_SUMMARY: KpiSummary = {
  theoreticalOnline: null,
  online: null,
  theoreticalOffline: null,
  lowHashrate: null,
  zeroHashrate: null,
  networkEvents: null,
  powerLimitEvents: null,
  highTempEvents: null,
  yesterdayAbnormal: null,
};

export function mapLatestTaskToKpiSummary(
  task?: LatestFinishedProbeTask | null,
  onShelfCount?: number | null,
  yesterdayAbnormal?: number | null,
): KpiSummary {
  if (!task) {
    return {
      ...EMPTY_KPI_SUMMARY,
      yesterdayAbnormal: yesterdayAbnormal ?? null,
    };
  }

  const online = task.online_total ?? null;
  const offlineFromApi = task.offline_total ?? null;
  const theoreticalOnline =
    onShelfCount ??
    task.on_shelf_count ??
    (online != null && offlineFromApi != null ? online + offlineFromApi : null);
  const theoreticalOffline = theoreticalOnline != null && online != null ? theoreticalOnline - online : null;

  return {
    theoreticalOnline,
    online,
    theoreticalOffline,
    lowHashrate: task.fault_total ?? null,
    zeroHashrate: task.zero_hashrate_total ?? null,
    networkEvents: task.event_impact?.network_impact_count ?? null,
    powerLimitEvents: task.event_impact?.limit_impact_count ?? null,
    highTempEvents: task.event_impact?.high_temperature_impact_count ?? null,
    yesterdayAbnormal: yesterdayAbnormal ?? null,
  };
}

/** 取时间序列最后一点的采集时间 */
export function getLastProbeTaskTime(points: HashrateTimeSeriesPoint[]): string | null {
  const last = points[points.length - 1];
  if (!last?.time) return null;
  const d = dayjs(last.time);
  return d.isValid() ? d.format("YYYY-MM-DD HH:mm:ss") : null;
}

export function mapProbeTasksToOverviewPoints(
  points: HashrateTimeSeriesPoint[],
  window: TimeRange,
): OverviewPoint[] {
  return points.map((point) => {
    const collected = dayjs(point.time);
    const timeLabel = window === "24h" ? collected.format("MM-DD HH:mm") : collected.format("MM-DD");
    return {
      time: collected.isValid() ? timeLabel : "-",
      theoreticalOnline: Number(point.on_shelf_count ?? 0),
      online: Number(point.online_total ?? 0),
      lowHashrate: Number(point.fault_total ?? 0),
      zeroHashrate: Number(point.zero_hashrate_total ?? 0),
      totalHashrate: totalHashrateThToE(point.total_hashrate, 4),
    };
  });
}

/** 从 latestFinishedProbeTask 的 agents 提取 task_id */
export function resolveLatestProbeTaskIds(task?: LatestFinishedProbeTask | null): string[] {
  if (!task) return [];
  return (task.agents ?? []).filter((a) => a.task_id && a.present !== false).map((a) => a.task_id!);
}

/** 将多个 task_id 拼为路径参数（后端逗号分隔解析） */
export function formatTaskIdsForSnapshotApi(taskIds: string[]): string | undefined {
  const ids = taskIds.map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) return undefined;
  return ids.join(",");
}

/** total_hashrate 为 TH/s，转为 E 数值 */
export function totalHashrateThToE(totalHashrate?: number | null, decimals = 2): number {
  if (totalHashrate == null || isNaN(Number(totalHashrate))) {
    return 0;
  }
  return Number(formatHashrate(Number(totalHashrate), "TH", decimals, "EH", false));
}

/** total_hashrate 为 TH/s，展示为 E，保留 2 位小数 */
export function formatTotalHashrateE(totalHashrate?: number | null) {
  if (totalHashrate == null || isNaN(Number(totalHashrate))) {
    return "-";
  }
  return `${totalHashrateThToE(totalHashrate).toFixed(2)} E`;
}

function resolveFarmStatus(probe?: BoundSiteItem["latest_probe_task"]): FarmStatus {
  const totalHashrate = Number(probe?.total_hashrate ?? 0);
  if (!probe || isNaN(totalHashrate) || totalHashrate <= 0) return "error";
  return "normal";
}

const TASK_SNAPSHOT_FILTER_KEYS = [
  "minerCode",
  "sn",
  "fullType",
  "ip",
  "macAddress",
  "controlBoardSN",
  "hashrateFault",
  "zeroHashrate",
  "loginFailed",
] as const;

type TaskSnapshotFilterKey = (typeof TASK_SNAPSHOT_FILTER_KEYS)[number];

/** 列表/导出共用的筛选查询参数（不含分页） */
export function buildTaskSnapshotFilterParams(filters: TaskSnapshotQueryParams): TaskSnapshotQueryParams {
  const params: TaskSnapshotQueryParams = {};
  for (const key of TASK_SNAPSHOT_FILTER_KEYS) {
    const value = filters[key as TaskSnapshotFilterKey];
    if (typeof value === "string" && value.trim() !== "") {
      params[key as TaskSnapshotFilterKey] = value.trim();
    }
  }
  if (params.fullType) {
    params.full_type = params.fullType;
  }
  return params;
}

export function buildTaskSnapshotQueryParams(
  filters: TaskSnapshotQueryParams,
  page: number,
  pageSize: number,
): TaskSnapshotQueryParams {
  return { ...buildTaskSnapshotFilterParams(filters), page, pageSize };
}

export function buildTaskSnapshotExportParams(filters: TaskSnapshotQueryParams) {
  return buildTaskSnapshotFilterParams(filters);
}

function parseFilenameFromDisposition(disposition?: string | null, fallback = "export.xlsx") {
  if (!disposition || !disposition.includes("filename=")) return fallback;
  const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
  if (!matches?.[1]) return fallback;
  return decodeURIComponent(matches[1].replace(/['"]/g, ""));
}

/** 触发浏览器下载 Excel（blob 响应） */
export function downloadExcelBlobResponse(
  res: {
    data?: Blob | ArrayBuffer | unknown;
    headers?: Record<string, unknown>;
  },
  fallbackFilename: string,
) {
  const blobData = res.data instanceof Blob ? res.data : res.data;
  const blob = new Blob([blobData as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  let filename = fallbackFilename;
  const rawDisposition = res.headers?.["content-disposition"];
  const disposition = typeof rawDisposition === "string" ? rawDisposition : undefined;
  filename = parseFilenameFromDisposition(disposition, fallbackFilename);

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function formatSnapshotIp(ip?: number | string | null) {
  if (ip == null || ip === "") return "-";
  return String(ip);
}

export function formatSnapshotHashrate(value?: number | null, fractionDigits?: number) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  const num = Number(value);
  if (fractionDigits != null) {
    return `${num.toFixed(fractionDigits)} TH/s`;
  }
  return `${num} TH/s`;
}

export function formatSnapshotText(value?: string | number | null) {
  if (value == null || value === "") return "-";
  return String(value);
}

export function formatSnapshotJson(value: unknown) {
  if (value == null || value === "") return "-";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function formatSnapshotTime(value?: string | null) {
  if (!value) return "-";
  const d = dayjs(value);
  return d.isValid() ? d.format("YYYY-MM-DD HH:mm:ss") : value;
}

export function mapBoundSiteToFarmSite(item: BoundSiteItem): FarmSite {
  const probe = item.latest_probe_task;
  const totalHashrate = Number(probe?.total_hashrate ?? 0);
  return {
    id: item.site_code,
    name: item.site_name,
    hashrate: isNaN(totalHashrate) ? 0 : totalHashrate,
    status: resolveFarmStatus(probe),
  };
}
