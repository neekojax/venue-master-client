import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircleFilled,
  DeleteOutlined,
  DownOutlined,
  EyeOutlined,
  FilePdfOutlined,
  KeyOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  RightOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  type AuthorizationSnapshot,
  type AuthzAssignment,
  type AuthzEndpoint,
  type AuthzPrincipal,
  createAssignment,
  createUser,
  deleteAssignment,
  deleteUser,
  fetchEndpoints,
  fetchFrontendRoutes,
  fetchPermission,
  fetchPrincipalAuthorization,
  fetchPrincipals,
  type FrontendRequirement,
  type FrontendRoute,
  updateAssignment,
  updateUserPassword,
} from "./api";
import { cleanParams, FilterBar, RiskTag, StatusTag } from "./common";
import { useAuthzPage } from "./context";
import { ModuleIcon, NavigationIcon } from "./navigation-icons";
import { exportMatrixPdf, type MatrixPdfSection } from "./pdf-export";
import {
  compareResources,
  getResourceNavigation,
  moduleOrderIndex,
  moduleSectionOf,
  resourceName,
} from "./permission-catalog";
import { groupRoutes, parentRoutePaths, routeClickPath, routeDepth } from "./route-catalog";

const wildcardRoles = new Set(["system-super-admin", "organization-readonly", "rbac-admin"]);

const publicModeLabels: Record<string, string> = {
  protected: "需权限",
  public: "公开",
  hmac_read: "签名读",
  hmac_write: "签名写",
};

// 拉取全部启用接口，导出时按用户权限本地匹配（避免逐权限请求）。
const loadAllEndpoints = async (): Promise<AuthzEndpoint[]> => {
  const items: AuthzEndpoint[] = [];
  let page = 1;
  let total = 0;
  do {
    const result = await fetchEndpoints({ status: 1, page, page_size: 200 });
    items.push(...(result.list || []));
    total = result.total || 0;
    if (!result.list?.length) break;
    page += 1;
  } while (items.length < total);
  return items;
};

