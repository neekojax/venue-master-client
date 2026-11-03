import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  type AuthzEndpoint,
  type AuthzPermission,
  type BinaryStatus,
  createPermission,
  deletePermission,
  fetchEndpoints,
  fetchFrontendRoutes,
  fetchPermissions,
  type FrontendRequirement,
  type FrontendRoute,
  type RiskLevel,
  updatePermission,
} from "./api";
import { cleanParams, FilterBar, riskLevelOptions, RiskTag, StatusSelect, StatusTag } from "./common";
import { useAuthzPage } from "./context";
import { ModuleIcon } from "./navigation-icons";
import {
  compareResources,
  getResourceNavigation,
  moduleOrderIndex,
  moduleSectionOf,
  resourceName,
  VENUE_LIST_PAGE_PATHS,
} from "./permission-catalog";

const reservedKeys = new Set(["system:all", "authz:read", "authz:manage"]);

// 模块权限行：真实权限行 + 按页面分组的标题行（__groupHeader 标记）
type ModulePermissionRow = AuthzPermission & { __groupHeader?: string };

// 左侧导航的展示模块：资源本身，或资源按所属页面拆分出的子项（如 场地列表 / 场地详情）
type ModuleEntry = {
  key: string;
  resource: string;
  label: string;
  section: string;
  items: AuthzPermission[];
  /** API 接口 tab 的路径过滤；缺省时按资源前缀整块显示 */
  apiPaths?: Set<string>;
  /** true 时取反：显示不在 apiPaths 中的接口（用于「其余接口」侧） */
  apiPathsExclude?: boolean;
  /** 额外并入 API 列表的权限前缀（如矿池算力合并展示矿池结算的接口） */
  extraResourcePrefixes?: string[];
};

