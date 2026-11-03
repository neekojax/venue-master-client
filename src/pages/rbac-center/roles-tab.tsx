import { Fragment, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ApartmentOutlined,
  CrownOutlined,
  DeleteOutlined,
  DesktopOutlined,
  DownOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  RightOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Checkbox,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  type AuthzEndpoint,
  type AuthzRoleTemplate,
  type BinaryStatus,
  createRoleTemplate,
  deleteRoleTemplate,
  fetchEndpoints,
  fetchRoleAccess,
  fetchRoleTemplates,
  replaceRoleAccess,
  type RoleAccessData,
  type RoleFrontendRouteOption,
  updateRoleTemplate,
} from "./api";
import { cleanParams, FilterBar, pageSize, StatusSelect, StatusTag } from "./common";
import { useAuthzPage } from "./context";
import { NavigationIcon } from "./navigation-icons";
import { compareResources, getResourceNavigation, resourceName } from "./permission-catalog";
import { groupRoutes, parentRoutePaths, routeDepth } from "./route-catalog";

const roleIcons: Record<string, ReactNode> = {
  "system-super-admin": <CrownOutlined />,
  "rbac-admin": <SafetyCertificateOutlined />,
  "organization-admin": <ApartmentOutlined />,
  "organization-readonly": <EyeOutlined />,
  "organization-ops": <ToolOutlined />,
  "week-report-editor": <FileTextOutlined />,
  "venue-detail-viewer": <EnvironmentOutlined />,
  "miner-agent-monitor-viewer": <DesktopOutlined />,
  "ai-operations-agent": <RobotOutlined />,
};

function routeRequirementsSatisfied(route: RoleFrontendRouteOption, selectedKeys: Set<string>) {
  const requirements = route.requirements || [];
  if (requirements.length === 0 || requirements.some((item) => item.requirement_type === "authenticated")) {
    return true;
  }
  const any = requirements.filter((item) => item.requirement_type === "any");
  const all = requirements.filter((item) => item.requirement_type === "all");
  return (
    (any.length > 0 && any.some((item) => selectedKeys.has(item.permission_key))) ||
    (all.length > 0 && all.every((item) => selectedKeys.has(item.permission_key)))
  );
}

