import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { TablePaginationConfig, TableProps } from "antd";
import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  useCreateSiteAgentBinding,
  useDeleteSiteAgentBinding,
  useRefreshAllSiteDailyAnomalyStats,
  useRefreshSiteDailyAnomalyStats,
  useSiteAgentBindings,
  useSiteDailyAnomalyRefreshTask,
  useUpdateSiteAgentBinding,
} from "./hook";
import type {
  SiteAgentBindingFormValues,
  SiteAgentBindingPayload,
  SiteAgentBindingQueryParams,
  SiteAgentBindingRecord,
  SiteAgentBindingSearchValues,
  SiteDailyAnomalyRefreshSubmitData,
  SiteDailyAnomalyRefreshTask,
} from "./types";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { useSelector, useSettingsStore } from "@/stores";

function pickValue<T>(...values: T[]): T | undefined {
  return values.find((value) => value !== undefined && value !== null);
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function listToText(value: unknown) {
  return normalizeList(value).join("\n");
}

function normalizeNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function normalizeRecord(item: any): SiteAgentBindingRecord {
  const agentName = String(pickValue(item?.agentName, item?.agent_name, "") || "");

  return {
    key: agentName,
    venueType: pickValue(item?.venueType, item?.venue_type),
    siteCode: String(pickValue(item?.siteCode, item?.site_code, "") || ""),
    siteName: String(pickValue(item?.siteName, item?.site_name, "") || ""),
    agentCode: pickValue(item?.agentCode, item?.agent_code),
    agentName,
    version: pickValue(item?.version),
    assetSiteId: normalizeNumber(pickValue(item?.assetSiteID, item?.assetSiteId, item?.asset_site_id)),
    minerCodeBlacklist: normalizeList(pickValue(item?.minerCodeBlacklist, item?.miner_code_blacklist)),
    machineTypeBlacklist: normalizeList(pickValue(item?.machineTypeBlacklist, item?.machine_type_blacklist)),
    ipRanges: normalizeList(pickValue(item?.ipRanges, item?.ip_ranges)),
    createdAt: pickValue(item?.createdAt, item?.created_at),
    updatedAt: pickValue(item?.updatedAt, item?.updated_at),
  };
}

function buildPayload(
  values: SiteAgentBindingFormValues,
  options?: {
    version?: string;
  },
): SiteAgentBindingPayload {
  return {
    siteCode: values.siteCode.trim(),
    siteName: values.siteName.trim(),
    agentCode: values.agentCode?.trim() || undefined,
    agentName: values.agentName.trim(),
    version: options?.version,
    assetSiteID: normalizeNumber(values.assetSiteId),
    minerCodeBlacklist: normalizeList(values.minerCodeBlacklist),
    machineTypeBlacklist: normalizeList(values.machineTypeBlacklist),
    ipRanges: normalizeList(values.ipRanges),
  };
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

function renderBlacklistTags(items: string[], tagClassName?: string) {
  if (!items.length) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <Tag key={item} className={tagClassName ? `!mr-0 ${tagClassName}` : "!mr-0"}>
          {item}
        </Tag>
      ))}
    </div>
  );
}

function getRefreshTaskAlertType(
  task?: SiteDailyAnomalyRefreshTask,
): "info" | "success" | "error" | "warning" {
  if (!task) return "info";
  if (task.status === "success") return "success";
  if (task.status === "failed") return "error";
  if (task.status === "running") return "warning";
  return "info";
}

function getRefreshTaskStatusText(task?: SiteDailyAnomalyRefreshTask) {
  if (!task) return "";
  if (task.status === "pending") return "排队中";
  if (task.status === "running") return "执行中";
  if (task.status === "success") return "执行成功";
  if (task.status === "failed") return "执行失败";
  return task.status;
}