export default function PermissionsTab() {
  const { canManage, options, permissions, publishSuccess, refreshMetadata } = useAuthzPage();
  const [searchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [rows, setRows] = useState<AuthzPermission[]>([]);
  const [catalog, setCatalog] = useState<Array<FrontendRoute & { requirements: FrontendRequirement[] }>>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [activeModule, setActiveModule] = useState("");
  const [detailTab, setDetailTab] = useState("permissions");
  const [apiItems, setApiItems] = useState<AuthzEndpoint[] | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiKeyword, setApiKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [queryKeyword, setQueryKeyword] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel | "">("");
  const [status, setStatus] = useState<BinaryStatus | "">("");
  const [editing, setEditing] = useState<AuthzPermission | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const listRequestId = useRef(0);
  const catalogRequestId = useRef(0);
  const apiRequestId = useRef(0);
  const watchedResource = Form.useWatch("resource", form);
  const watchedAction = Form.useWatch("action", form);

  const load = useCallback(async () => {
    const requestId = ++listRequestId.current;
    setLoading(true);
    try {
      const all: AuthzPermission[] = [];
      let page = 1;
      let total = 0;
      do {
        const data = await fetchPermissions(
          cleanParams({
            page,
            page_size: 200,
            keyword: queryKeyword,
            risk_level: riskLevel,
            status,
          }),
        );
        const batch = data.list || [];
        all.push(...batch);
        total = data.total || 0;
        if (batch.length === 0) break;
        page += 1;
      } while (all.length < total);
      if (requestId !== listRequestId.current) return;
      setRows(all);
    } catch (error: any) {
      if (requestId === listRequestId.current) messageApi.error(error.message || "加载权限定义失败");
    } finally {
      if (requestId === listRequestId.current) setLoading(false);
    }
  }, [messageApi, queryKeyword, riskLevel, status]);

  const loadCatalog = useCallback(async () => {
    const requestId = ++catalogRequestId.current;
    setCatalogLoading(true);
    setCatalogError("");
    try {
      const routes: FrontendRoute[] = [];
      const requirements: FrontendRequirement[] = [];
      let page = 1;
      let total = 0;
      do {
        const data = await fetchFrontendRoutes({ page, page_size: 200, status: 1 });
        const batch = data.list || [];
        routes.push(...batch);
        requirements.push(...(data.requirements || []));
        total = data.total || 0;
        if (batch.length === 0) break;
        page += 1;
      } while (routes.length < total);
      if (requestId !== catalogRequestId.current) return;
      const byRoute = new Map<number, FrontendRequirement[]>();
      requirements.forEach((item) =>
        byRoute.set(item.frontend_route_id, [...(byRoute.get(item.frontend_route_id) || []), item]),
      );
      setCatalog(routes.map((route) => ({ ...route, requirements: byRoute.get(route.id) || [] })));
    } catch (error: any) {
      if (requestId === catalogRequestId.current) setCatalogError(error.message || "加载页面目录失败");
    } finally {
      if (requestId === catalogRequestId.current) setCatalogLoading(false);
    }
  }, []);

  const loadApis = useCallback(async () => {
    const requestId = ++apiRequestId.current;
    setApiLoading(true);
    setApiError("");
    try {
      const all: AuthzEndpoint[] = [];
      let page = 1;
      let total = 0;
      do {
        const data = await fetchEndpoints({ page, page_size: 200 });
        const batch = data.list || [];
        all.push(...batch);
        total = data.total || 0;
        if (batch.length === 0) break;
        page += 1;
      } while (all.length < total);
      if (requestId === apiRequestId.current) setApiItems(all);
    } catch (error: any) {
      if (requestId === apiRequestId.current) setApiError(error.message || "加载 API 映射失败");
    } finally {
      if (requestId === apiRequestId.current) setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const currentTab = searchParams.get("tab");
  useEffect(() => {
    if (currentTab === "permissions") {
      void loadCatalog();
      void loadApis();
    }
  }, [currentTab, loadCatalog, loadApis]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (keyword.trim() !== queryKeyword) {
        setQueryKeyword(keyword.trim());
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword, queryKeyword]);

  const resourceNavigation = useMemo(() => getResourceNavigation(rows, catalog), [rows, catalog]);
  const modules = useMemo(() => {
    const groups = new Map<string, AuthzPermission[]>();
    rows.forEach((permission) => {
      groups.set(permission.resource, [...(groups.get(permission.resource) || []), permission]);
    });
    const orderOf = (resource: string) => moduleOrderIndex(resourceName(resource, rows));
    return Array.from(groups.entries()).sort(([left], [right]) => {
      const leftOrder = orderOf(left);
      const rightOrder = orderOf(right);
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      if (leftOrder === Infinity && !resourceNavigation.has(left) && !resourceNavigation.has(right)) {
        return (
          resourceName(left, rows).localeCompare(resourceName(right, rows), "zh-CN") ||
          left.localeCompare(right)
        );
      }
      return compareResources(left, right, resourceNavigation);
    });
  }, [rows, resourceNavigation]);
  // 「场地列表」入口的权限键：由上面配置的接口路径反查（接口的 permission_key 即页面权限）
  const venueListKeys = useMemo(() => {
    const keys = new Set<string>();
    (apiItems || []).forEach((endpoint) => {
      if (VENUE_LIST_PAGE_PATHS.has(endpoint.path_pattern) && endpoint.permission_key) {
        keys.add(endpoint.permission_key);
      }
    });
    return keys;
  }, [apiItems]);
  // 展示模块：仅「场地」资源拆为 场地列表 / 场地详情（归属按上面接口配置），其余模块保持整块
  const displayModules = useMemo<ModuleEntry[]>(() => {
    const result: ModuleEntry[] = [];
    modules.forEach(([resource, items]) => {
      const label = resourceName(resource, rows);
      const section = moduleSectionOf(label);
      if (resource === "venue" && apiItems) {
        const listItems = items.filter((permission) => venueListKeys.has(permission.permission_key));
        const detailItems = items.filter((permission) => !venueListKeys.has(permission.permission_key));
        if (listItems.length > 0) {
          result.push({
            key: "venue::list",
            resource,
            label: "场地列表",
            section,
            items: listItems,
            apiPaths: VENUE_LIST_PAGE_PATHS,
          });
        }
        if (detailItems.length > 0) {
          result.push({
            key: "venue::detail",
            resource,
            label: "场地详情",
            section,
            items: detailItems,
            apiPaths: VENUE_LIST_PAGE_PATHS,
            apiPathsExclude: true,
          });
        }
        return;
      }
      result.push({
        key: resource,
        resource,
        label,
        section,
        items,
        // 矿池算力的 API 接口合并展示「矿池结算」的接口
        extraResourcePrefixes: resource === "mining-pool" ? ["settlement:"] : undefined,
      });
    });
    return result;
  }, [modules, venueListKeys, apiItems, rows]);
  const currentModule = displayModules.find((entry) => entry.key === activeModule) || displayModules[0];
  const modulePermissionRows = useMemo<ModulePermissionRow[]>(
    () => currentModule?.items || [],
    [currentModule],
  );
  const moduleGroups = useMemo(
    () =>
      displayModules.reduce<Array<[string, ModuleEntry[]]>>((acc, entry) => {
        const group = acc.find(([name]) => name === entry.section);
        if (group) group[1].push(entry);
        else acc.push([entry.section, [entry]]);
        return acc;
      }, []),
    [displayModules],
  );
  const permissionNames = useMemo(
    () => new Map([...permissions, ...rows].map((item) => [item.permission_key, item.name])),
    [permissions, rows],
  );
  const moduleApis = useMemo(() => {
    const entry = currentModule;
    if (!entry) return [];
    const query = apiKeyword.trim().toLowerCase();
    return (apiItems || []).filter((endpoint) => {
      const byResource =
        entry.resource === "*"
          ? endpoint.public_mode === "protected" && Boolean(endpoint.permission_key)
          : endpoint.permission_key.startsWith(`${entry.resource}:`) ||
            (entry.extraResourcePrefixes ?? []).some((prefix) => endpoint.permission_key.startsWith(prefix));
      // 拆分入口（场地列表/场地详情）按配置的接口路径过滤，普通模块仍按资源前缀整块显示
      const byPaths =
        entry.apiPaths === undefined
          ? true
          : entry.apiPathsExclude
            ? !entry.apiPaths.has(endpoint.path_pattern)
            : entry.apiPaths.has(endpoint.path_pattern);
      const text =
        `${endpoint.method} ${endpoint.path_pattern} ${endpoint.permission_key} ${permissionNames.get(endpoint.permission_key) || ""}`.toLowerCase();
      return byResource && byPaths && text.includes(query);
    });
  }, [apiItems, apiKeyword, currentModule, permissionNames]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ risk_level: "low", status: 1 });
    setModalOpen(true);
  };
  const openEdit = (row: AuthzPermission) => {
    setEditing(row);
    form.setFieldsValue(row);
    setModalOpen(true);
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      const permissionKey = editing?.permission_key || `${values.resource}:${values.action}`;
      if (values.permission_key && values.permission_key !== permissionKey) {
        messageApi.warning("Permission Key 必须等于 resource:action");
        return;
      }
      const payload = {
        permission_key: permissionKey,
        resource: values.resource,
        action: values.action,
        name: values.name,
        description: editing?.description || "",
        risk_level: values.risk_level,
        status: values.status,
      };
      setSaving(true);
      const result = editing
        ? await updatePermission(editing.permission_key, payload)
        : await createPermission(payload);
      setModalOpen(false);
      publishSuccess(result.policy_version);
      await Promise.all([load(), refreshMetadata()]);
    } catch (error: any) {
      if (error?.errorFields) return;
      messageApi.error(error.message || "保存权限定义失败");
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<ModulePermissionRow> = [
    {
      title: "名称",
      dataIndex: "name",
      width: "22%",
      ellipsis: true,
      render: (value, row) =>
        row.__groupHeader ? (
          <span className="authz-module-permission-group-title">{row.__groupHeader}</span>
        ) : (
          value
        ),
    },
    {
      title: "Permission Key",
      dataIndex: "permission_key",
      render: (value, row) =>
        row.__groupHeader ? null : (
          <Typography.Text
            copyable={{ text: value }}
            ellipsis={{ tooltip: value }}
            className="authz-code authz-key-chip"
            style={{ display: "block" }}
          >
            {value}
          </Typography.Text>
        ),
    },
    {
      title: "动作",
      dataIndex: "action",
      width: 75,
      ellipsis: true,
      render: (value, row) => (row.__groupHeader ? null : value),
    },
    {
      title: "风险",
      dataIndex: "risk_level",
      width: 65,
      render: (value, row) => (row.__groupHeader ? null : <RiskTag value={value} />),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 65,
      render: (value, row) => (row.__groupHeader ? null : <StatusTag value={value} />),
    },
    {
      title: "操作",
      key: "actions",
      width: 130,
      render: (_, row) => {
        if (row.__groupHeader) return null;
        const reserved = reservedKeys.has(row.permission_key);
        return (
          <Space size={0} className="authz-catalog-actions">
            {reserved && <Tag color="red">系统保留</Tag>}
            {canManage && !reserved && (
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)}>
                编辑
              </Button>
            )}
            {canManage && !reserved && (
              <Popconfirm
                title="确认禁用该权限定义？"
                okButtonProps={{ danger: true }}
                onConfirm={async () => {
                  try {
                    const result = await deletePermission(row.permission_key);
                    publishSuccess(result.policy_version);
                    await Promise.all([load(), refreshMetadata()]);
                  } catch (error: any) {
                    messageApi.error(error.message || "禁用权限失败");
                  }
                }}
              >
                <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                  禁用
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      {contextHolder}
      <FilterBar
        keyword={keyword}
        setKeyword={setKeyword}
        showSearchButton={false}
        onSearch={() => setQueryKeyword(keyword.trim())}
        onRefresh={() => {
          void load();
          void loadCatalog();
          if (detailTab === "apis") void loadApis();
        }}
        placeholder="Permission Key 或名称"
        extra={
          canManage && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建权限
            </Button>
          )
        }
      >
        <Select
          value={riskLevel}
          onChange={setRiskLevel}
          style={{ width: 120 }}
          options={[{ label: "全部风险", value: "" }, ...riskLevelOptions(options.risk_levels)]}
        />
        <StatusSelect value={status} onChange={setStatus} />
      </FilterBar>
      {catalogError && (
        <Alert
          type="warning"
          showIcon
          message={`页面目录加载失败，暂无法按导航顺序排列：${catalogError}`}
          action={
            <Button size="small" onClick={() => void loadCatalog()}>
              重试
            </Button>
          }
          style={{ marginBottom: 12 }}
        />
      )}
      <Typography.Paragraph type="secondary">
        功能模块按固定顺序排列；未列出的模块按关联页面的导航顺序排列，未关联页面的排在后面。
      </Typography.Paragraph>
      <div className="authz-page-browser">
        <nav className="authz-page-browser-nav authz-permission-modules" aria-label="功能模块">
          {moduleGroups.map(([title, groupModules]) => (
            <div key={title} className="authz-module-section">
              {moduleGroups.length > 1 && <div className="authz-module-section-title">{title}</div>}
              {groupModules.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  className={`authz-page-browser-nav-item${currentModule?.key === entry.key ? " is-active" : ""}`}
                  aria-pressed={currentModule?.key === entry.key}
                  title={entry.resource}
                  onClick={() => {
                    setActiveModule(entry.key);
                    setApiKeyword("");
                  }}
                >
                  <span className="authz-module-label">
                    <ModuleIcon resource={entry.resource} name={entry.label} />
                    <span>{entry.label}</span>
                  </span>
                  <span>{entry.items.length}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="authz-page-tree-group authz-fade-in" key={currentModule?.key || ""}>
          <div className="authz-page-tree-heading authz-catalog-heading">
            <span className="authz-module-title">
              {currentModule && <ModuleIcon resource={currentModule.resource} name={currentModule.label} />}
              {currentModule ? currentModule.label : "功能权限"}
            </span>
            <span className="authz-page-tree-count">{currentModule?.items.length || 0} 项权限</span>
          </div>
          <Tabs
            className="authz-module-detail-tabs"
            activeKey={detailTab}
            onChange={(key) => {
              setDetailTab(key);
              if (key === "apis" && apiItems === null && !apiLoading) void loadApis();
            }}
            items={[
              {
                key: "permissions",
                label: "权限定义",
                children: (
                  <Table
                    className="authz-table"
                    size="small"
                    rowKey={(row) => (row.__groupHeader ? `group:${row.__groupHeader}` : String(row.id))}
                    rowClassName={(row) => (row.__groupHeader ? "authz-catalog-group-row" : "")}
                    columns={columns}
                    dataSource={modulePermissionRows}
                    loading={loading || catalogLoading}
                    tableLayout="fixed"
                    pagination={false}
                    locale={{ emptyText: "没有匹配的权限" }}
                  />
                ),
              },
              {
                key: "apis",
                label: "API 接口",
                children: (
                  <div className="authz-module-api-panel">
                    <Typography.Paragraph type="secondary">
                      {currentModule?.resource === "*"
                        ? "系统权限覆盖受保护接口，实际调用仍需通过相关校验。"
                        : "显示此功能模块关联的 API 映射，包含已启用和已禁用的接口。"}
                    </Typography.Paragraph>
                    <Input
                      allowClear
                      value={apiKeyword}
                      onChange={(event) => setApiKeyword(event.target.value)}
                      placeholder="搜索接口路径、方法或权限"
                      style={{ width: 280, maxWidth: "100%", marginBottom: 12 }}
                    />
                    {apiError ? (
                      <Alert
                        type="error"
                        showIcon
                        message={apiError}
                        action={
                          <Button size="small" onClick={() => void loadApis()}>
                            重试
                          </Button>
                        }
                      />
                    ) : (
                      <Table<AuthzEndpoint>
                        className="authz-table"
                        size="small"
                        rowKey="id"
                        loading={apiLoading}
                        dataSource={moduleApis}
                        tableLayout="fixed"
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: false,
                          showTotal: (total) => `共 ${total} 个接口`,
                        }}
                        locale={{ emptyText: "没有匹配的 API 接口" }}
                        columns={[
                          {
                            title: "方法",
                            dataIndex: "method",
                            width: 70,
                            render: (method: string) => (
                              <Tag color={method === "GET" ? "blue" : undefined}>{method}</Tag>
                            ),
                          },
                          {
                            title: "接口路径",
                            dataIndex: "path_pattern",
                            width: "38%",
                            ellipsis: true,
                            render: (path: string) => (
                              <Typography.Text code ellipsis={{ tooltip: path }} style={{ display: "block" }}>
                                {path}
                              </Typography.Text>
                            ),
                          },
                          {
                            title: "所需权限",
                            dataIndex: "permission_key",
                            ellipsis: true,
                            render: (key: string) => permissionNames.get(key) || key || "—",
                          },
                          {
                            title: "模式",
                            dataIndex: "public_mode",
                            width: 90,
                            render: (mode: string) =>
                              mode === "public" ? "公开" : mode.startsWith("hmac") ? "需签名" : "权限校验",
                          },
                          {
                            title: "状态",
                            dataIndex: "status",
                            width: 70,
                            render: (value: BinaryStatus) => <StatusTag value={value} />,
                          },
                        ]}
                      />
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
      <Modal
        title={editing ? "编辑权限定义" : "新建权限定义"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void save()}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Space align="start" style={{ width: "100%" }}>
            <Form.Item
              name="resource"
              label="资源"
              rules={[
                { required: true },
                { pattern: /^[a-z0-9-]+$/, message: "仅支持小写字母、数字和连字符" },
              ]}
            >
              <Input disabled={Boolean(editing)} placeholder="device" />
            </Form.Item>
            <Form.Item
              name="action"
              label="动作"
              rules={[
                { required: true },
                { pattern: /^[a-z0-9-]+$/, message: "仅支持小写字母、数字和连字符" },
              ]}
            >
              <Input disabled={Boolean(editing)} placeholder="read" />
            </Form.Item>
          </Space>
          <Form.Item label="Permission Key">
            <Input
              disabled
              value={
                editing?.permission_key || `${watchedResource || "resource"}:${watchedAction || "action"}`
              }
            />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="risk_level" label="风险等级" rules={[{ required: true }]}>
            <Select options={riskLevelOptions(options.risk_levels)} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "启用", value: 1 },
                { label: "禁用", value: 0 },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