export default function RolesTab() {
  const { canManage, publishSuccess, refreshMetadata } = useAuthzPage();
  const [messageApi, contextHolder] = message.useMessage();
  const [rows, setRows] = useState<AuthzRoleTemplate[]>([]);
  const [permissionMap, setPermissionMap] = useState<Record<string, string[]>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [queryKeyword, setQueryKeyword] = useState("");
  const [status, setStatus] = useState<BinaryStatus | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AuthzRoleTemplate | null>(null);
  const [accessRole, setAccessRole] = useState<AuthzRoleTemplate | null>(null);
  const [accessData, setAccessData] = useState<RoleAccessData | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [activeAccessTab, setActiveAccessTab] = useState("pages");
  const [pageKeyword, setPageKeyword] = useState("");
  const [permissionKeyword, setPermissionKeyword] = useState("");
  const [pageView, setPageView] = useState<"selected" | "all">("all");
  const [activeNavigation, setActiveNavigation] = useState("");
  const [collapsedPaths, setCollapsedPaths] = useState<string[]>([]);
  const [permissionView, setPermissionView] = useState<"selected" | "all" | "api">("selected");
  const [apiItems, setApiItems] = useState<AuthzEndpoint[] | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiKeyword, setApiKeyword] = useState("");
  const [apiFilter, setApiFilter] = useState("all");
  const [expandedPermissionApis, setExpandedPermissionApis] = useState<string[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [checkedRouteIds, setCheckedRouteIds] = useState<number[]>([]);
  const [visiblePermissionKeys, setVisiblePermissionKeys] = useState<string[]>([]);
  const [visibleRouteIds, setVisibleRouteIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const accessRequestId = useRef(0);
  const apiRequestId = useRef(0);
  const listRequestId = useRef(0);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    const requestId = ++listRequestId.current;
    setLoading(true);
    try {
      const data = await fetchRoleTemplates(
        cleanParams({ page, page_size: pageSize, keyword: queryKeyword, status }),
      );
      if (requestId !== listRequestId.current) return;
      setRows(data.list || []);
      setPermissionMap(data.permissions || {});
      setTotal(data.total || 0);
    } catch (error: any) {
      if (requestId === listRequestId.current) messageApi.error(error.message || "加载角色模板失败");
    } finally {
      if (requestId === listRequestId.current) setLoading(false);
    }
  }, [messageApi, page, queryKeyword, status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (keyword.trim() !== queryKeyword) {
        setPage(1);
        setQueryKeyword(keyword.trim());
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword, queryKeyword]);

  const resourceNavigation = useMemo(
    () => getResourceNavigation(accessData?.permissions || [], accessData?.frontend_routes || []),
    [accessData],
  );

  const groupedPermissions = useMemo(() => {
    const map = new Map<string, RoleAccessData["permissions"]>();
    (accessData?.permissions || [])
      .filter((permission) => {
        const selected = checkedKeys.includes(permission.permission_key);
        const matches = `${permission.name} ${permission.permission_key} ${permission.resource}`
          .toLowerCase()
          .includes(permissionKeyword.trim().toLowerCase());
        return (
          matches &&
          (permissionView === "all" || selected || visiblePermissionKeys.includes(permission.permission_key))
        );
      })
      .forEach((permission) => {
        const list = map.get(permission.resource) || [];
        list.push(permission);
        map.set(permission.resource, list);
      });
    return Array.from(map.entries()).sort(([left], [right]) => {
      return compareResources(left, right, resourceNavigation);
    });
  }, [accessData, checkedKeys, permissionKeyword, permissionView, visiblePermissionKeys, resourceNavigation]);
  const permissionByKey = useMemo(
    () => new Map((accessData?.permissions || []).map((item) => [item.permission_key, item])),
    [accessData],
  );
  const selectedKeySet = useMemo(() => new Set(checkedKeys), [checkedKeys]);
  const selectedRouteSet = useMemo(() => new Set(checkedRouteIds), [checkedRouteIds]);
  const missingRoutes = useMemo(
    () =>
      (accessData?.frontend_routes || []).filter(
        (route) =>
          route.configurable &&
          selectedRouteSet.has(route.id) &&
          !routeRequirementsSatisfied(route, selectedKeySet),
      ),
    [accessData, selectedKeySet, selectedRouteSet],
  );
  const matchedPageIds = useMemo(() => {
    const routes = accessData?.frontend_routes || [];
    return new Set(
      routes
        .filter(
          (route) =>
            route.route_type !== "navigation" &&
            `${route.name} ${route.path}`.toLowerCase().includes(pageKeyword.trim().toLowerCase()) &&
            (pageView === "all" ||
              visibleRouteIds.includes(route.id) ||
              (route.configurable ? selectedRouteSet.has(route.id) : route.granted)),
        )
        .map((route) => route.id),
    );
  }, [accessData, pageKeyword, pageView, selectedRouteSet, visibleRouteIds]);
  const groupedRoutes = useMemo(() => {
    const routes = accessData?.frontend_routes || [];
    const byPath = new Map(routes.map((route) => [route.path, route]));
    const visible = new Set(matchedPageIds);
    routes
      .filter((route) => matchedPageIds.has(route.id))
      .forEach((route) => {
        const seen = new Set([route.path]);
        let parentPath = route.parent_path;
        while (parentPath && !seen.has(parentPath)) {
          seen.add(parentPath);
          const parent = byPath.get(parentPath);
          if (!parent || parent.route_type === "navigation") break;
          visible.add(parent.id);
          parentPath = parent.parent_path;
        }
      });
    return groupRoutes(routes.filter((route) => route.route_type !== "navigation" && visible.has(route.id)));
  }, [accessData, matchedPageIds]);
  const selectedPageCount = (accessData?.frontend_routes || []).filter(
    (route) =>
      route.route_type !== "navigation" &&
      (route.configurable ? selectedRouteSet.has(route.id) : route.granted),
  ).length;
  const navigationGroups = useMemo(
    () =>
      groupRoutes((accessData?.frontend_routes || []).filter((route) => route.route_type !== "navigation")),
    [accessData],
  );
  const visibleNavigationGroups = pageKeyword.trim()
    ? navigationGroups.filter(([name]) => groupedRoutes.some(([groupName]) => groupName === name))
    : navigationGroups;
  const currentNavigation =
    visibleNavigationGroups.find(([name]) => name === activeNavigation) ||
    visibleNavigationGroups.find(([, routes]) => routes.some((route) => route.route_type === "detail")) ||
    visibleNavigationGroups[0];
  const currentRoutes = groupedRoutes.find(([name]) => name === currentNavigation?.[0])?.[1] || [];
  const routeByPath = useMemo(
    () => new Map((accessData?.frontend_routes || []).map((route) => [route.path, route])),
    [accessData],
  );
  const isHiddenByCollapse = (route: RoleFrontendRouteOption) => {
    if (pageKeyword.trim()) return false;
    const seen = new Set([route.path]);
    let parentPath = route.parent_path;
    while (parentPath && !seen.has(parentPath)) {
      if (collapsedPaths.includes(parentPath)) return true;
      seen.add(parentPath);
      parentPath = routeByPath.get(parentPath)?.parent_path || "";
    }
    return false;
  };

  const apiAccessStatus = (endpoint: AuthzEndpoint) => {
    if (endpoint.status !== 1) return "disabled";
    if (endpoint.public_mode === "public") return "public";
    if (endpoint.public_mode === "hmac_read" || endpoint.public_mode === "hmac_write") return "hmac";
    if (!endpoint.permission_key) return "unconfigured";
    return accessRole?.id === "system-super-admin" || selectedKeySet.has(endpoint.permission_key)
      ? "granted"
      : "denied";
  };

  const loadApis = async () => {
    const requestId = ++apiRequestId.current;
    setApiLoading(true);
    setApiError("");
    try {
      const all: AuthzEndpoint[] = [];
      let pageNumber = 1;
      let total = 0;
      do {
        const data = await fetchEndpoints({ page: pageNumber, page_size: 200 });
        const batch = data.list || [];
        all.push(...batch);
        total = data.total || 0;
        if (batch.length === 0) break;
        pageNumber += 1;
      } while (all.length < total);
      if (requestId === apiRequestId.current) setApiItems(all);
    } catch (error: any) {
      if (requestId === apiRequestId.current) setApiError(error.message || "加载 API 映射失败");
    } finally {
      if (requestId === apiRequestId.current) setApiLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 1 });
    setModalOpen(true);
  };

  const openEdit = (role: AuthzRoleTemplate) => {
    setEditing(role);
    form.setFieldsValue(role);
    setModalOpen(true);
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const result = editing
        ? await updateRoleTemplate(editing.id, {
            name: values.name,
            description: values.description || "",
            status: values.status,
          })
        : await createRoleTemplate({
            id: values.id,
            name: values.name,
            description: values.description || "",
          });
      setModalOpen(false);
      publishSuccess(result.policy_version);
      await Promise.all([load(), refreshMetadata()]);
    } catch (error: any) {
      if (error?.errorFields) return;
      messageApi.error(error.message || "保存角色失败");
    } finally {
      setSaving(false);
    }
  };

  const loadAccess = async (roleId: string, collapseInitially = false) => {
    const requestId = ++accessRequestId.current;
    setAccessLoading(true);
    try {
      const data = await fetchRoleAccess(roleId);
      if (requestId !== accessRequestId.current) return;
      setAccessData(data);
      if (collapseInitially) setCollapsedPaths(parentRoutePaths(data.frontend_routes || []));
      setCheckedKeys(data.permission_keys || []);
      setVisiblePermissionKeys(data.permission_keys || []);
      setVisibleRouteIds(
        (data.frontend_routes || []).filter((route) => route.granted).map((route) => route.id),
      );
      setCheckedRouteIds(
        (data.frontend_routes || [])
          .filter((route) => route.route_type !== "navigation" && route.configurable && route.granted)
          .map((route) => route.id),
      );
    } finally {
      if (requestId === accessRequestId.current) setAccessLoading(false);
    }
  };

  const openAccess = async (role: AuthzRoleTemplate) => {
    apiRequestId.current += 1;
    setAccessRole(role);
    setAccessData(null);
    setPageKeyword("");
    setPermissionKeyword("");
    setApiItems(null);
    setApiLoading(false);
    setApiError("");
    setApiKeyword("");
    setApiFilter("all");
    setExpandedPermissionApis([]);
    setPageView("all");
    setActiveNavigation("");
    setCollapsedPaths([]);
    setPermissionView("selected");
    setActiveAccessTab("pages");
    const requestId = accessRequestId.current + 1;
    try {
      await loadAccess(role.id, true);
    } catch (error: any) {
      if (requestId !== accessRequestId.current) return;
      messageApi.error(error.message || "加载角色访问配置失败");
      setAccessRole(null);
    }
  };

  const togglePermission = (key: string, checked: boolean) => {
    if (checked) setVisiblePermissionKeys((current) => Array.from(new Set([...current, key])));
    setCheckedKeys((current) =>
      checked
        ? current.includes(key)
          ? current
          : [...current, key]
        : current.filter((item) => item !== key),
    );
  };

  const toggleRoute = (route: RoleFrontendRouteOption, checked: boolean) => {
    if (!checked) {
      setCheckedRouteIds((current) => current.filter((id) => id !== route.id));
      return;
    }
    const selectRoute = (extraKeys: string[] = []) => {
      setCheckedRouteIds((current) => (current.includes(route.id) ? current : [...current, route.id]));
      setVisibleRouteIds((current) => Array.from(new Set([...current, route.id])));
      if (extraKeys.length > 0) {
        setCheckedKeys((current) => Array.from(new Set([...current, ...extraKeys])));
        setVisiblePermissionKeys((current) => Array.from(new Set([...current, ...extraKeys])));
        messageApi.info(`已同时勾选 ${extraKeys.length} 项页面基础权限`);
      }
    };
    if (routeRequirementsSatisfied(route, selectedKeySet)) {
      selectRoute();
      return;
    }
    const any = (route.requirements || []).filter((item) => item.requirement_type === "any");
    const all = (route.requirements || []).filter((item) => item.requirement_type === "all");
    const choices = [
      ...(any.length === 1 ? [[any[0].permission_key]] : []),
      ...(all.length > 0 ? [all.map((item) => item.permission_key)] : []),
    ];
    const riskRank = (keys: string[]) =>
      keys.filter((key) => ["high", "critical"].includes(permissionByKey.get(key)?.risk_level || "")).length;
    choices.sort((left, right) => riskRank(left) - riskRank(right) || left.length - right.length);
    if (choices.length === 0) {
      selectRoute();
      setPermissionView("all");
      messageApi.warning(`“${route.name}”需要从多项基础权限中至少选择一项，请切换到“功能权限”勾选`);
      return;
    }
    const extraKeys = choices[0].filter((key) => !selectedKeySet.has(key));
    const unavailable = extraKeys.filter((key) => !permissionByKey.has(key));
    if (unavailable.length > 0) {
      messageApi.warning(`“${route.name}”所需权限不可选：${unavailable.join("、")}`);
      return;
    }
    if (riskRank(extraKeys) > 0) {
      Modal.confirm({
        title: `确认授予高风险权限并开放“${route.name}”？`,
        content: `将同时给角色添加：${extraKeys.map((key) => permissionByKey.get(key)?.name || key).join("、")}。这些权限也可能用于接口和按钮。`,
        okText: "确认授予",
        onOk: () => selectRoute(extraKeys),
      });
      return;
    }
    selectRoute(extraKeys);
  };

  const saveAccess = () => {
    if (!accessRole || !accessData) return;
    if (checkedKeys.includes("system:all")) {
      messageApi.warning("system:all 是系统保留权限，不能下放");
      return;
    }
    if (
      accessRole.id === "rbac-admin" &&
      (!checkedKeys.includes("authz:read") || !checkedKeys.includes("authz:manage"))
    ) {
      messageApi.warning("rbac-admin 必须保留 authz:read 和 authz:manage");
      return;
    }
    if (accessRole.id !== "rbac-admin" && checkedKeys.includes("authz:manage")) {
      messageApi.warning("authz:manage 只能配置给 rbac-admin");
      return;
    }
    if (missingRoutes.length > 0) {
      setActiveAccessTab("pages");
      messageApi.warning(`以下页面缺少基础权限：${missingRoutes.map((route) => route.name).join("、")}`);
      return;
    }
    Modal.confirm({
      title: "确认保存角色访问配置？",
      content:
        "权限和页面将同时完整替换；未勾选的权限与可配置页面会从该角色移除。策略发布后最多约 30 秒生效。",
      okText: "确认替换",
      onOk: async () => {
        try {
          setSaving(true);
          const result = await replaceRoleAccess(accessRole.id, {
            permission_keys: checkedKeys,
            frontend_route_ids: (accessData.frontend_routes || [])
              .filter(
                (route) =>
                  route.route_type !== "navigation" && route.configurable && selectedRouteSet.has(route.id),
              )
              .map((route) => route.id),
          });
          publishSuccess(result.policy_version);
          try {
            await Promise.all([loadAccess(accessRole.id), load(), refreshMetadata()]);
          } catch (error: any) {
            messageApi.warning(`配置已保存，但刷新失败：${error.message || "请重新打开角色配置"}`);
          }
        } catch (error: any) {
          messageApi.error(error.message || "保存角色访问配置失败");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const columns: ColumnsType<AuthzRoleTemplate> = [
    {
      title: "角色名称",
      dataIndex: "name",
      width: 180,
      render: (name, role) => (
        <Space size={8}>
          <span className="authz-role-icon" aria-hidden="true">
            {roleIcons[role.id] || <TeamOutlined />}
          </span>
          <Typography.Text strong>{name}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "角色 ID",
      dataIndex: "id",
      width: 220,
      render: (id) => <span className="authz-code">{id}</span>,
    },
    { title: "说明", dataIndex: "description", ellipsis: true, render: (value) => value || "—" },
    {
      title: "权限数",
      key: "permission_count",
      width: 90,
      render: (_, row) => permissionMap[row.id]?.length || 0,
    },
    { title: "状态", dataIndex: "status", width: 80, render: (value) => <StatusTag value={value} /> },
    {
      title: "操作",
      key: "actions",
      width: 300,
      fixed: "right",
      render: (_, row) => (
        <Space size={4}>
          <Button type="link" icon={<SafetyCertificateOutlined />} onClick={() => void openAccess(row)}>
            {canManage && row.id !== "system-super-admin" ? "配置页面与权限" : "查看页面与权限"}
          </Button>
          {canManage && row.builtin !== 1 && (
            <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(row)}>
              编辑
            </Button>
          )}
          {canManage && row.builtin !== 1 && (
            <Popconfirm
              title="确认禁用该角色？"
              description="这是软禁用，历史记录仍可查询。"
              okButtonProps={{ danger: true }}
              onConfirm={async () => {
                try {
                  const result = await deleteRoleTemplate(row.id);
                  publishSuccess(result.policy_version);
                  await Promise.all([load(), refreshMetadata()]);
                } catch (error: any) {
                  messageApi.error(error.message || "禁用角色失败");
                }
              }}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                禁用
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <FilterBar
        keyword={keyword}
        setKeyword={setKeyword}
        showSearchButton={false}
        onSearch={() => {
          setPage(1);
          setQueryKeyword(keyword.trim());
        }}
        onRefresh={() => void load()}
        placeholder="角色名称或 ID"
        extra={
          canManage && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建角色
            </Button>
          )
        }
      >
        <StatusSelect value={status} onChange={setStatus} />
      </FilterBar>
      <Table
        className="authz-table"
        size="small"
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: false,
          showTotal: (value) => `共 ${value} 条`,
          onChange: setPage,
        }}
      />

      <Modal
        title={editing ? "编辑角色" : "新建自定义角色"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void save()}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          {!editing && (
            <Form.Item
              name="id"
              label="角色 ID"
              extra="只允许小写字母、数字和连字符；不能使用 system- 前缀。"
              rules={[
                { required: true },
                { pattern: /^(?!system-)[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "角色 ID 格式不正确" },
              ]}
            >
              <Input placeholder="device-viewer" />
            </Form.Item>
          )}
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={3} />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: "启用", value: 1 },
                  { label: "禁用", value: 0 },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Drawer
        title={`${canManage && accessRole?.id !== "system-super-admin" ? "配置" : "查看"}角色访问 · ${accessRole?.name || ""}`}
        open={Boolean(accessRole)}
        onClose={() => {
          accessRequestId.current += 1;
          apiRequestId.current += 1;
          setAccessRole(null);
          setAccessData(null);
          setAccessLoading(false);
        }}
        width={820}
        extra={
          canManage &&
          accessRole?.id !== "system-super-admin" && (
            <Button
              type="primary"
              loading={saving}
              disabled={!accessData || accessLoading}
              onClick={saveAccess}
            >
              保存页面与权限
            </Button>
          )
        }
      >
        <Spin spinning={accessLoading} tip="加载角色访问配置...">
          {accessData && (
            <>
              <Alert
                type="info"
                showIcon
                message="勾选页面和功能权限后统一保存；取消页面不会移除功能权限。"
                style={{ marginBottom: 16 }}
              />
              <Tabs
                activeKey={activeAccessTab}
                onChange={setActiveAccessTab}
                items={[
                  {
                    key: "pages",
                    label: `页面访问（${selectedPageCount}）`,
                    children: (
                      <>
                        {missingRoutes.length > 0 && (
                          <Alert
                            type="warning"
                            showIcon
                            message={`有 ${missingRoutes.length} 个已选页面缺少基础权限`}
                            description={missingRoutes.map((route) => route.name).join("、")}
                            style={{ marginBottom: 16 }}
                          />
                        )}
                        <div className="authz-access-toolbar">
                          <Segmented
                            value={pageView}
                            onChange={(value) => {
                              if (value === "selected")
                                setVisibleRouteIds(
                                  (accessData.frontend_routes || [])
                                    .filter((route) =>
                                      route.configurable ? selectedRouteSet.has(route.id) : route.granted,
                                    )
                                    .map((route) => route.id),
                                );
                              setPageView(value as "selected" | "all");
                            }}
                            options={[
                              { label: `已授权 ${selectedPageCount}`, value: "selected" },
                              { label: "全部页面", value: "all" },
                            ]}
                          />
                          <Input
                            allowClear
                            value={pageKeyword}
                            onChange={(event) => setPageKeyword(event.target.value)}
                            placeholder="搜索页面名称或路径"
                          />
                        </div>
                        <div className="authz-page-browser">
                          <nav className="authz-page-browser-nav" aria-label="页面所属导航">
                            {visibleNavigationGroups.map(([groupName, routes]) => {
                              const grantedCount = routes.filter((route) =>
                                route.configurable ? selectedRouteSet.has(route.id) : route.granted,
                              ).length;
                              return (
                                <button
                                  key={groupName}
                                  type="button"
                                  className={`authz-page-browser-nav-item${currentNavigation?.[0] === groupName ? " is-active" : ""}`}
                                  aria-pressed={currentNavigation?.[0] === groupName}
                                  onClick={() => setActiveNavigation(groupName)}
                                >
                                  <span>
                                    <NavigationIcon name={groupName} /> {groupName}
                                  </span>
                                  <span>
                                    {grantedCount}/{routes.length}
                                  </span>
                                </button>
                              );
                            })}
                          </nav>
                          <div className="authz-page-tree-group">
                            <div className="authz-page-tree-heading">
                              <span>{currentNavigation?.[0] || "页面"}</span>
                              <span className="authz-page-tree-count">勾选表示该角色可访问</span>
                            </div>
                            {currentRoutes
                              .filter((route) => !isHiddenByCollapse(route))
                              .map((route) => {
                                const checked = route.configurable
                                  ? selectedRouteSet.has(route.id)
                                  : route.granted;
                                const satisfied = routeRequirementsSatisfied(route, selectedKeySet);
                                const contextOnly = !matchedPageIds.has(route.id);
                                const any = (route.requirements || []).filter(
                                  (item) => item.requirement_type === "any",
                                );
                                const all = (route.requirements || []).filter(
                                  (item) => item.requirement_type === "all",
                                );
                                const names = (keys: string[]) =>
                                  keys.map((key) => permissionByKey.get(key)?.name || key).join("、");
                                const hasChildren = currentRoutes.some(
                                  (item) => item.parent_path === route.path,
                                );
                                const collapsed = collapsedPaths.includes(route.path);
                                return (
                                  <div
                                    className={`authz-role-route${checked ? " is-selected" : ""}${route.parent_path ? " is-child" : ""}${contextOnly ? " is-context" : ""}`}
                                    style={{
                                      marginLeft: routeDepth(route, accessData.frontend_routes || []) * 18,
                                    }}
                                    key={route.id}
                                  >
                                    <div className="authz-role-route-main">
                                      {hasChildren ? (
                                        <Button
                                          type="text"
                                          size="small"
                                          className="authz-page-tree-toggle"
                                          disabled={Boolean(pageKeyword.trim())}
                                          aria-label={`${collapsed && !pageKeyword.trim() ? "展开" : "收起"}${route.name}的详情页`}
                                          aria-expanded={!collapsed || Boolean(pageKeyword.trim())}
                                          icon={
                                            collapsed && !pageKeyword.trim() ? (
                                              <RightOutlined />
                                            ) : (
                                              <DownOutlined />
                                            )
                                          }
                                          onClick={() =>
                                            setCollapsedPaths((current) =>
                                              collapsed
                                                ? current.filter((path) => path !== route.path)
                                                : [...current, route.path],
                                            )
                                          }
                                        />
                                      ) : (
                                        <span className="authz-page-tree-toggle-spacer" />
                                      )}
                                      <Checkbox
                                        checked={checked}
                                        disabled={
                                          !canManage ||
                                          accessRole?.id === "system-super-admin" ||
                                          !route.configurable
                                        }
                                        onChange={(event) => toggleRoute(route, event.target.checked)}
                                      >
                                        <Tooltip title={route.path}>
                                          <Typography.Text strong>{route.name}</Typography.Text>
                                        </Tooltip>
                                      </Checkbox>
                                      {contextOnly && (
                                        <span className="authz-page-tree-context">上级页面</span>
                                      )}
                                      {!route.configurable && <Tag color="green">自动开放</Tag>}
                                      {checked && route.configurable && !satisfied && (
                                        <Tag color="red">基础权限不足</Tag>
                                      )}
                                    </div>
                                    {checked && !satisfied && any.length > 0 && (
                                      <div className="authz-muted authz-role-route-detail">
                                        拥有任一权限即可：{names(any.map((item) => item.permission_key))}
                                      </div>
                                    )}
                                    {checked && !satisfied && all.length > 0 && (
                                      <div className="authz-muted authz-role-route-detail">
                                        {any.length > 0 ? "或同时拥有：" : "需同时拥有："}
                                        {names(all.map((item) => item.permission_key))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            {currentRoutes.length === 0 && (
                              <div className="authz-access-empty">
                                <Typography.Text type="secondary">
                                  {pageKeyword
                                    ? "没有匹配的页面"
                                    : pageView === "selected"
                                      ? "该导航暂无已授权页面"
                                      : "暂无页面"}
                                </Typography.Text>
                                {pageView === "selected" && (
                                  <Button type="link" onClick={() => setPageView("all")}>
                                    查看全部页面
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ),
                  },
                  {
                    key: "permissions",
                    label: `功能权限（${checkedKeys.length}）`,
                    children: (
                      <>
                        <div className="authz-access-toolbar">
                          <Segmented
                            value={permissionView}
                            onChange={(value) => {
                              if (value === "selected") setVisiblePermissionKeys(checkedKeys);
                              setPermissionView(value as "selected" | "all" | "api");
                              if (value === "api" && apiItems === null && !apiLoading) void loadApis();
                            }}
                            options={[
                              { label: `已授权 ${checkedKeys.length}`, value: "selected" },
                              { label: "全部权限", value: "all" },
                              { label: "API 接口", value: "api" },
                            ]}
                          />
                          <Input
                            allowClear
                            value={permissionView === "api" ? apiKeyword : permissionKeyword}
                            onChange={(event) =>
                              permissionView === "api"
                                ? setApiKeyword(event.target.value)
                                : setPermissionKeyword(event.target.value)
                            }
                            placeholder={
                              permissionView === "api" ? "搜索接口路径或权限" : "搜索权限名称或标识"
                            }
                          />
                        </div>
                        {permissionView === "api" ? (
                          <>
                            <Alert
                              showIcon
                              type="info"
                              message="授权状态根据当前勾选的角色权限判断；实际调用还需通过组织等校验。公开接口和签名接口单独标识。"
                              style={{ marginBottom: 12 }}
                            />
                            <Select
                              value={apiFilter}
                              onChange={setApiFilter}
                              style={{ width: 150, marginBottom: 12 }}
                              options={[
                                { label: "全部接口", value: "all" },
                                { label: "已授权", value: "granted" },
                                { label: "未授权", value: "denied" },
                                { label: "公开接口", value: "public" },
                                { label: "签名接口", value: "hmac" },
                                { label: "已禁用", value: "disabled" },
                                { label: "未配置权限", value: "unconfigured" },
                              ]}
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
                                size="small"
                                rowKey="id"
                                loading={apiLoading}
                                dataSource={(apiItems || []).filter((item) => {
                                  const text =
                                    `${item.method} ${item.path_pattern} ${item.permission_key} ${permissionByKey.get(item.permission_key)?.name || ""}`.toLowerCase();
                                  return (
                                    text.includes(apiKeyword.trim().toLowerCase()) &&
                                    (apiFilter === "all" || apiAccessStatus(item) === apiFilter)
                                  );
                                })}
                                pagination={{
                                  pageSize: 10,
                                  showSizeChanger: false,
                                  showTotal: (total) => `共 ${total} 个接口`,
                                }}
                                locale={{ emptyText: "没有匹配的接口" }}
                                columns={[
                                  {
                                    title: "方法",
                                    dataIndex: "method",
                                    width: 70,
                                    render: (method: string) => <Tag>{method}</Tag>,
                                  },
                                  {
                                    title: "接口路径",
                                    dataIndex: "path_pattern",
                                    render: (path: string) => <Typography.Text code>{path}</Typography.Text>,
                                  },
                                  {
                                    title: "所需权限",
                                    dataIndex: "permission_key",
                                    render: (key: string) => permissionByKey.get(key)?.name || key || "—",
                                  },
                                  {
                                    title: "状态",
                                    width: 105,
                                    render: (_, item) => {
                                      const labels: Record<string, { label: string; color?: string }> = {
                                        granted: { label: "已授权", color: "blue" },
                                        denied: { label: "未授权" },
                                        disabled: { label: "已禁用" },
                                        public: { label: "公开", color: "green" },
                                        hmac: { label: "需签名", color: "purple" },
                                        unconfigured: { label: "未配置权限", color: "orange" },
                                      };
                                      const state = labels[apiAccessStatus(item)];
                                      return <Tag color={state.color}>{state.label}</Tag>;
                                    },
                                  },
                                ]}
                              />
                            )}
                          </>
                        ) : (
                          <>
                            <Typography.Paragraph type="secondary">
                              按页面关联的系统导航排序；部分权限可能被多个页面或接口共同使用。
                            </Typography.Paragraph>
                            {groupedPermissions.map(([resource, items], index) => (
                              <Fragment key={resource}>
                                {(index === 0 ||
                                  (resourceNavigation.get(resource)?.navigation || "其他功能") !==
                                    (resourceNavigation.get(groupedPermissions[index - 1][0])?.navigation ||
                                      "其他功能")) && (
                                  <div className="authz-permission-navigation">
                                    <NavigationIcon
                                      name={resourceNavigation.get(resource)?.navigation || "其他功能"}
                                    />
                                    {resourceNavigation.get(resource)?.navigation || "其他功能"}
                                  </div>
                                )}
                                <div className="authz-permission-group">
                                  <div className="authz-permission-group-title">
                                    <Tooltip title={resource}>
                                      {resourceName(resource, accessData.permissions || [])}
                                    </Tooltip>{" "}
                                    <Tag>{items.length} 项</Tag>
                                  </div>
                                  <div className="authz-access-permissions">
                                    {items.map((item) => {
                                      const reserved = item.permission_key === "system:all";
                                      const manageLocked =
                                        item.permission_key === "authz:manage" &&
                                        accessRole?.id !== "rbac-admin";
                                      const requiredForAdmin =
                                        accessRole?.id === "rbac-admin" &&
                                        ["authz:read", "authz:manage"].includes(item.permission_key);
                                      const expanded = expandedPermissionApis.includes(item.permission_key);
                                      const relatedApis = (apiItems || []).filter((endpoint) =>
                                        item.permission_key === "system:all"
                                          ? endpoint.public_mode === "protected" &&
                                            Boolean(endpoint.permission_key)
                                          : endpoint.permission_key === item.permission_key,
                                      );
                                      return (
                                        <div
                                          className={`authz-access-permission${selectedKeySet.has(item.permission_key) ? " is-selected" : ""}`}
                                          key={item.permission_key}
                                        >
                                          <Checkbox
                                            key={item.permission_key}
                                            checked={selectedKeySet.has(item.permission_key)}
                                            disabled={
                                              !canManage ||
                                              accessRole?.id === "system-super-admin" ||
                                              reserved ||
                                              manageLocked ||
                                              requiredForAdmin
                                            }
                                            onChange={(event) =>
                                              togglePermission(item.permission_key, event.target.checked)
                                            }
                                          >
                                            <Tooltip title={item.permission_key}>{item.name}</Tooltip>{" "}
                                            {["high", "critical"].includes(item.risk_level) && (
                                              <Tag color="orange">高风险</Tag>
                                            )}
                                            {reserved && <Tag color="red">系统保留</Tag>}
                                          </Checkbox>
                                          {selectedKeySet.has(item.permission_key) && (
                                            <Tag color="blue">已授权</Tag>
                                          )}
                                          <Button
                                            type="link"
                                            size="small"
                                            className="authz-permission-api-toggle"
                                            aria-expanded={expanded}
                                            onClick={() => {
                                              setExpandedPermissionApis((current) =>
                                                expanded
                                                  ? current.filter((key) => key !== item.permission_key)
                                                  : [...current, item.permission_key],
                                              );
                                              if (!expanded && apiItems === null && !apiLoading)
                                                void loadApis();
                                            }}
                                          >
                                            {expanded ? "收起接口" : "查看接口"}
                                            {apiItems && item.permission_key !== "system:all"
                                              ? `（${relatedApis.length}）`
                                              : ""}
                                          </Button>
                                          {expanded && (
                                            <div className="authz-permission-api-list">
                                              {apiLoading ? (
                                                <Typography.Text type="secondary">
                                                  正在加载接口…
                                                </Typography.Text>
                                              ) : apiError ? (
                                                <Space>
                                                  <Typography.Text type="danger">{apiError}</Typography.Text>
                                                  <Button
                                                    type="link"
                                                    size="small"
                                                    onClick={() => void loadApis()}
                                                  >
                                                    重试
                                                  </Button>
                                                </Space>
                                              ) : relatedApis.length === 0 ? (
                                                <Typography.Text type="secondary">
                                                  暂无关联的 API 接口
                                                </Typography.Text>
                                              ) : (
                                                <>
                                                  {item.permission_key === "system:all" && (
                                                    <Typography.Text type="secondary">
                                                      系统级权限，展示所有受保护接口；实际访问还需通过相关校验。
                                                    </Typography.Text>
                                                  )}
                                                  {relatedApis.map((endpoint) => (
                                                    <div
                                                      className="authz-permission-api-item"
                                                      key={endpoint.id}
                                                    >
                                                      <Tag
                                                        color={endpoint.method === "GET" ? "blue" : undefined}
                                                      >
                                                        {endpoint.method}
                                                      </Tag>
                                                      <Typography.Text code>
                                                        {endpoint.path_pattern}
                                                      </Typography.Text>
                                                      {endpoint.status !== 1 && <Tag>已禁用</Tag>}
                                                      {endpoint.status === 1 &&
                                                        endpoint.public_mode === "public" && (
                                                          <Tag color="green">公开</Tag>
                                                        )}
                                                      {endpoint.status === 1 &&
                                                        endpoint.public_mode.startsWith("hmac") && (
                                                          <Tag color="purple">需签名</Tag>
                                                        )}
                                                    </div>
                                                  ))}
                                                </>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </Fragment>
                            ))}
                            {groupedPermissions.length === 0 && (
                              <div className="authz-access-empty">
                                <Typography.Text type="secondary">
                                  {permissionKeyword ? "没有匹配的权限" : "暂无已授权权限"}
                                </Typography.Text>
                                {permissionView === "selected" && (
                                  <Button type="link" onClick={() => setPermissionView("all")}>
                                    查看全部权限
                                  </Button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ),
                  },
                ]}
              />
            </>
          )}
        </Spin>
      </Drawer>
    </>
  );
}
