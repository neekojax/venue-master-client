import axios from "axios";
import type {
  AlertUpdate,
  Cluster,
  Machine,
  MachineDetail,
  Overview,
  Paged,
  Parts,
  PredictionFilters,
  Scope,
  Site,
  SiteRankings,
} from "./types";

import { t } from "@/locales";

// 预测接口公开读取，无需维修账号或运营系统 Token。
const client = axios.create({
  baseURL: "/api/fault-predictions",
  timeout: 20000,
});
export class PredictionError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "PredictionError";
  }
}
function unwrap<T>(body: unknown): T {
  if (!body || typeof body !== "object" || !("code" in body) || !("data" in body)) {
    throw new PredictionError(t("预测接口响应格式不正确，请核对接口文档。"));
  }
  const result = body as { code: number; data: T; msg?: string };
  if (result.code !== 0) throw new PredictionError(t(result.msg || "故障预测请求失败"), result.code);
  return result.data;
}
function errorFrom(error: unknown): Error {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error : new Error(t("故障预测请求失败"));
  const status = error.response?.status;
  const fallback =
    status === 401
      ? t("预测服务仍要求鉴权，请确认后端已更新重启，且反向代理未附加登录限制。")
      : status === 403
        ? t("请求被服务或网关拒绝，请核对部署配置。")
        : status === 404
          ? t("预测结果或告警已不存在，请刷新列表。")
          : !status || status === 502 || status === 504
            ? t("无法连接故障预测服务，请确认本地 8090 服务已启动。")
            : t("故障预测请求失败");
  return new PredictionError(t(error.response?.data?.msg || error.response?.data?.error || fallback), status);
}
function config(scope: Scope, params: object = {}, signal?: AbortSignal) {
  return {
    params: {
      group_id: scope.group_id,
      site_id: scope.site_id,
      days: 7,
      ...params,
    },
    signal,
  };
}
async function get<T>(scope: Scope, path: string, params?: object, signal?: AbortSignal): Promise<T> {
  try {
    return unwrap<T>((await client.get(path, config(scope, params, signal))).data);
  } catch (error) {
    throw errorFrom(error);
  }
}
export const fetchSites = (scope: Scope, signal?: AbortSignal) =>
  get<Site[]>({ ...scope, site_id: undefined }, "/sites", undefined, signal);
export const fetchOverview = (scope: Scope, signal?: AbortSignal) =>
  get<Overview>(scope, "/overview", undefined, signal);
export const fetchMachines = (
  scope: Scope,
  filters: PredictionFilters,
  page: number,
  limit: number,
  signal?: AbortSignal,
) => get<Paged<Machine>>(scope, "/machines", { ...filters, page, limit }, signal);
export const fetchMachine = (scope: Scope, id: number, page: number, limit: number, signal?: AbortSignal) =>
  get<MachineDetail>(scope, `/machines/${id}`, { page, limit }, signal);
export const fetchClusters = (
  scope: Scope,
  page: number,
  limit: number,
  concentrated: boolean,
  signal?: AbortSignal,
) =>
  get<Paged<Cluster>>(
    scope,
    "/clusters",
    { page, limit, ...(concentrated ? { concentrated: "true" } : {}) },
    signal,
  );
export const fetchParts = (scope: Scope, signal?: AbortSignal) =>
  get<Parts>(scope, "/parts", undefined, signal);
export const updateAlert = async (scope: Scope, id: number, values: AlertUpdate) => {
  try {
    return unwrap<{ version: number }>((await client.patch(`/alerts/${id}`, values, config(scope))).data);
  } catch (error) {
    throw errorFrom(error);
  }
};

export const fetchSiteRankings = (scope: Scope, signal?: AbortSignal) =>
  get<SiteRankings>(scope, "/site-rankings", undefined, signal);
