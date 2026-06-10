import { useEffect, useMemo, useState } from "react";
import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  HistoryOutlined,
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, DatePicker, Drawer, Form, Input, InputNumber, message, Popconfirm, Select, Tag } from "antd";
import type { FormInstance } from "antd/es/form";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  useCreateAnomalyManagementReport,
  useDeleteAnomalyManagementRecord,
  useUpdateAnomalyManagement,
} from "../hook";
import type {
  AbnormalDataDetail,
  AbnormalLogFilters,
  AbnormalLogRecord,
  AnomalyManagementRecord,
  AnomalyManagementStatus,
} from "../types";
import AbnormalLogPanel, { type AbnormalLogSearchValues } from "./AbnormalLogPanel";
import { getAbnormalStatsDate } from "@/utils";

interface SiteOption {
  id: string;
  name: string;
}

type ManagementFormValues = {
  logDate: Dayjs;
  reason: string;
  owner: string;
  abnormalCount: number;
  status: AnomalyManagementStatus;
};

const STATUS_ORDER: AnomalyManagementStatus[] = ["pending", "monitoring", "resolved", "fixed"];

function getDefaultReportDate() {
  return dayjs().subtract(1, "day");
}

function getStatusTag(status: AnomalyManagementStatus) {
  switch (status) {
    case "pending":
      return <Tag color="warning">待排查</Tag>;
    case "monitoring":
      return <Tag color="processing">观察中</Tag>;
    case "resolved":
      return <Tag color="success">处理中</Tag>;
    case "fixed":
      return <Tag color="blue">已修复</Tag>;
    default:
      return null;
  }
}

function formatSiteBadge(siteName?: string, siteCode?: string) {
  const source = siteName || siteCode || "";
  if (!source) return "";
  return source.split("-")[0] || source;
}

interface AbnormalManagementDrawerProps {
  open: boolean;
  mode?: "drawer" | "inline";
  selectedSiteValue?: string;
  siteCode?: string;
  siteName?: string;
  abnormalCount: number;
  scannedCount?: number | null;
  theoreticalCount?: number | null;
  summary?: AbnormalDataDetail;
  logRange?: [Dayjs, Dayjs];
  form: FormInstance<AbnormalLogSearchValues>;
  siteOptions: SiteOption[];
  exportFilters: AbnormalLogFilters;
  logs: AbnormalLogRecord[];
  historyRecords: AnomalyManagementRecord[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  historyLoading?: boolean;
  onClose: () => void;
  onSearch: (values: AbnormalLogSearchValues) => void;
  onReset: () => void;
  onRefresh: () => void;
  onPageChange: (page: number, pageSize: number) => void;
  onSiteChange?: (siteCode: string) => void;
  onHistoryRefresh?: () => void;
  className?: string;
}

export default function AbnormalManagementDrawer({
  open,
  mode = "drawer",
  selectedSiteValue,
  siteCode,
  siteName,
  abnormalCount,
  scannedCount,
  theoreticalCount,
  summary,
  logRange,
  form,
  siteOptions,
  exportFilters,
  logs,
  historyRecords,
  total,
  page,
  pageSize,
  loading = false,
  historyLoading = false,
  onClose,
  onSearch,
  onReset,
  onRefresh,
  onPageChange,
  onSiteChange,
  onHistoryRefresh,
  className,
}: AbnormalManagementDrawerProps) {
  void scannedCount;
  void theoreticalCount;
  const [managementForm] = Form.useForm<ManagementFormValues>();
  const [editingRecordId, setEditingRecordId] = useState<string>();
  const [editingReason, setEditingReason] = useState("");
  const [editingStatus, setEditingStatus] = useState<AnomalyManagementStatus>("pending");
  const [editingAbnormalCount, setEditingAbnormalCount] = useState(0);
  const [newLogDate, setNewLogDate] = useState(getDefaultReportDate().format("YYYY-MM-DD"));
  const [newReason, setNewReason] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newAbnormalCount, setNewAbnormalCount] = useState(0);
  const [newStatus, setNewStatus] = useState<AnomalyManagementStatus>("pending");
  const createReportMutation = useCreateAnomalyManagementReport();
  const updateAnomalyManagementMutation = useUpdateAnomalyManagement();
  const deleteRecordMutation = useDeleteAnomalyManagementRecord();
  const currentRecords = useMemo(() => historyRecords, [historyRecords]);