export default function PrincipalsTab() {
  const { canManage, domains, roles, permissions, publishSuccess } = useAuthzPage();
  const [messageApi, contextHolder] = message.useMessage();
  const [rows, setRows] = useState<AuthzPrincipal[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportingUsers, setExportingUsers] = useState(false);
  const [exportingUserId, setExportingUserId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [queryKeyword, setQueryKeyword] = useState("");
  const [domainFilter, setDomainFilter] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [grantOpen, setGrantOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [selectedPrincipal, setSelectedPrincipal] = useState<AuthzPrincipal | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<AuthzAssignment | null>(null);
  const [preview, setPreview] = useState<AuthorizationSnapshot | null>(null);
  const [previewCatalog, setPreviewCatalog] = useState<
    Array<FrontendRoute & { requirements: FrontendRequirement[] }>
  >([]);
  const [previewError, setPreviewError] = useState("");
  const [previewNavigation, setPreviewNavigation] = useState("");
  const [previewModule, setPreviewModule] = useState("");
  const [previewPageKeyword, setPreviewPageKeyword] = useState("");
  const [previewPermissionKeyword, setPreviewPermissionKeyword] = useState("");
  const [previewCollapsedPaths, setPreviewCollapsedPaths] = useState<string[]>([]);
  const [extraPermissionNames, setExtraPermissionNames] = useState<Record<string, string>>({});
  const [endpointDetails, setEndpointDetails] = useState<
    Record<string, { loading: boolean; items: AuthzEndpoint[]; error?: string }>
  >({});
  const [expandedPermissions, setExpandedPermissions] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [managePrincipal, setManagePrincipal] = useState<AuthzPrincipal | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [grantForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const loadRequestId = useRef(0);
  const previewRequestId = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++loadRequestId.current;
    setLoading(true);
    try {
      // 单个组织直接查；多选时按组织分别请求后合并去重（接口按单组织过滤）
      const baseParams = { principal_type: "user", keyword: queryKeyword };
      const pages =
        domainFilter.length > 1
          ? await Promise.all(
              domainFilter.map((item) => fetchPrincipals(cleanParams({ ...baseParams, domain: item }))),
            )
          : [await fetchPrincipals(cleanParams({ ...baseParams, domain: domainFilter[0] }))];
      if (requestId !== loadRequestId.current) return;
      const merged = new Map<string, AuthzPrincipal>();
      pages.forEach((page) =>
        (page.list || []).forEach((item) => {
          if (item.principal_type === "user" && !merged.has(item.principal_id)) {
            merged.set(item.principal_id, item);
          }
        }),
      );
      const nextRows = [...merged.values()];
      setRows(nextRows);
      setManagePrincipal((current) =>
        current
          ? nextRows.find(
              (item) =>
                item.principal_type === current.principal_type && item.principal_id === current.principal_id,
            ) || current
          : null,
      );
    } catch (error: any) {
      if (requestId === loadRequestId.current) messageApi.error(error.message || "加载用户失败");
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  }, [domainFilter, messageApi, queryKeyword]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => setQueryKeyword(keyword.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const openGrant = (principal?: AuthzPrincipal, assignment?: AuthzAssignment) => {
    setSelectedPrincipal(principal || null);
    setEditingAssignment(assignment || null);
    grantForm.resetFields();
    grantForm.setFieldsValue({
      principal_id: principal?.principal_id,
      role_template_id: assignment?.role_template_id,
      domain: assignment ? [assignment.domain] : [],
    });
    setGrantOpen(true);
  };

  const selectedRoleId = Form.useWatch("role_template_id", grantForm);
  const selectedDomains: string[] = Form.useWatch("domain", grantForm) || [];
  const availableDomains = domains.filter((item) => {
    if (selectedRoleId === "system-super-admin") return item.code === "*";
    if (!wildcardRoles.has(selectedRoleId)) return item.code !== "*";
    return true;
  });

  const saveGrant = async () => {
    let completed = 0;
    let lastVersion: number | undefined;
    try {
      const values = await grantForm.validateFields();
      setSaving(true);
      const selectedDomains: string[] = values.domain;
      const primaryDomain =
        editingAssignment && selectedDomains.includes(editingAssignment.domain)
          ? editingAssignment.domain
          : selectedDomains[0];
      const remainingDomains = editingAssignment
        ? selectedDomains.filter((item) => item !== primaryDomain)
        : selectedDomains;
      if (editingAssignment) {
        const result = await updateAssignment(editingAssignment.id, {
          role_template_id: values.role_template_id,
          domain: primaryDomain,
          enabled: editingAssignment.enabled,
        });
        completed++;
        lastVersion = result.policy_version;
      }
      for (const selectedDomain of remainingDomains) {
        const result = await createAssignment({
          principal_type: "user",
          principal_id: values.principal_id,
          role_template_id: values.role_template_id,
          domain: selectedDomain,
        });
        completed++;
        lastVersion = result.policy_version;
      }
      setGrantOpen(false);
      publishSuccess(lastVersion);
      await load();
    } catch (error: any) {
      if (error?.errorFields) return;
      if (completed > 0) {
        setGrantOpen(false);
        messageApi.warning(
          `已保存 ${completed} 条授权，其余未完成：${error.message || "请求失败"}。请刷新后检查并重试。`,
        );
        await load();
      } else {
        messageApi.error(error.message || "授权失败");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleAssignment = async (assignment: AuthzAssignment, enabled: boolean) => {
    try {
      const result = await updateAssignment(assignment.id, {
        role_template_id: assignment.role_template_id,
        domain: assignment.domain,
        enabled: enabled ? 1 : 0,
      });
      publishSuccess(result.policy_version);
      await load();
    } catch (error: any) {
      messageApi.error(error.message || "更新分配失败");
    }
  };

  const revoke = async (assignment: AuthzAssignment) => {
    try {
      const result = await deleteAssignment(assignment.id);
      publishSuccess(result.policy_version);
      await load();
    } catch (error: any) {
      messageApi.error(error.message || "撤销失败");
    }
  };

  // 快照里的有效权限 = 全局权限 + 各组织权限的并集（与授权预览抽屉口径一致）。
  const effectivePermissionKeys = (snapshot: AuthorizationSnapshot): string[] => {
    const keys = new Set<string>([
      ...(snapshot.permissions || []),
      ...Object.values(snapshot.domains || {}).flatMap((domainKeys) =>
        Array.isArray(domainKeys) ? domainKeys : [],
      ),
    ]);
    return [...keys];
  };

  // 导出共用的行构造器：全部导出与单个导出共享同一份口径。
  const domainName = (code: string) =>
    code === "*" ? "全部组织" : domains.find((domain) => domain.code === code)?.name || code;
  const roleName = (id: string) => roles.find((role) => role.id === id)?.name || id;
  const routeTypeLabel = (value: string) => (value === "detail" ? "详情" : "页面");
  const assignmentSummary = (principal: AuthzPrincipal) =>
    (principal.assignments || [])
      .map(
        (assignment) =>
          `${roleName(assignment.role_template_id)}@${domainName(assignment.domain)}${
            assignment.enabled === 1 ? "" : "（已停用）"
          }`,
      )
      .join("、") || "暂无授权";
  const roleDomainRows = (principal: AuthzPrincipal): string[][] =>
    (principal.assignments || []).map((assignment) => [
      domainName(assignment.domain),
      roleName(assignment.role_template_id),
      assignment.enabled === 1 ? "生效" : "已停用",
    ]);
  const permissionRows = (snapshot: AuthorizationSnapshot): string[][] =>
    effectivePermissionKeys(snapshot).map((key) => {
      const permission = permissions.find((item) => item.permission_key === key);
      return [
        permission?.name || (key === "system:all" ? "全部系统权限" : key),
        key,
        permission ? resourceName(permission.resource, permissions) : key.split(":")[0] || "—",
        permission?.risk_level || "—",
      ];
    });
  // 可调用接口 = 权限命中的受保护接口 + 公开/签名接口（任何人可调，列出一并说明）。
  const endpointRows = (snapshot: AuthorizationSnapshot, endpoints: AuthzEndpoint[]): string[][] => {
    const keys = new Set(effectivePermissionKeys(snapshot));
    return endpoints
      .filter((endpoint) => endpoint.public_mode !== "protected" || keys.has(endpoint.permission_key))
      .map((endpoint) => [
        endpoint.method,
        endpoint.path_pattern,
        endpoint.permission_key || "—",
        publicModeLabels[endpoint.public_mode] || endpoint.public_mode,
      ]);
  };
  const routeRows = (snapshot: AuthorizationSnapshot): string[][] =>
    (snapshot.frontend_routes || [])
      .filter((route) => route.route_type !== "navigation")
      .map((route) => [route.name, route.path, routeTypeLabel(route.route_type)]);
  const userLabel = (principal: AuthzPrincipal) =>
    `${principal.name || principal.nickname || principal.principal_id}（${principal.principal_id}）`;

  // 一键导出所有用户的有效授权 PDF：账号总览 + 每人「角色 / 组织、有效权限、可访问页面」三个小节（书签按账号分组）。
  const handleExportUserPdf = async () => {
    setExportingUsers(true);
    try {
      const list: AuthzPrincipal[] = [];
      let page = 1;
      let total = 0;
      do {
        const data = await fetchPrincipals({ page, page_size: 200, principal_type: "user" });
        list.push(...(data.list || []).filter((item) => item.principal_type === "user"));
        total = data.total || 0;
        if (!data.list?.length) break;
        page += 1;
      } while (list.length < total);

      const [snapshots, endpoints] = await Promise.all([
        Promise.all(
          list.map(async (item) => {
            try {
              return await fetchPrincipalAuthorization(item.principal_type, item.principal_id);
            } catch {
              return null;
            }
          }),
        ),
        loadAllEndpoints(),
      ]);

      const sections: MatrixPdfSection[] = [
        {
          title: `一、账号总览（${list.length}）`,
          head: ["账号", "名称", "状态", "角色 / 组织", "权限数", "页面数", "接口数"],
          body: list.map((item, index) => {
            const snapshot = snapshots[index];
            return [
              item.principal_id,
              item.name || item.nickname || "—",
              item.status === 1 ? "启用" : "禁用",
              assignmentSummary(item),
              snapshot ? String(effectivePermissionKeys(snapshot).length) : "加载失败",
              snapshot ? String(routeRows(snapshot).length) : "—",
              snapshot ? String(endpointRows(snapshot, endpoints).length) : "—",
            ];
          }),
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 100 },
            2: { cellWidth: 50 },
            4: { cellWidth: 56 },
            5: { cellWidth: 56 },
            6: { cellWidth: 56 },
          },
          centerColumns: [2, 4, 5, 6],
          statusColumns: [2],
        },
      ];

      list.forEach((item, index) => {
        const snapshot = snapshots[index];
        const label = userLabel(item);
        sections.push({
          title: `${label} · 角色 / 组织`,
          bookmarkParent: label,
          head: ["组织", "角色", "状态"],
          body: roleDomainRows(item),
          columnStyles: { 2: { cellWidth: 70 } },
          centerColumns: [2],
        });
        if (!snapshot) return;
        sections.push({
          title: `${label} · 有效权限`,
          bookmarkParent: label,
          head: ["权限名称", "Permission Key", "模块", "风险"],
          body: permissionRows(snapshot),
          columnStyles: {
            0: { cellWidth: 130 },
            1: { cellWidth: 220 },
            2: { cellWidth: 90 },
            3: { cellWidth: 60 },
          },
          centerColumns: [3],
          riskColumn: 3,
        });
        sections.push({
          title: `${label} · 可访问页面`,
          bookmarkParent: label,
          head: ["页面", "路径", "类型"],
          body: routeRows(snapshot),
          columnStyles: { 0: { cellWidth: 150 }, 2: { cellWidth: 60 } },
          centerColumns: [2],
        });
        sections.push({
          title: `${label} · 可调用接口`,
          bookmarkParent: label,
          head: ["方法", "路径模式", "所需权限", "访问方式"],
          body: endpointRows(snapshot, endpoints),
          columnStyles: { 0: { cellWidth: 60 }, 3: { cellWidth: 70 } },
          centerColumns: [0, 3],
        });
      });

      const stamp = new Date().toISOString().slice(0, 10);
      await exportMatrixPdf(
        sections,
        { title: "用户权限文档", generatedAt: new Date().toLocaleString("zh-CN", { hour12: false }) },
        `用户权限-${stamp}.pdf`,
      );
      messageApi.success("用户权限 PDF 已下载");
    } catch (error) {
      console.error(error);
      messageApi.error("导出用户权限失败，请重试");
    } finally {
      setExportingUsers(false);
    }
  };

  // 导出单个用户的有效授权 PDF：账号信息 + 有效权限 + 可访问页面 + 可调用接口（从操作列触发）。
  const handleExportSingleUserPdf = async (principal: AuthzPrincipal) => {
    const rowKey = `${principal.principal_type}:${principal.principal_id}`;
    setExportingUserId(rowKey);
    try {
      const [snapshot, endpoints] = await Promise.all([
        fetchPrincipalAuthorization(principal.principal_type, principal.principal_id),
        loadAllEndpoints(),
      ]);
      const sections: MatrixPdfSection[] = [
        {
          title: "一、账号信息",
          head: ["项目", "内容"],
          body: [
            ["账号", principal.principal_id],
            ["名称", principal.name || principal.nickname || "—"],
            ["邮箱", principal.email || "—"],
            ["状态", principal.status === 1 ? "启用" : "禁用"],
            ["角色 / 组织", assignmentSummary(principal)],
          ],
          columnStyles: { 0: { cellWidth: 90 } },
          accentFirstColumn: true,
          bodyFontSize: 9,
          statusColumns: [1],
        },
        {
          title: "二、有效权限",
          head: ["权限名称", "Permission Key", "模块", "风险"],
          body: permissionRows(snapshot),
          columnStyles: {
            0: { cellWidth: 130 },
            1: { cellWidth: 220 },
            2: { cellWidth: 90 },
            3: { cellWidth: 60 },
          },
          centerColumns: [3],
          riskColumn: 3,
        },
        {
          title: "三、可访问页面",
          head: ["页面", "路径", "类型"],
          body: routeRows(snapshot),
          columnStyles: { 0: { cellWidth: 150 }, 2: { cellWidth: 60 } },
          centerColumns: [2],
        },
        {
          title: "四、可调用接口",
          head: ["方法", "路径模式", "所需权限", "访问方式"],
          body: endpointRows(snapshot, endpoints),
          columnStyles: { 0: { cellWidth: 60 }, 3: { cellWidth: 70 } },
          centerColumns: [0, 3],
        },
      ];
      const stamp = new Date().toISOString().slice(0, 10);
      await exportMatrixPdf(
        sections,
        { title: "用户权限文档", generatedAt: new Date().toLocaleString("zh-CN", { hour12: false }) },
        `用户权限-${principal.principal_id}-${stamp}.pdf`,
      );
      messageApi.success(`已导出「${principal.name || principal.principal_id}」的权限 PDF`);
    } catch (error) {
      console.error(error);
      messageApi.error("导出用户权限失败，请重试");
    } finally {
      setExportingUserId(null);
    }
  };

  const fetchPreviewCatalog = async () => {
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
    const byRoute = new Map<number, FrontendRequirement[]>();
    requirements.forEach((item) =>
      byRoute.set(item.frontend_route_id, [...(byRoute.get(item.frontend_route_id) || []), item]),
    );
    return routes.map((route) => ({ ...route, requirements: byRoute.get(route.id) || [] }));
  };

  const showPreview = async (principal: AuthzPrincipal) => {
    const requestId = ++previewRequestId.current;
    try {
      setSelectedPrincipal(principal);
      setPreviewOpen(true);
      setPreview(null);
      setPreviewError("");
      setPreviewCatalog([]);
      setPreviewNavigation("");
      setPreviewModule("");
      setPreviewPageKeyword("");
      setPreviewPermissionKeyword("");
      setEndpointDetails({});
      setExpandedPermissions([]);
      const [snapshot, catalog] = await Promise.all([
        fetchPrincipalAuthorization(principal.principal_type, principal.principal_id),
        fetchPreviewCatalog().catch(() => null),
      ]);
      if (requestId !== previewRequestId.current) return;
      if (!catalog) messageApi.warning("页面目录加载失败，部分页面层级和权限模块顺序可能不完整");
      setPreviewCatalog(catalog || []);
      setPreviewCollapsedPaths(parentRoutePaths([...(catalog || []), ...(snapshot.frontend_routes || [])]));
      setPreview(snapshot);
      const knownKeys = new Set([
        ...permissions.map((item) => item.permission_key),
        ...Object.keys(extraPermissionNames),
        "system:all",
      ]);
      const keys = new Set([
        ...(snapshot.permissions || []),
        ...Object.values(snapshot.domains || {}).flatMap((keys) => (Array.isArray(keys) ? keys : [])),
      ]);
      const missing = [...keys].filter((key) => !knownKeys.has(key));
      if (missing.length > 0) {
        const results = await Promise.allSettled(missing.map((key) => fetchPermission(key)));
        setExtraPermissionNames((current) => {
          const next = { ...current };
          results.forEach((result) => {
            if (result.status === "fulfilled" && result.value.name) {
              next[result.value.permission_key] = result.value.name;
            }
          });
          return next;
        });
      }
    } catch (error: any) {
      if (requestId === previewRequestId.current) setPreviewError(error.message || "加载授权预览失败");
    }
  };

  const permissionName = (key: string) =>
    permissions.find((item) => item.permission_key === key)?.name ||
    extraPermissionNames[key] ||
    (key === "system:all" ? "全部系统权限" : key);

  const previewRoutes = useMemo(() => {
    const routes = new Map<string, FrontendRoute>();
    previewCatalog.forEach((route) => routes.set(route.path, route));
    (preview?.frontend_routes || []).forEach((route) => routes.set(route.path, route));
    return Array.from(routes.values());
  }, [preview, previewCatalog]);
  const grantedPaths = useMemo(
    () =>
      new Set(
        (preview?.frontend_routes || [])
          .filter((route) => route.route_type !== "navigation")
          .map((route) => route.path),
      ),
    [preview],
  );
  const previewPageGroups = useMemo(() => {
    const byPath = new Map(previewRoutes.map((route) => [route.path, route]));
    const query = previewPageKeyword.trim().toLowerCase();
    const visible = new Set<string>();
    previewRoutes
      .filter(
        (route) =>
          grantedPaths.has(route.path) && `${route.name} ${route.path}`.toLowerCase().includes(query),
      )
      .forEach((route) => {
        visible.add(route.path);
        const seen = new Set([route.path]);
        let parentPath = route.parent_path;
        while (parentPath && !seen.has(parentPath)) {
          seen.add(parentPath);
          const parent = byPath.get(parentPath);
          if (!parent || parent.route_type === "navigation") break;
          visible.add(parent.path);
          parentPath = parent.parent_path;
        }
      });
    return groupRoutes(
      previewRoutes.filter((route) => route.route_type !== "navigation" && visible.has(route.path)),
    );
  }, [previewRoutes, previewPageKeyword, grantedPaths]);
  const currentPreviewNavigation =
    previewPageGroups.find(([name]) => name === previewNavigation) ||
    previewPageGroups.find(([, routes]) => routes.some((route) => route.route_type === "detail")) ||
    previewPageGroups[0];
  const currentPreviewRoutes = currentPreviewNavigation?.[1] || [];
  const previewResourceNavigation = useMemo(
    () => getResourceNavigation(permissions, previewCatalog),
    [permissions, previewCatalog],
  );
  const previewPermissionItems = useMemo(() => {
    const keys = new Set([
      ...(preview?.permissions || []),
      ...Object.values(preview?.domains || {}).flatMap((domainKeys) =>
        Array.isArray(domainKeys) ? domainKeys : [],
      ),
    ]);
    return [...keys].map((key) => {
      const permission = permissions.find((item) => item.permission_key === key);
      return {
        key,
        resource: permission?.resource || (key === "system:all" ? "*" : key.split(":")[0]),
        name: permission?.name || extraPermissionNames[key] || (key === "system:all" ? "全部系统权限" : key),
        risk: permission?.risk_level,
      };
    });
  }, [preview, permissions, extraPermissionNames]);
  const previewModules = useMemo(() => {
    const groups = new Map<string, typeof previewPermissionItems>();
    const query = previewPermissionKeyword.trim().toLowerCase();
    previewPermissionItems
      .filter((item) =>
        `${item.name} ${item.key} ${resourceName(item.resource, previewPermissionItems)}`
          .toLowerCase()
          .includes(query),
      )
      .forEach((item) => {
        groups.set(item.resource, [...(groups.get(item.resource) || []), item]);
      });
    const orderOf = (resource: string) => moduleOrderIndex(resourceName(resource, previewPermissionItems));
    return [...groups.entries()].sort(([a], [b]) => {
      const [aOrder, bOrder] = [orderOf(a), orderOf(b)];
      if (aOrder !== bOrder) return aOrder - bOrder;
      return compareResources(a, b, previewResourceNavigation);
    });
  }, [previewPermissionItems, previewPermissionKeyword, previewResourceNavigation]);
  const currentPreviewModule = previewModules.find(([name]) => name === previewModule) || previewModules[0];
  const previewModuleGroups = useMemo(
    () =>
      previewModules.reduce<Array<[string, Array<[string, typeof previewPermissionItems]>]>>((acc, entry) => {
        const title = moduleSectionOf(resourceName(entry[0], previewPermissionItems));
        const group = acc.find(([name]) => name === title);
        if (group) group[1].push(entry);
        else acc.push([title, [entry]]);
        return acc;
      }, []),
    [previewModules, previewPermissionItems],
  );

  const previewRouteHidden = (route: FrontendRoute) => {
    if (previewPageKeyword.trim()) return false;
    const byPath = new Map(previewRoutes.map((item) => [item.path, item]));
    const seen = new Set([route.path]);
    let parentPath = route.parent_path;
    while (parentPath && !seen.has(parentPath)) {
      if (previewCollapsedPaths.includes(parentPath)) return true;
      seen.add(parentPath);
      parentPath = byPath.get(parentPath)?.parent_path || "";
    }
    return false;
  };

  const loadPermissionEndpoints = async (key: string) => {
    setEndpointDetails((current) => ({ ...current, [key]: { loading: true, items: [] } }));
    try {
      const items: AuthzEndpoint[] = [];
      let page = 1;
      let received = 0;
      let total = 0;
      do {
        const result = await fetchEndpoints({ keyword: key, status: 1, page, page_size: 200 });
        const batch = result.list || [];
        items.push(...batch.filter((endpoint) => endpoint.permission_key === key));
        received += batch.length;
        total = result.total;
        if (batch.length === 0) break;
        page += 1;
      } while (received < total);
      setEndpointDetails((current) => ({ ...current, [key]: { loading: false, items } }));
    } catch (error: any) {
      setEndpointDetails((current) => ({
        ...current,
        [key]: { loading: false, items: [], error: error.message || "加载接口映射失败" },
      }));
    }
  };

  const saveUser = async () => {
    try {
      const values = await userForm.validateFields();
      setSaving(true);
      await createUser(values);
      messageApi.success("账号创建成功，可继续为其分配角色和组织");
      setUserOpen(false);
      userForm.resetFields();
      await load();
    } catch (error: any) {
      if (error?.errorFields) return;
      messageApi.error(error.message || "创建账号失败");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!selectedPrincipal) return;
    try {
      const values = await passwordForm.validateFields();
      setSaving(true);
      await updateUserPassword(selectedPrincipal.principal_id, values.password);
      messageApi.success("密码修改成功");
      setPasswordOpen(false);
    } catch (error: any) {
      if (error?.errorFields) return;
      messageApi.error(error.message || "修改密码失败");
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<AuthzPrincipal> = [
    {
      title: "用户",
      key: "principal",
      width: 260,
      render: (_, row) => (
        <Space>
          <UserOutlined />
          <Typography.Text strong>{row.name || "—"}</Typography.Text>
        </Space>
      ),
    },
    { title: "邮箱", dataIndex: "email", width: 220, ellipsis: true, render: (v) => v || "—" },
    { title: "状态", dataIndex: "status", width: 80, render: (v) => <StatusTag value={v} /> },
    {
      title: "角色 / 组织",
      key: "assignments",
      render: (_, row) => {
        const groups = Object.entries(
          (row.assignments || []).reduce<Record<string, AuthzAssignment[]>>((result, item) => {
            (result[item.domain] ||= []).push(item);
            return result;
          }, {}),
        ).sort(([left], [right]) => {
          const order = (code: string) => {
            const index = domains.findIndex((item) => item.code === code);
            return index < 0 ? domains.length : index;
          };
          return order(left) - order(right);
        });
        const key = `${row.principal_type}:${row.principal_id}`;
        return (
          <div className="authz-assignment-summary">
            {groups.length === 0 && <span className="authz-muted">暂无授权</span>}
            {(expanded[key] ? groups : groups.slice(0, 2)).map(([code, assignments]) => {
              const roleName = (item: AuthzAssignment) =>
                roles.find((role) => role.id === item.role_template_id)?.name || item.role_template_id;
              const activeNames = assignments.filter((item) => item.enabled === 1).map(roleName);
              const inactiveNames = assignments.filter((item) => item.enabled !== 1).map(roleName);
              const organization =
                code === "*" ? "全部组织" : domains.find((item) => item.code === code)?.name || code;
              return (
                <div className="authz-assignment-row" key={code}>
                  <span className="authz-assignment-domain" title={`${organization}（${code}）`}>
                    {organization}
                  </span>
                  <div className="authz-assignment-roles">
                    <span title={activeNames.join("、")}>
                      {activeNames.length > 0 ? activeNames.join("、") : "无生效角色"}
                    </span>
                    {inactiveNames.length > 0 && (
                      <span className="authz-assignment-inactive" title={inactiveNames.join("、")}>
                        已停用：{inactiveNames.join("、")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {groups.length > 2 && (
              <Button
                type="link"
                size="small"
                className="authz-assignment-expand"
                onClick={() => setExpanded((current) => ({ ...current, [key]: !current[key] }))}
              >
                {expanded[key] ? "收起" : `展开其余 ${groups.length - 2} 个组织`}
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: "操作",
      key: "actions",
      width: 320,
      render: (_, row) => (
        <Space size={0} className="authz-principal-actions">
          <Button type="link" icon={<EyeOutlined />} onClick={() => void showPreview(row)}>
            预览
          </Button>
          {canManage && (
            <Button type="link" onClick={() => setManagePrincipal(row)}>
              管理授权
            </Button>
          )}
          {canManage && row.principal_type === "user" && (
            <Button
              type="link"
              icon={<KeyOutlined />}
              onClick={() => {
                setSelectedPrincipal(row);
                passwordForm.resetFields();
                setPasswordOpen(true);
              }}
            >
              密码
            </Button>
          )}
          <Button
            type="link"
            icon={<FilePdfOutlined />}
            loading={exportingUserId === `${row.principal_type}:${row.principal_id}`}
            onClick={() => void handleExportSingleUserPdf(row)}
          >
            导出
          </Button>
          {canManage && row.principal_type === "user" && (
            <Popconfirm
              title="确认删除该账号？"
              description="账号删除后不可登录，已有授权应先撤销。"
              okButtonProps={{ danger: true }}
              onConfirm={async () => {
                try {
                  await deleteUser(row.principal_id);
                  messageApi.success("账号已删除");
                  await load();
                } catch (error: any) {
                  messageApi.error(error.message || "删除账号失败");
                }
              }}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
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
        onSearch={() => setQueryKeyword(keyword.trim())}
        showSearchButton={false}
        onRefresh={() => void load()}
        placeholder="用户名或邮箱"
        extra={
          <Space>
            <Button
              icon={<FilePdfOutlined />}
              loading={exportingUsers}
              onClick={() => void handleExportUserPdf()}
            >
              导出用户权限 PDF
            </Button>
            {canManage && (
              <>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => {
                    userForm.resetFields();
                    setUserOpen(true);
                  }}
                >
                  新建账号
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openGrant()}>
                  新增授权
                </Button>
              </>
            )}
          </Space>
        }
      >
        <Select
          allowClear
          mode="multiple"
          className="authz-domain-filter"
          value={domainFilter}
          placeholder="全部组织"
          maxTagCount="responsive"
          menuItemSelectedIcon={null}
          onChange={(values) => {
            const next = values as string[];
            // 「全部组织」(*) 与具体组织互斥：选具体组织时移除通配，选通配时只留通配
            setDomainFilter((current) => {
              if (!next.includes("*") || next.length <= 1) return next;
              return current.includes("*") ? next.filter((item) => item !== "*") : ["*"];
            });
          }}
          style={{ width: 220 }}
          optionRender={(option) => (
            <Space size={8} className="authz-domain-filter-option">
              <Checkbox
                checked={domainFilter.includes(String(option.value))}
                style={{ pointerEvents: "none" }}
              />
              <span>{domainName(String(option.value))}</span>
            </Space>
          )}
          options={domains.map((item) => ({ label: domainName(item.code), value: item.code }))}
        />
        <Select
          allowClear
          mode="multiple"
          className="authz-domain-filter"
          value={roleFilter}
          placeholder="全部角色"
          maxTagCount="responsive"
          menuItemSelectedIcon={null}
          onChange={(values) => setRoleFilter(values as string[])}
          style={{ width: 200 }}
          optionRender={(option) => (
            <Space size={8} className="authz-domain-filter-option">
              <Checkbox
                checked={roleFilter.includes(String(option.value))}
                style={{ pointerEvents: "none" }}
              />
              <span>{roleName(String(option.value))}</span>
            </Space>
          )}
          options={roles.map((role) => ({ label: role.name, value: role.id }))}
        />
      </FilterBar>
      <Table
        className="authz-table authz-principals-table"
        rowKey={(row) => `${row.principal_type}:${row.principal_id}`}
        columns={columns}
        // 角色筛选在本地做：接口的 keyword 只匹配用户名/邮箱，角色信息在返回的 assignments 里
        dataSource={
          roleFilter.length === 0
            ? rows
            : rows.filter((row) =>
                (row.assignments || []).some((item) => roleFilter.includes(item.role_template_id)),
              )
        }
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 个用户`,
        }}
        tableLayout="fixed"
      />

      <Drawer
        title={`管理授权 · ${managePrincipal?.name || "用户"}`}
        open={Boolean(managePrincipal)}
        onClose={() => setManagePrincipal(null)}
        width={720}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => managePrincipal && openGrant(managePrincipal)}
          >
            新增授权
          </Button>
        }
      >
        <Table<AuthzAssignment>
          rowKey="id"
          dataSource={managePrincipal?.assignments || []}
          pagination={false}
          size="small"
          columns={[
            {
              title: "组织",
              dataIndex: "domain",
              render: (value) => (
                <Tag color={value === "*" ? "gold" : "blue"}>{value === "*" ? "全部组织" : value}</Tag>
              ),
            },
            {
              title: "角色",
              dataIndex: "role_template_id",
              render: (value) => (
                <Tooltip title={value}>{roles.find((role) => role.id === value)?.name || value}</Tooltip>
              ),
            },
            {
              title: "状态",
              dataIndex: "enabled",
              render: (_, item) => (
                <Switch
                  checked={item.enabled === 1}
                  onChange={(checked) => void toggleAssignment(item, checked)}
                />
              ),
            },
            {
              title: "操作",
              render: (_, item) => (
                <Space>
                  <Button type="link" onClick={() => managePrincipal && openGrant(managePrincipal, item)}>
                    编辑
                  </Button>
                  <Popconfirm
                    title="撤销该角色组织分配？"
                    okText="撤销"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => revoke(item)}
                  >
                    <Button type="link" danger>
                      撤销
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Drawer>

      <Modal
        title={editingAssignment ? "编辑角色组织授权" : "新增角色组织授权"}
        open={grantOpen}
        onCancel={() => setGrantOpen(false)}
        onOk={() => void saveGrant()}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={grantForm} layout="vertical" preserve={false}>
          <Form.Item
            name="principal_id"
            label="用户 ID"
            rules={[{ required: true, message: "请输入用户 ID" }]}
          >
            <Input disabled={Boolean(selectedPrincipal)} placeholder="用户 UUID" />
          </Form.Item>
          <Form.Item name="role_template_id" label="角色模板" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={roles.map((role) => ({ label: `${role.name}（${role.id}）`, value: role.id }))}
              onChange={(value) => {
                const currentDomains: string[] = grantForm.getFieldValue("domain") || [];
                if (value === "system-super-admin") grantForm.setFieldValue("domain", ["*"]);
                else if (!wildcardRoles.has(value))
                  grantForm.setFieldValue(
                    "domain",
                    currentDomains.filter((item) => item !== "*"),
                  );
              }}
            />
          </Form.Item>
          <Form.Item
            name="domain"
            label="组织"
            rules={[{ required: true, type: "array", min: 1, message: "请至少选择一个组织" }]}
            extra={
              editingAssignment
                ? "当前分配更新为所选组织之一，其他组织将新增分配。"
                : "每个组织会分别创建一条授权。"
            }
          >
            <Select
              mode="multiple"
              showSearch
              optionFilterProp="label"
              placeholder="请选择组织，可多选"
              menuItemSelectedIcon={null}
              optionRender={(option) => (
                <Space size={8}>
                  <Checkbox
                    checked={selectedDomains.includes(String(option.value))}
                    style={{ pointerEvents: "none" }}
                  />
                  <span>{option.label}</span>
                </Space>
              )}
              options={availableDomains.map((item) => ({ label: item.name, value: item.code }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建人员账号"
        open={userOpen}
        onCancel={() => setUserOpen(false)}
        onOk={() => void saveUser()}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={userForm} layout="vertical" preserve={false}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="初始密码" rules={[{ required: true }, { min: 6 }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`修改密码 · ${selectedPrincipal?.name || ""}`}
        open={passwordOpen}
        onCancel={() => setPasswordOpen(false)}
        onOk={() => void savePassword()}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={passwordForm} layout="vertical" preserve={false}>
          <Form.Item name="password" label="新密码" rules={[{ required: true }, { min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认新密码"
            dependencies={["password"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value || getFieldValue("password") === value
                    ? Promise.resolve()
                    : Promise.reject(new Error("两次密码输入不一致"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`授权预览 · ${selectedPrincipal?.name || "用户"}`}
        open={previewOpen}
        onClose={() => {
          previewRequestId.current += 1;
          setPreviewOpen(false);
        }}
        width={960}
        destroyOnClose
      >
        {previewError ? (
          <Space>
            <Typography.Text type="danger">{previewError}</Typography.Text>
            <Button onClick={() => selectedPrincipal && void showPreview(selectedPrincipal)}>重试</Button>
          </Space>
        ) : !preview ? (
          <Typography.Text type="secondary">加载中...</Typography.Text>
        ) : (
          <>
            <div className="authz-preview-summary">
              {(selectedPrincipal?.assignments || []).length === 0 ? (
                <Typography.Text type="secondary">暂无角色授权</Typography.Text>
              ) : (
                selectedPrincipal?.assignments.map((assignment) => (
                  <Tag key={assignment.id} color={assignment.domain === "*" ? "blue" : undefined}>
                    {roleName(assignment.role_template_id)}@{domainName(assignment.domain)}
                    {assignment.enabled !== 1 && " · 已停用"}
                  </Tag>
                ))
              )}
            </div>
            <Tabs
              defaultActiveKey="pages"
              items={[
                {
                  key: "pages",
                  label: `可访问页面（${grantedPaths.size}）`,
                  children: (
                    <>
                      <Input
                        allowClear
                        value={previewPageKeyword}
                        onChange={(event) => setPreviewPageKeyword(event.target.value)}
                        placeholder="搜索可访问页面名称或路径"
                        style={{ marginBottom: 16 }}
                      />
                      <div className="authz-page-browser">
                        <nav className="authz-page-browser-nav" aria-label="页面所属导航">
                          {previewPageGroups.map(([name, routes]) => (
                            <button
                              key={name}
                              type="button"
                              className={`authz-page-browser-nav-item${currentPreviewNavigation?.[0] === name ? " is-active" : ""}`}
                              aria-pressed={currentPreviewNavigation?.[0] === name}
                              onClick={() => setPreviewNavigation(name)}
                            >
                              <span>
                                <NavigationIcon name={name} /> {name}
                              </span>
                              <span>{routes.filter((route) => grantedPaths.has(route.path)).length}</span>
                            </button>
                          ))}
                        </nav>
                        <div className="authz-page-tree-group authz-preview-pages">
                          <div className="authz-page-tree-heading">
                            <span>{currentPreviewNavigation?.[0] || "可访问页面"}</span>
                            <span className="authz-page-tree-count">
                              {currentPreviewRoutes.filter((route) => grantedPaths.has(route.path)).length}{" "}
                              个页面
                            </span>
                          </div>
                          {currentPreviewRoutes
                            .filter((route) => !previewRouteHidden(route))
                            .map((route) => {
                              const granted = grantedPaths.has(route.path);
                              const hasChildren = currentPreviewRoutes.some(
                                (item) => item.parent_path === route.path,
                              );
                              const grantedDetails = currentPreviewRoutes.filter((item) => {
                                if (!grantedPaths.has(item.path) || item.path === route.path) return false;
                                const seen = new Set([item.path]);
                                let parentPath = item.parent_path;
                                while (parentPath && !seen.has(parentPath)) {
                                  if (parentPath === route.path) return true;
                                  seen.add(parentPath);
                                  parentPath =
                                    previewRoutes.find((parent) => parent.path === parentPath)?.parent_path ||
                                    "";
                                }
                                return false;
                              }).length;
                              const collapsed = previewCollapsedPaths.includes(route.path);
                              const searching = Boolean(previewPageKeyword.trim());
                              return (
                                <div
                                  key={route.path}
                                  className={`authz-role-route${granted ? "" : " is-context"}`}
                                  style={{ marginLeft: routeDepth(route, previewRoutes) * 18 }}
                                >
                                  <div className="authz-role-route-main">
                                    {hasChildren ? (
                                      <Button
                                        type="text"
                                        size="small"
                                        className="authz-page-tree-toggle"
                                        disabled={searching}
                                        aria-label={`${collapsed && !searching ? "展开" : "收起"}${route.name}的详情页`}
                                        aria-expanded={!collapsed || searching}
                                        icon={collapsed && !searching ? <RightOutlined /> : <DownOutlined />}
                                        onClick={() =>
                                          setPreviewCollapsedPaths((current) =>
                                            collapsed
                                              ? current.filter((path) => path !== route.path)
                                              : [...current, route.path],
                                          )
                                        }
                                      />
                                    ) : (
                                      <span className="authz-page-tree-toggle-spacer" />
                                    )}
                                    {granted ? (
                                      <CheckCircleFilled className="authz-page-granted-icon" />
                                    ) : (
                                      <MinusCircleOutlined className="authz-page-context-icon" />
                                    )}
                                    <Tooltip
                                      title={
                                        <div>
                                          <div>{route.path}</div>
                                          <div>进入路径：{routeClickPath(route, previewRoutes)}</div>
                                        </div>
                                      }
                                    >
                                      <Typography.Text
                                        strong={route.route_type !== "detail"}
                                        type={granted ? undefined : "secondary"}
                                      >
                                        {route.name}
                                      </Typography.Text>
                                    </Tooltip>
                                    {!granted && <Tag>上级页面 · 未授权</Tag>}
                                    {hasChildren && collapsed && !searching && grantedDetails > 0 && (
                                      <span className="authz-page-tree-context">
                                        包含 {grantedDetails} 个可访问详情页
                                      </span>
                                    )}
                                  </div>
                                  {granted && route.route_type === "detail" && (
                                    <div className="authz-muted authz-role-route-detail">
                                      进入路径：{routeClickPath(route, previewRoutes)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          {currentPreviewRoutes.length === 0 && (
                            <div className="authz-access-empty">
                              <Typography.Text type="secondary">
                                {previewPageKeyword ? "没有匹配的页面" : "暂无可访问页面"}
                              </Typography.Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ),
                },
                {
                  key: "permissions",
                  label: `实际权限（${previewPermissionItems.length}）`,
                  children: (
                    <>
                      <Input
                        allowClear
                        value={previewPermissionKeyword}
                        onChange={(event) => setPreviewPermissionKeyword(event.target.value)}
                        placeholder="搜索权限或功能模块"
                        style={{ marginBottom: 16 }}
                      />
                      <div className="authz-page-browser">
                        <nav
                          className="authz-page-browser-nav authz-permission-modules"
                          aria-label="功能模块"
                        >
                          {previewModuleGroups.map(([title, groupModules]) => (
                            <div key={title} className="authz-module-section">
                              {previewModuleGroups.length > 1 && (
                                <div className="authz-module-section-title">{title}</div>
                              )}
                              {groupModules.map(([resource, items]) => {
                                const label = resourceName(resource, previewPermissionItems);
                                return (
                                  <button
                                    key={resource}
                                    type="button"
                                    className={`authz-page-browser-nav-item${currentPreviewModule?.[0] === resource ? " is-active" : ""}`}
                                    aria-pressed={currentPreviewModule?.[0] === resource}
                                    title={resource}
                                    onClick={() => setPreviewModule(resource)}
                                  >
                                    <span className="authz-module-label">
                                      <ModuleIcon resource={resource} name={label} />
                                      <span>{label}</span>
                                    </span>
                                    <span>{items.length}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </nav>
                        <div
                          className="authz-page-tree-group authz-fade-in"
                          key={currentPreviewModule?.[0] || ""}
                        >
                          <div className="authz-page-tree-heading">
                            <span className="authz-module-title">
                              {currentPreviewModule && (
                                <ModuleIcon
                                  resource={currentPreviewModule[0]}
                                  name={resourceName(currentPreviewModule[0], previewPermissionItems)}
                                />
                              )}
                              {currentPreviewModule
                                ? resourceName(currentPreviewModule[0], previewPermissionItems)
                                : "实际权限"}
                            </span>
                            <span className="authz-page-tree-count">
                              {currentPreviewModule?.[1].length || 0} 项权限
                            </span>
                          </div>
                          <Table
                            size="small"
                            rowKey="key"
                            pagination={false}
                            locale={{ emptyText: "暂无权限" }}
                            dataSource={currentPreviewModule?.[1] || []}
                            columns={[
                              {
                                title: "权限",
                                dataIndex: "key",
                                render: (key: string) => (
                                  <div className="authz-permission-cell">
                                    <span>{permissionName(key)}</span>
                                    <span className="authz-permission-key">{key}</span>
                                  </div>
                                ),
                              },
                              {
                                title: "风险",
                                dataIndex: "risk",
                                width: 80,
                                render: (risk) => (risk ? <RiskTag value={risk} /> : "—"),
                              },
                              {
                                title: "适用组织",
                                dataIndex: "key",
                                render: (key: string) => {
                                  const entries = Object.entries(preview.domains || {}).filter(
                                    ([, keys]) => Array.isArray(keys) && keys.includes(key),
                                  );
                                  if (!entries.length) return "—";
                                  return (
                                    <Space size={[4, 4]} wrap>
                                      {entries.map(([code]) => (
                                        <Tag key={code} color={code === "*" ? "blue" : undefined}>
                                          {domains.find((item) => item.code === code)?.name || code}
                                        </Tag>
                                      ))}
                                    </Space>
                                  );
                                },
                              },
                              {
                                title: "接口",
                                dataIndex: "key",
                                width: 120,
                                render: (key: string) => (
                                  <Button
                                    type="link"
                                    size="small"
                                    onClick={() => {
                                      const isExpanded = expandedPermissions.includes(key);
                                      setExpandedPermissions((current) =>
                                        isExpanded
                                          ? current.filter((item) => item !== key)
                                          : [...current, key],
                                      );
                                      if (!isExpanded && !endpointDetails[key] && key !== "system:all") {
                                        void loadPermissionEndpoints(key);
                                      }
                                    }}
                                  >
                                    {expandedPermissions.includes(key)
                                      ? "收起"
                                      : endpointDetails[key]?.items.length
                                        ? `${endpointDetails[key].items.length} 个接口`
                                        : "查看接口"}
                                  </Button>
                                ),
                              },
                            ]}
                            expandable={{
                              expandedRowKeys: expandedPermissions,
                              showExpandColumn: false,
                              expandedRowRender: ({ key }) => {
                                if (key === "system:all") {
                                  return (
                                    <Typography.Text type="secondary">
                                      拥有全部系统权限，可访问的接口不会在此逐一列出。
                                    </Typography.Text>
                                  );
                                }
                                const detail = endpointDetails[key];
                                if (!detail || detail.loading)
                                  return (
                                    <Typography.Text type="secondary">加载接口映射中...</Typography.Text>
                                  );
                                if (detail.error) {
                                  return (
                                    <Space>
                                      <Typography.Text type="danger">{detail.error}</Typography.Text>
                                      <Button
                                        type="link"
                                        size="small"
                                        onClick={() => void loadPermissionEndpoints(key)}
                                      >
                                        重试
                                      </Button>
                                    </Space>
                                  );
                                }
                                if (detail.items.length === 0)
                                  return (
                                    <Typography.Text type="secondary">暂无关联的启用接口</Typography.Text>
                                  );
                                return (
                                  <Space direction="vertical" size={4}>
                                    {detail.items.map((endpoint) => (
                                      <div key={endpoint.id}>
                                        <Tag>{endpoint.method}</Tag>
                                        <Typography.Text code>{endpoint.path_pattern}</Typography.Text>
                                      </div>
                                    ))}
                                  </Space>
                                );
                              },
                            }}
                          />
                        </div>
                      </div>
                    </>
                  ),
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </>
  );
}