export default function MiningAgentSettingPage() {
  useAuthRedirect();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [searchForm] = Form.useForm<SiteAgentBindingSearchValues>();
  const [modalForm] = Form.useForm<SiteAgentBindingFormValues>();
  const [query, setQuery] = useState<SiteAgentBindingQueryParams>({ page: 1, pageSize: 20 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SiteAgentBindingRecord | null>(null);
  const [filterExpanded, setFilterExpanded] = useState(true);
  const [refreshTaskId, setRefreshTaskId] = useState<string | null>(null);
  const [refreshTaskSnapshot, setRefreshTaskSnapshot] = useState<SiteDailyAnomalyRefreshTask | null>(null);
  const [submittingRefreshSiteCode, setSubmittingRefreshSiteCode] = useState<string | null>(null);
  const [submittingRefreshAll, setSubmittingRefreshAll] = useState(false);
  const [ipRangesPreview, setIpRangesPreview] = useState<{
    agentName: string;
    items: string[];
  } | null>(null);
  const notifyTaskStatusRef = useRef<string>("");

  const listQuery = useSiteAgentBindings(poolType, query);
  const createMutation = useCreateSiteAgentBinding(poolType);
  const updateMutation = useUpdateSiteAgentBinding(poolType);
  const deleteMutation = useDeleteSiteAgentBinding(poolType);
  const refreshSiteMutation = useRefreshSiteDailyAnomalyStats(poolType);
  const refreshAllMutation = useRefreshAllSiteDailyAnomalyStats(poolType);
  const refreshTaskQuery = useSiteDailyAnomalyRefreshTask(poolType, refreshTaskId);

  const listData = useMemo(() => {
    const payload = listQuery.data?.data;
    const rows = Array.isArray(payload?.list) ? payload.list.map(normalizeRecord) : [];

    return {
      total: Number(payload?.total ?? 0),
      page: Number(payload?.page ?? query.page ?? 1),
      pageSize: Number(payload?.pageSize ?? query.pageSize ?? 20),
      list: rows,
    };
  }, [listQuery.data, query.page, query.pageSize]);

  const currentRefreshTask = refreshTaskQuery.data?.data ?? refreshTaskSnapshot;
  const isRefreshTaskActive =
    currentRefreshTask?.status === "pending" || currentRefreshTask?.status === "running";
  const activeRefreshSiteCode =
    isRefreshTaskActive && currentRefreshTask?.scopeType === "site" ? currentRefreshTask.siteCode : null;
  const activeRefreshAllSite = isRefreshTaskActive && currentRefreshTask?.scopeType === "all_site";

  useEffect(() => {
    if (refreshTaskQuery.data?.data) {
      setRefreshTaskSnapshot(refreshTaskQuery.data.data);
    }
  }, [refreshTaskQuery.data]);

  useEffect(() => {
    if (!currentRefreshTask) return;
    if (currentRefreshTask.status === "success" || currentRefreshTask.status === "failed") {
      setSubmittingRefreshAll(false);
      setSubmittingRefreshSiteCode(null);
    }
  }, [currentRefreshTask]);

  useEffect(() => {
    if (!currentRefreshTask) return;

    const notifyKey = `${currentRefreshTask.taskId}:${currentRefreshTask.status}`;
    if (notifyTaskStatusRef.current === notifyKey) return;

    if (currentRefreshTask.status === "success") {
      notifyTaskStatusRef.current = notifyKey;
      message.success(
        `${currentRefreshTask.scopeType === "all_site" ? "全场" : currentRefreshTask.siteCode || "场地"}异常数刷新完成`,
      );
      void listQuery.refetch();
      return;
    }

    if (currentRefreshTask.status === "failed") {
      notifyTaskStatusRef.current = notifyKey;
      message.error(currentRefreshTask.errorMessage || "异常数刷新任务执行失败");
    }
  }, [currentRefreshTask, listQuery]);

  const handleRefreshTaskSubmitResult = useCallback(
    (data: SiteDailyAnomalyRefreshSubmitData | undefined, successMessage: string) => {
      if (!data?.task?.taskId) {
        message.success(successMessage);
        return;
      }

      setRefreshTaskId(data.task.taskId);
      setRefreshTaskSnapshot(data.task);
      notifyTaskStatusRef.current = "";

      if (data.existingTask) {
        message.info("检测到已有同类任务在执行，已复用现有任务");
      } else {
        message.success(successMessage);
      }
    },
    [],
  );

  const handleAdd = useCallback(() => {
    setEditingRecord(null);
    modalForm.resetFields();
    setIsModalOpen(true);
  }, [modalForm]);

  const handleEdit = useCallback(
    (record: SiteAgentBindingRecord) => {
      setEditingRecord(record);
      modalForm.setFieldsValue({
        siteCode: record.siteCode,
        siteName: record.siteName,
        agentCode: record.agentCode,
        agentName: record.agentName,
        assetSiteId: record.assetSiteId,
        minerCodeBlacklist: listToText(record.minerCodeBlacklist),
        machineTypeBlacklist: listToText(record.machineTypeBlacklist),
        ipRanges: listToText(record.ipRanges),
      });
      setIsModalOpen(true);
    },
    [modalForm],
  );

  const handleDelete = useCallback(
    async (record: SiteAgentBindingRecord) => {
      try {
        await deleteMutation.mutateAsync(record.agentName);
        message.success("删除成功");
      } catch (error) {
        message.error((error as Error).message || "删除失败");
      }
    },
    [deleteMutation],
  );

  const handleRefreshAll = useCallback(async () => {
    if (isRefreshTaskActive) {
      message.warning("当前已有异常数刷新任务执行中，请等待完成后再提交");
      return;
    }

    setSubmittingRefreshAll(true);
    try {
      const res = (await refreshAllMutation.mutateAsync()) as { data?: SiteDailyAnomalyRefreshSubmitData };
      handleRefreshTaskSubmitResult(res.data, "全场异常数刷新任务已提交");
    } catch (error) {
      setSubmittingRefreshAll(false);
      message.error((error as Error).message || "提交全场异常数刷新任务失败");
    }
  }, [handleRefreshTaskSubmitResult, isRefreshTaskActive, refreshAllMutation]);

  const handleRefreshSite = useCallback(
    async (record: SiteAgentBindingRecord) => {
      if (isRefreshTaskActive) {
        message.warning("当前已有异常数刷新任务执行中，请等待完成后再提交");
        return;
      }

      setSubmittingRefreshSiteCode(record.siteCode);
      try {
        const res = (await refreshSiteMutation.mutateAsync(record.siteCode)) as {
          data?: SiteDailyAnomalyRefreshSubmitData;
        };
        handleRefreshTaskSubmitResult(res.data, `场地 ${record.siteCode} 异常数刷新任务已提交`);
      } catch (error) {
        setSubmittingRefreshSiteCode(null);
        message.error((error as Error).message || "提交场地异常数刷新任务失败");
      }
    },
    [handleRefreshTaskSubmitResult, isRefreshTaskActive, refreshSiteMutation],
  );

  const handleSearch = useCallback(
    (values: SiteAgentBindingSearchValues) => {
      setQuery({
        page: 1,
        pageSize: query.pageSize ?? 20,
        siteCode: values.siteCode?.trim() || undefined,
        siteName: values.siteName?.trim() || undefined,
        agentCode: values.agentCode?.trim() || undefined,
        agentName: values.agentName?.trim() || undefined,
      });
    },
    [query.pageSize],
  );

  const handleReset = useCallback(() => {
    searchForm.resetFields();
    setQuery({ page: 1, pageSize: query.pageSize ?? 20 });
  }, [query.pageSize, searchForm]);

  const handleCopyIpRanges = useCallback(async (record: SiteAgentBindingRecord) => {
    if (!record.ipRanges.length) {
      message.info("当前没有可复制的 IP 范围");
      return;
    }

    try {
      await navigator.clipboard.writeText(record.ipRanges.join("\n"));
      message.success(`已复制 ${record.agentName} 的 IP 范围`);
    } catch (error) {
      message.error((error as Error).message || "复制 IP 范围失败");
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await modalForm.validateFields();
      const payload = buildPayload(values, { version: editingRecord?.version });

      if (editingRecord) {
        await updateMutation.mutateAsync({ agentName: editingRecord.agentName, payload });
        message.success("更新成功");
      } else {
        await createMutation.mutateAsync(payload);
        message.success("创建成功");
      }

      setIsModalOpen(false);
      setEditingRecord(null);
      modalForm.resetFields();
    } catch (error) {
      if ((error as { errorFields?: unknown[] })?.errorFields) {
        return;
      }
      message.error((error as Error).message || "保存失败");
    }
  }, [createMutation, editingRecord, modalForm, updateMutation]);

  const columns = useMemo<ColumnsType<SiteAgentBindingRecord>>(
    () => [
      {
        title: "序号",
        key: "index",
        width: 70,
        render: (_: unknown, __: SiteAgentBindingRecord, index: number) =>
          (listData.page - 1) * listData.pageSize + index + 1,
      },
      {
        title: "场地名称",
        dataIndex: "siteName",
        key: "siteName",
        width: 220,
        render: (value: string, record: SiteAgentBindingRecord) => (
          <div className="min-w-0">
            <div className="font-medium text-gray-800 break-all">{value || "-"}</div>
            <div className="text-xs text-gray-500 mt-1 break-all">{record.siteCode || "-"}</div>
          </div>
        ),
      },
      {
        title: "代理信息",
        key: "agentInfo",
        width: 240,
        render: (_: unknown, record: SiteAgentBindingRecord) => (
          <div className="min-w-0">
            <div className="font-medium text-gray-800 break-all">{record.agentName || "-"}</div>
            <div className="text-xs text-gray-500 mt-1 break-all">{record.agentCode || "-"}</div>
          </div>
        ),
      },
      {
        title: "矿机编号黑名单",
        dataIndex: "minerCodeBlacklist",
        key: "minerCodeBlacklist",
        width: 240,
        render: (value: string[]) =>
          renderBlacklistTags(value, "!border-rose-200 !bg-rose-50 !text-rose-700"),
      },
      {
        title: "机型黑名单",
        dataIndex: "machineTypeBlacklist",
        key: "machineTypeBlacklist",
        width: 220,
        render: (value: string[]) =>
          renderBlacklistTags(value, "!border-amber-200 !bg-amber-50 !text-amber-700"),
      },
      {
        title: "IP 范围",
        dataIndex: "ipRanges",
        key: "ipRanges",
        width: 260,
        render: (value: string[], record: SiteAgentBindingRecord) => {
          if (!value.length) {
            return <span className="text-gray-400">-</span>;
          }

          return (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">共 {value.length} 段</div>
              <Space size="small" wrap>
                <Button
                  size="small"
                  className="!border-indigo-200 !bg-indigo-50 !text-indigo-600 hover:!border-indigo-300 hover:!bg-indigo-100 hover:!text-indigo-700"
                  onClick={() =>
                    setIpRangesPreview({
                      agentName: record.agentName,
                      items: value,
                    })
                  }
                >
                  查看
                </Button>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  className="!border-emerald-200 !bg-emerald-50 !text-emerald-600 hover:!border-emerald-300 hover:!bg-emerald-100 hover:!text-emerald-700"
                  onClick={() => void handleCopyIpRanges(record)}
                >
                  复制
                </Button>
              </Space>
            </div>
          );
        },
      },
      {
        title: "资产场地ID",
        dataIndex: "assetSiteId",
        key: "assetSiteId",
        width: 120,
        render: (value: number | undefined) => value ?? "-",
      },
      {
        title: "更新时间",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 180,
        render: (value: string | undefined) => formatDateTime(value),
      },
      {
        title: "操作",
        key: "action",
        fixed: "right",
        width: 260,
        render: (_: unknown, record: SiteAgentBindingRecord) => {
          const siteRefreshLoading =
            (refreshSiteMutation.isPending && submittingRefreshSiteCode === record.siteCode) ||
            activeRefreshSiteCode === record.siteCode;
          const refreshDisabled = isRefreshTaskActive && activeRefreshSiteCode !== record.siteCode;

          return (
            <Space size="small" wrap>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                className="!border-sky-200 !bg-sky-50 !text-sky-700 hover:!border-sky-300 hover:!bg-sky-100 hover:!text-sky-800"
                onClick={() => void handleRefreshSite(record)}
                loading={siteRefreshLoading}
                disabled={refreshDisabled}
              >
                刷新异常数
              </Button>
              <Button
                size="small"
                icon={<EditOutlined />}
                className="!border-sky-200 !bg-sky-50 !text-sky-700 hover:!border-sky-300 hover:!bg-sky-100 hover:!text-sky-800"
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
              <Popconfirm
                title="确认删除该代理设置？"
                okText="删除"
                cancelText="取消"
                onConfirm={() => handleDelete(record)}
              >
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  className="!border-rose-200 !bg-rose-50 !text-rose-600 hover:!border-rose-300 hover:!bg-rose-100 hover:!text-rose-700"
                  loading={deleteMutation.isPending}
                >
                  删除
                </Button>
              </Popconfirm>
            </Space>
          );
        },
      },
    ],
    [
      activeRefreshSiteCode,
      deleteMutation.isPending,
      handleDelete,
      handleCopyIpRanges,
      handleEdit,
      handleRefreshSite,
      isRefreshTaskActive,
      listData.page,
      listData.pageSize,
      refreshSiteMutation.isPending,
      submittingRefreshSiteCode,
    ],
  );

  const pagination: TablePaginationConfig = {
    current: listData.page,
    pageSize: listData.pageSize,
    total: listData.total,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50, 100, 200],
    showTotal: (total) => `共 ${total} 条记录`,
    locale: { items_per_page: "条/页" },
    onChange: (page, pageSize) => {
      setQuery((prev) => ({
        ...prev,
        page,
        pageSize,
      }));
    },
  };

  const submitting = createMutation.isPending || updateMutation.isPending;

  const tableLocale: TableProps<SiteAgentBindingRecord>["locale"] = {
    emptyText: (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          query.siteCode || query.siteName || query.agentCode || query.agentName
            ? "暂无匹配数据"
            : "暂无代理绑定数据"
        }
      />
    ),
  };

  const refreshAllButtonText = activeRefreshAllSite
    ? `全场异常数${getRefreshTaskStatusText(currentRefreshTask)}`
    : isRefreshTaskActive
      ? "已有场地任务执行中"
      : "刷新全场异常数";

  return (
    <div className="min-h-full bg-[#f5f5f5] -m-4 p-4">
      <div className="w-full min-w-0 max-w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-white">
          <div className="px-5 pt-4 pb-3 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 m-0">矿机代理设置</h2>
              <div className="text-xs text-gray-500 mt-1">当前场地类型：{poolType || "-"}</div>
            </div>
            <Space>
              <Button
                onClick={() => void handleRefreshAll()}
                loading={(refreshAllMutation.isPending && submittingRefreshAll) || activeRefreshAllSite}
                disabled={isRefreshTaskActive && !activeRefreshAllSite}
              >
                {refreshAllButtonText}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增代理设置
              </Button>
            </Space>
          </div>

          {currentRefreshTask ? (
            <div className="px-4 pt-4">
              <Alert
                type={getRefreshTaskAlertType(currentRefreshTask)}
                showIcon
                closable
                onClose={() => {
                  setRefreshTaskId(null);
                  setRefreshTaskSnapshot(null);
                  notifyTaskStatusRef.current = "";
                }}
                message={`${currentRefreshTask.scopeType === "all_site" ? "全场" : currentRefreshTask.siteCode || "场地"}异常数刷新${getRefreshTaskStatusText(currentRefreshTask)}`}
                description={
                  <div className="text-xs leading-6">
                    <div>
                      任务 ID：<span className="font-mono">{currentRefreshTask.taskId}</span>
                    </div>
                    <div>
                      时间窗口：{currentRefreshTask.dateFrom} 至 {currentRefreshTask.dateTo}，共{" "}
                      {currentRefreshTask.windowDays} 天
                    </div>
                    <div>
                      场地数：{currentRefreshTask.siteCount}，删除：{currentRefreshTask.deletedRows}，写入：
                      {currentRefreshTask.upsertedRows}
                    </div>
                    <div>
                      创建时间：{formatDateTime(currentRefreshTask.createdAt)}，更新时间：
                      {formatDateTime(currentRefreshTask.updatedAt)}
                    </div>
                    {currentRefreshTask.startedAt ? (
                      <div>
                        开始时间：{formatDateTime(currentRefreshTask.startedAt)}
                        {currentRefreshTask.finishedAt
                          ? `，完成时间：${formatDateTime(currentRefreshTask.finishedAt)}`
                          : ""}
                      </div>
                    ) : null}
                    {currentRefreshTask.errorMessage ? (
                      <div className="text-red-500">错误信息：{currentRefreshTask.errorMessage}</div>
                    ) : null}
                  </div>
                }
              />
            </div>
          ) : null}

          {filterExpanded ? (
            <div className="px-5 py-4 border-b border-gray-200 bg-white">
              <Form
                form={searchForm}
                layout="horizontal"
                labelAlign="left"
                colon={false}
                onFinish={handleSearch}
                labelCol={{ flex: "0 0 88px" }}
                wrapperCol={{ flex: "1 1 0" }}
                className="[&_.ant-form-item]:!mb-0 [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label>label]:!text-gray-800"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
                  <Form.Item name="siteCode" label="场地编码" className="!mb-0 min-w-0">
                    <Input allowClear placeholder="请输入场地编码" />
                  </Form.Item>
                  <Form.Item name="siteName" label="场地名称" className="!mb-0 min-w-0">
                    <Input allowClear placeholder="请输入场地名称" />
                  </Form.Item>
                  <Form.Item name="agentCode" label="代理编码" className="!mb-0 min-w-0">
                    <Input allowClear placeholder="请输入代理编码" />
                  </Form.Item>
                  <Form.Item name="agentName" label="代理名称" className="!mb-0 min-w-0">
                    <Input allowClear placeholder="请输入代理名称" />
                  </Form.Item>
                  <div className="flex min-w-0 justify-end gap-2 pb-0.5 md:col-span-2 lg:col-span-4">
                    <Button onClick={handleReset}>重置</Button>
                    <Button type="primary" htmlType="submit">
                      搜索
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          ) : null}

          <div className="w-full min-w-0 overflow-x-auto bg-white">
            <div className="flex justify-end items-center gap-1 border-b border-gray-100 px-4 py-2">
              <Button
                type="text"
                shape="circle"
                icon={<SearchOutlined className={filterExpanded ? "text-[#1677ff]" : "text-gray-500"} />}
                className={filterExpanded ? "!bg-[#e6f4ff]" : undefined}
                onClick={() => setFilterExpanded((v) => !v)}
              />
              <Button
                type="text"
                shape="circle"
                icon={<ReloadOutlined />}
                onClick={() => void listQuery.refetch()}
                loading={listQuery.isFetching}
              />
            </div>

            {listQuery.isError ? (
              <Alert
                className="m-4"
                type="error"
                showIcon
                message={(listQuery.error as Error)?.message || "矿机代理设置列表加载失败"}
              />
            ) : null}

            <div className="px-4 pb-4">
              <Table<SiteAgentBindingRecord>
                rowKey="key"
                columns={columns}
                dataSource={listData.list}
                loading={listQuery.isLoading || listQuery.isFetching}
                size="middle"
                bordered={false}
                scroll={{ x: 1600 }}
                locale={tableLocale}
                pagination={pagination}
              />
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={editingRecord ? "编辑代理设置" : "新增代理设置"}
        open={isModalOpen}
        onOk={() => void handleSubmit()}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        confirmLoading={submitting}
        destroyOnHidden
        width={760}
      >
        <Form form={modalForm} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="siteCode"
              label="场地编码"
              rules={[{ required: true, message: "请输入场地编码" }]}
              className="!mb-3"
            >
              <Input placeholder="请输入场地编码" />
            </Form.Item>
            <Form.Item
              name="siteName"
              label="场地名称"
              rules={[{ required: true, message: "请输入场地名称" }]}
              className="!mb-3"
            >
              <Input placeholder="请输入场地名称" />
            </Form.Item>
            <Form.Item name="agentCode" label="代理编码" className="!mb-3">
              <Input placeholder="请输入代理编码" />
            </Form.Item>
            <Form.Item
              name="agentName"
              label="代理名称"
              rules={[{ required: true, message: "请输入代理名称" }]}
              className="!mb-3"
            >
              <Input placeholder="请输入代理名称" />
            </Form.Item>
          </div>

          <Form.Item name="minerCodeBlacklist" label="矿机编号黑名单" className="!mb-3">
            <Input.TextArea rows={4} placeholder="每行或逗号分隔一个矿机编号" />
          </Form.Item>

          <Form.Item name="machineTypeBlacklist" label="机型黑名单" className="!mb-0">
            <Input.TextArea rows={4} placeholder="每行或逗号分隔一个机型" />
          </Form.Item>

          <Form.Item name="ipRanges" label="IP 范围" className="!mb-0">
            <Input.TextArea rows={4} placeholder="每行或逗号分隔一个 IP 范围" />
          </Form.Item>

          <Form.Item name="assetSiteId" label="资产场地ID" className="!mb-0">
            <InputNumber className="!w-full" min={0} precision={0} placeholder="请输入资产场地ID" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={ipRangesPreview ? `${ipRangesPreview.agentName} 的 IP 范围` : "IP 范围"}
        open={Boolean(ipRangesPreview)}
        footer={[
          <Button
            key="copy"
            icon={<CopyOutlined />}
            onClick={() => {
              if (!ipRangesPreview) return;
              void navigator.clipboard
                .writeText(ipRangesPreview.items.join("\n"))
                .then(() => {
                  message.success("IP 范围已复制");
                })
                .catch((error: Error) => {
                  message.error(error.message || "复制 IP 范围失败");
                });
            }}
          >
            复制
          </Button>,
          <Button key="close" type="primary" onClick={() => setIpRangesPreview(null)}>
            关闭
          </Button>,
        ]}
        onCancel={() => setIpRangesPreview(null)}
        destroyOnHidden
        width={720}
      >
        {ipRangesPreview?.items.length ? (
          <div className="max-h-[420px] overflow-auto flex flex-wrap gap-2">
            {ipRangesPreview.items.map((item) => (
              <Tag key={item} className="!mr-0">
                {item}
              </Tag>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </Modal>
    </div>
  );
}