  useEffect(() => {
    managementForm.setFieldsValue({
      logDate: getDefaultReportDate(),
      reason: "",
      owner: summary?.owner || "",
      abnormalCount: summary?.abnormalCount ?? 0,
      status: "pending",
    });
    setNewLogDate(getDefaultReportDate().format("YYYY-MM-DD"));
    setNewReason("");
    setNewOwner(summary?.owner || "");
    setNewAbnormalCount(summary?.abnormalCount ?? 0);
    setNewStatus("pending");
  }, [abnormalCount, managementForm, siteCode, summary]);

  const handleCreateRecord = async () => {
    if (!siteName) {
      message.warning("请先选择场地");
      return;
    }

    try {
      const values = await managementForm.validateFields();
      await createReportMutation.mutateAsync({
        siteName,
        logDate: values.logDate.format("YYYY-MM-DD"),
        reason: values.reason.trim(),
        owner: values.owner.trim(),
        abnormalCount: Number(values.abnormalCount) || 0,
        status: values.status,
      });
      managementForm.setFieldsValue({
        logDate: getDefaultReportDate(),
        reason: "",
        owner: values.owner,
        abnormalCount: values.abnormalCount,
        status: "pending",
      });
      onHistoryRefresh?.();
      message.success("异常处理记录已添加");
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleToggleStatus = async (record: AnomalyManagementRecord) => {
    const currentIndex = STATUS_ORDER.indexOf(record.status);
    const nextStatus = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];
    try {
      await updateAnomalyManagementMutation.mutateAsync({
        id: record.id,
        status: nextStatus,
      });
      onHistoryRefresh?.();
      message.success("状态更新成功");
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleInlineAddRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!siteName) {
      message.warning("请先选择场地");
      return;
    }
    if (!newReason.trim()) return;

    void createReportMutation
      .mutateAsync({
        siteName,
        logDate: newLogDate,
        reason: newReason.trim(),
        owner: newOwner.trim(),
        abnormalCount: Number(newAbnormalCount) || 0,
        status: newStatus,
      })
      .then(() => {
        setNewLogDate(getDefaultReportDate().format("YYYY-MM-DD"));
        setNewReason("");
        setNewAbnormalCount(summary?.abnormalCount ?? 0);
        onHistoryRefresh?.();
        message.success("异常处理记录已添加");
      })
      .catch((error) => {
        if (error instanceof Error) {
          message.error(error.message);
        }
      });
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await deleteRecordMutation.mutateAsync(recordId);
      if (editingRecordId === recordId) {
        setEditingRecordId(undefined);
        setEditingReason("");
        setEditingStatus("pending");
        setEditingAbnormalCount(0);
      }
      onHistoryRefresh?.();
      message.success("删除成功");
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleSaveEdit = async (recordId: string) => {
    const reason = editingReason.trim();
    if (!reason) {
      message.warning("异常原因不能为空");
      return;
    }
    if (editingAbnormalCount < 0) {
      message.warning("台数不能小于 0");
      return;
    }
    try {
      await updateAnomalyManagementMutation.mutateAsync({
        id: recordId,
        reason,
        status: editingStatus,
        abnormalCount: editingAbnormalCount,
      });
      setEditingRecordId(undefined);
      setEditingReason("");
      setEditingStatus("pending");
      setEditingAbnormalCount(0);
      onHistoryRefresh?.();
      message.success("异常记录已更新");
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const timeRangeLabel =
    logRange && logRange[0] && logRange[1]
      ? `${logRange[0].format("YYYY-MM-DD HH:mm")} - ${logRange[1].format("YYYY-MM-DD HH:mm")}`
      : "未限定时间范围";
  const siteBadge = formatSiteBadge(siteName, siteCode);
  const summaryAbnormalCount = summary?.abnormalCount;
  const abnormalRatio =
    summary?.onShelfCount && summary.onShelfCount > 0
      ? ((summary.abnormalCount / summary.onShelfCount) * 100).toFixed(2)
      : null;
  const yesterdayLabel = getAbnormalStatsDate().format("YYYY-MM-DD");

  const showLogPanel = true;

  const renderInlineStatusBadge = (status: AnomalyManagementStatus) => {
    const baseClass = "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border";
    switch (status) {
      case "pending":
        return (
          <span className={`${baseClass} bg-amber-50 text-amber-600 border-amber-200`}>
            <ClockCircleOutlined />
            待排查
          </span>
        );
      case "monitoring":
        return (
          <span className={`${baseClass} bg-sky-50 text-sky-600 border-sky-200`}>
            <ClockCircleOutlined />
            观察中
          </span>
        );
      case "resolved":
        return (
          <span className={`${baseClass} bg-emerald-50 text-emerald-600 border-emerald-200`}>
            <CheckCircleOutlined />
            处理中
          </span>
        );
      case "fixed":
        return (
          <span className={`${baseClass} bg-blue-50 text-blue-600 border-blue-200`}>
            <CheckCircleOutlined />
            已修复
          </span>
        );
      default:
        return null;
    }
  };

  if (!open) return null;

  if (mode === "inline") {
    return (
      <div
        className={`flex flex-col h-full bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden ${className ?? ""}`}
      >
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-rose-500/15 rounded-xl text-rose-400 flex-shrink-0 border border-rose-500/20">
              <AlertOutlined />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold flex items-center gap-1.5 leading-none">
                <span className="truncate">异常管理终端</span>
                {siteBadge ? (
                  <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded font-normal shrink-0">
                    {siteBadge}
                  </span>
                ) : null}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 truncate">历史故障记录与原因更正</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="关闭管理面板"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 font-medium">昨日异常设备数（{yesterdayLabel}）</p>
              <p className="text-[30px] font-black text-red-600 mt-1 leading-none">
                {summaryAbnormalCount ?? "-"} <span className="text-xs font-normal text-gray-400">台</span>
              </p>
            </div>
            <div className="text-right text-[10px] text-gray-500 space-y-0.5">
              <div>
                异常占比:{" "}
                <strong className="text-red-500">{abnormalRatio ? `${abnormalRatio}%` : "-"}</strong>
              </div>
              <div>
                在线扫描: <strong className="text-gray-700">{summary?.scanMachineCount ?? "-"}</strong>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-1.5 border-b border-gray-50 pb-2">
              <PlusOutlined className="text-blue-500" />
              上传异常报告
            </h4>

            <form onSubmit={handleInlineAddRecord} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                  日志日期
                </label>
                <input
                  type="date"
                  value={newLogDate}
                  onChange={(e) => setNewLogDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                  故障诱因 & 情况描述
                </label>
                <textarea
                  required
                  rows={2}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="请输入算力离线原因描述..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                    经办负责
                  </label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                    异常台数
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newAbnormalCount}
                    onChange={(e) => setNewAbnormalCount(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700 font-bold"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                  初始处置状态
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AnomalyManagementStatus)}
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700"
                >
                  <option value="pending">待排查 (Pending)</option>
                  <option value="monitoring">观察中 (Monitoring)</option>
                  <option value="resolved">处理中 (Resolved)</option>
                  <option value="fixed">已修复 (Fixed)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer focus:outline-none"
              >
                <SendOutlined />
                提交记录并上报
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <HistoryOutlined className="text-gray-500" />
              异常处理历史轨迹
              <span className="text-[10px] bg-slate-100 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold ml-auto">
                {currentRecords.length} 个事件
              </span>
            </h4>

            {historyLoading ? (
              <div className="p-6 text-center text-gray-400 text-xs">加载中...</div>
            ) : currentRecords.length === 0 && total === 0 ? (
              <div className="p-6 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                无故障演变轨迹。
              </div>
            ) : (
              <div className="relative border-l border-gray-200 pl-4 ml-2.5 space-y-4 pt-1">
                {currentRecords.map((record) => (
                  <div key={record.id} className="relative group">
                    <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-red-500 flex items-center justify-center z-10" />

                    <div className="bg-slate-50/70 hover:bg-slate-50 border border-gray-150 rounded-xl p-3.5 transition-all">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[9px] font-mono font-semibold text-gray-400 flex items-center gap-0.5">
                          <ClockCircleOutlined />
                          {record.time}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => void handleToggleStatus(record)}
                            className="hover:scale-105 active:scale-95 transition-transform"
                            title="点击变更状态"
                          >
                            {renderInlineStatusBadge(record.status)}
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDeleteRecord(record.id)}
                            className="p-0.5 hover:bg-amber-50 rounded hover:text-red-500 text-gray-400 transition-colors"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </div>

                      {editingRecordId === record.id ? (
                        <div className="mt-1 space-y-1.5">
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={editingStatus}
                              onChange={(e) => setEditingStatus(e.target.value as AnomalyManagementStatus)}
                              className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none"
                            >
                              <option value="pending">待排查</option>
                              <option value="monitoring">观察中</option>
                              <option value="resolved">处理中</option>
                              <option value="fixed">已修复</option>
                            </select>
                            <input
                              type="number"
                              min={0}
                              value={editingAbnormalCount}
                              onChange={(e) => setEditingAbnormalCount(Number(e.target.value))}
                              className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none"
                              placeholder="请输入台数"
                            />
                          </div>
                          <textarea
                            value={editingReason}
                            onChange={(e) => setEditingReason(e.target.value)}
                            className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none"
                            rows={2}
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRecordId(undefined);
                                setEditingReason("");
                                setEditingStatus("pending");
                                setEditingAbnormalCount(0);
                              }}
                              className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded"
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(record.id)}
                              className="px-2 py-0.5 text-[10px] bg-blue-600 text-white rounded"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-600 leading-relaxed flex items-start gap-1">
                          <p className="flex-1 text-[11px] leading-normal break-words">{record.reason}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRecordId(record.id);
                              setEditingReason(record.reason);
                              setEditingStatus(record.status);
                              setEditingAbnormalCount(record.abnormalCount ?? record.devicesAffected);
                            }}
                            className="p-0.5 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <EditOutlined />
                          </button>
                        </div>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                        <span className="truncate max-w-[50%]">
                          经办: <strong className="text-gray-500">{record.operator}</strong>
                        </span>
                        <span>
                          波及:{" "}
                          <strong className="text-red-500 font-bold">
                            {record.abnormalCount ?? record.devicesAffected} 台
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <div className={`h-full flex flex-col min-h-0 ${className ?? ""}`}>
      <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertOutlined />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold m-0 flex items-center gap-2 flex-wrap">
                <span className="truncate">异常管理终端</span>
                {siteBadge ? (
                  <span className="text-[11px] font-normal bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
                    {siteBadge}
                  </span>
                ) : null}
              </h2>
              <p className="text-xs text-slate-400 mt-1 mb-0">
                快速查看异常日志、筛选记录并导出当前场地故障明细
              </p>
            </div>
          </div>
        </div>
        {mode === "drawer" ? (
          <Button onClick={onClose}>关闭</Button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 shrink-0"
          >
            <CloseOutlined />
          </button>
        )}
      </div>

      <div className="p-4 bg-[#f5f5f5] flex-1 min-h-0 overflow-auto">
        {!showLogPanel ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm mb-4">
            <div className="text-xs text-gray-500 mb-2">场地列表</div>
            <Select
              value={selectedSiteValue}
              onChange={onSiteChange}
              options={siteOptions.map((item) => ({ label: item.name, value: item.id }))}
              placeholder="请选择场地"
              className="w-full"
              showSearch
              optionFilterProp="label"
            />
          </div>
        ) : null}

        <div className={`grid gap-4 mb-4 ${showLogPanel ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"}`}>
          <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-2">昨日异常设备数（{yesterdayLabel}）</div>
            <div className="text-3xl font-semibold text-red-600 leading-none">
              {summaryAbnormalCount ?? "-"}
            </div>
            <div className="text-xs text-gray-400 mt-2">{siteCode || siteName || "未选择场地"}</div>
          </div>
          <div
            className={`rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm ${
              showLogPanel ? "md:col-span-2" : ""
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <ClockCircleOutlined />
              当前查询窗口
            </div>
            <div className="text-sm font-medium text-gray-800 break-all">{timeRangeLabel}</div>
            <div className="text-xs text-gray-400 mt-2">弹窗已自动带入场地与时间范围，你也可以继续细筛。</div>
          </div>
        </div>

        <div className={`grid gap-4 ${showLogPanel ? "grid-cols-1 xl:grid-cols-5 mb-4" : "grid-cols-1"}`}>
          <div
            className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${showLogPanel ? "xl:col-span-2" : ""}`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-4">
              <FormOutlined className="text-blue-500" />
              上传异常报告
            </div>
            <Form form={managementForm} layout="vertical" colon={false} className="[&_.ant-form-item]:!mb-3">
              <Form.Item
                name="logDate"
                label="日志日期"
                rules={[{ required: true, message: "请选择日志日期" }]}
              >
                <DatePicker className="w-full" allowClear={false} />
              </Form.Item>
              <Form.Item
                name="reason"
                label="故障诱因与情况描述"
                rules={[{ required: true, message: "请输入异常情况描述" }]}
              >
                <Input.TextArea rows={4} placeholder="请输入异常原因、处理背景或需要跟进的说明" />
              </Form.Item>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Form.Item
                  name="operator"
                  label="经办负责"
                  rules={[{ required: true, message: "请输入经办负责人" }]}
                >
                  <Input placeholder="请输入经办负责人" />
                </Form.Item>
                <Form.Item
                  name="devicesAffected"
                  label="影响台数"
                  rules={[{ required: true, message: "请输入影响台数" }]}
                >
                  <InputNumber min={0} precision={0} className="w-full" placeholder="请输入影响台数" />
                </Form.Item>
              </div>
              <Form.Item
                name="status"
                label="初始处置状态"
                rules={[{ required: true, message: "请选择状态" }]}
              >
                <Select
                  options={[
                    { label: "待排查", value: "pending" },
                    { label: "观察中", value: "monitoring" },
                    { label: "处理中", value: "resolved" },
                    { label: "已修复", value: "fixed" },
                  ]}
                />
              </Form.Item>
              <Button type="primary" icon={<PlusOutlined />} block onClick={() => void handleCreateRecord()}>
                提交记录并上报
              </Button>
            </Form>
          </div>

          <div
            className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${
              showLogPanel ? "xl:col-span-3" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <HistoryOutlined className="text-gray-500" />
                异常处理历史轨迹
              </div>
              <span className="text-xs text-gray-400">{currentRecords.length} 个事件</span>
            </div>
            <div className={`overflow-auto pr-1 ${showLogPanel ? "max-h-[360px]" : "max-h-[520px]"}`}>
              {currentRecords.length === 0 ? (
                <div className="p-6 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                  无故障演变轨迹。
                </div>
              ) : (
                <div className="relative border-l border-gray-200 pl-4 ml-2.5 space-y-4 pt-1">
                  {currentRecords.map((record) => (
                    <div key={record.id} className="relative group">
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-red-500 flex items-center justify-center z-10" />

                      <div className="bg-slate-50/70 hover:bg-slate-50 border border-gray-200 rounded-xl p-3.5 transition-all">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-semibold text-gray-400 flex items-center gap-1 min-w-0">
                            <ClockCircleOutlined />
                            <span>{record.time}</span>
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => void handleToggleStatus(record)}
                              className="hover:scale-105 active:scale-95 transition-transform"
                              title="点击变更状态"
                            >
                              {getStatusTag(record.status)}
                            </button>

                            <Popconfirm
                              title="删除这条处理记录？"
                              okText="删除"
                              cancelText="取消"
                              onConfirm={() => handleDeleteRecord(record.id)}
                            >
                              <button
                                type="button"
                                className="p-1 hover:bg-amber-50 rounded hover:text-red-500 text-gray-400 transition-colors"
                              >
                                <DeleteOutlined />
                              </button>
                            </Popconfirm>
                          </div>
                        </div>

                        {editingRecordId === record.id ? (
                          <div className="mt-1 space-y-1.5">
                            <Input.TextArea
                              rows={2}
                              value={editingReason}
                              onChange={(e) => setEditingReason(e.target.value)}
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRecordId(undefined);
                                  setEditingReason("");
                                }}
                                className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded"
                              >
                                取消
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(record.id)}
                                className="px-2 py-0.5 text-[10px] bg-blue-600 text-white rounded"
                              >
                                保存
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600 leading-relaxed flex items-start gap-1">
                            <p className="flex-1 text-[11px] leading-normal break-words whitespace-normal">
                              {record.reason}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRecordId(record.id);
                                setEditingReason(record.reason);
                              }}
                              className="p-0.5 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            >
                              <EditOutlined />
                            </button>
                          </div>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between gap-2 text-[10px] text-gray-400">
                          <span className="truncate min-w-0">
                            经办: <strong className="text-gray-500">{record.operator}</strong>
                          </span>
                          <span className="shrink-0">
                            波及:{" "}
                            <strong className="text-red-500 font-bold">{record.devicesAffected} 台</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showLogPanel ? (
          <AbnormalLogPanel
            title="异常日志明细"
            form={form}
            siteOptions={siteOptions}
            exportFilters={exportFilters}
            logs={logs}
            total={total}
            page={page}
            pageSize={pageSize}
            loading={loading}
            onSearch={onSearch}
            onReset={onReset}
            onRefresh={onRefresh}
            onPageChange={onPageChange}
          />
        ) : null}
      </div>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={1280}
      destroyOnClose={false}
      title={null}
      closable={false}
      bodyStyle={{ padding: 0, background: "#f5f5f5" }}
    >
      {content}
    </Drawer>
  );
}
