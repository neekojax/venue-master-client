import { useCallback, useEffect, useMemo, useState } from "react";
import { CopyOutlined, DownloadOutlined, FilePdfOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, message, Space, Spin, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  type AuthzDomain,
  type AuthzPermission,
  type AuthzRoleTemplate,
  type BinaryStatus,
  fetchFrontendRoutes,
  fetchPermissions,
  fetchRoleAccess,
  fetchRoleTemplates,
  type FrontendRequirement,
  type FrontendRoute,
  type RoleAccessData,
} from "./api";
import { RiskTag, StatusTag } from "./common";
import { useAuthzPage } from "./context";
import { ModuleIcon } from "./navigation-icons";
import { exportMatrixPdf, type MatrixPdfSection } from "./pdf-export";
import { resourceName } from "./permission-catalog";
import { routeClickPath, sortRoutes } from "./route-catalog";

type RouteWithRequirements = FrontendRoute & { requirements: FrontendRequirement[] };

const routeTypeLabels: Record<string, string> = { navigation: "导航", page: "页面", detail: "详情" };

// 权限系统概念说明：页面展示与两种导出（Markdown / PDF）共用同一份内容，改一处全部同步。
const systemConcepts: Array<[string, string]> = [
  [
    "总体模型",
    "系统采用「主体 → 组织 → 角色 → 权限」模型：账号在组织内被授予角色，角色聚合一组权限；前端页面与后端接口各自声明所需权限，访问时统一判定。",
  ],
  [
    "主体（账号）",
    "权限的持有者，分为用户与服务账号两类。账号本身不直接拥有权限，权限全部来自被授予的角色。",
  ],
  [
    "组织（数据域）",
    "授权生效的范围，对应一个组织（场地）的数据边界。角色必须绑定组织后才生效；「全部组织」(*) 不限定组织，可访问任意组织的数据。",
  ],
  [
    "角色",
    "权限与页面授权的集合（角色模板），分内置与自建两类，可启用/停用。变更后需发布策略版本才在线上生效。",
  ],
  ["权限", "最小功能单元，格式为「模块:操作」（如 venue:view），带风险等级（低/中/高/严重）与启用状态。"],
  [
    "页面",
    "前端路由，分导航/页面/详情三类。页面声明进入条件（需任一权限、需全部权限或仅需登录），账号权限命中即可进入。",
  ],
  [
    "接口（端点）",
    "后端接口的权限映射：请求方法 + 路径模式 → 所需权限。公开与 HMAC 签名接口单独标识，其余需登录且具备对应权限。",
  ],
  [
    "判定流程",
    "收到请求 → 校验登录 → 取主体在各组织的角色 → 汇总权限集合 → 比对页面/接口要求 → 数据按组织边界过滤。",
  ],
];

const domainTypeOf = (wildcard: boolean) => (wildcard ? "通配 · 不限定组织" : "具体组织");
const domainNoteOf = (wildcard: boolean) =>
  wildcard ? "供全局/管理角色使用，可访问任意组织的数据" : "授权仅在该组织（场地）的数据范围内生效";

const domainColumns: ColumnsType<AuthzDomain> = [
  {
    title: "组织标识",
    dataIndex: "code",
    width: 130,
    render: (value: string) => <span className="authz-domain-code">{value}</span>,
  },
  {
    title: "名称",
    dataIndex: "name",
    render: (value: string, item) => (item.wildcard ? "全部组织" : value || item.code),
  },
  { title: "类型", dataIndex: "wildcard", width: 170, render: (value: boolean) => domainTypeOf(value) },
  { title: "说明", render: (_, item) => domainNoteOf(item.wildcard) },
];

const loadRoutes = async (): Promise<{ list: FrontendRoute[]; requirements: FrontendRequirement[] }> => {
  const list: FrontendRoute[] = [];
  const requirements: FrontendRequirement[] = [];
  let page = 1;
  let total = 0;
  do {
    const data = await fetchFrontendRoutes({ page, page_size: 200 });
    list.push(...(data.list || []));
    requirements.push(...(data.requirements || []));
    total = data.total || 0;
    if (!data.list?.length) break;
    page += 1;
  } while (list.length < total);
  return { list, requirements };
};

const loadPermissions = async (): Promise<AuthzPermission[]> => {
  const list: AuthzPermission[] = [];
  let page = 1;
  let total = 0;
  do {
    const data = await fetchPermissions({ page, page_size: 200 });
    list.push(...(data.list || []));
    total = data.total || 0;
    if (!data.list?.length) break;
    page += 1;
  } while (list.length < total);
  return list;
};

const loadRoles = async (): Promise<{
  list: AuthzRoleTemplate[];
  permissions: Record<string, string[]>;
}> => {
  const list: AuthzRoleTemplate[] = [];
  const permissions: Record<string, string[]> = {};
  let page = 1;
  let total = 0;
  do {
    const data = await fetchRoleTemplates({ page, page_size: 200 });
    list.push(...(data.list || []));
    Object.assign(permissions, data.permissions || {});
    total = data.total || 0;
    if (!data.list?.length) break;
    page += 1;
  } while (list.length < total);
  return { list, permissions };
};

export default function OverviewTab() {
  const [messageApi, contextHolder] = message.useMessage();
  const { domains } = useAuthzPage();
  const [loading, setLoading] = useState(true);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [routes, setRoutes] = useState<RouteWithRequirements[]>([]);
  const [permissions, setPermissions] = useState<AuthzPermission[]>([]);
  const [roles, setRoles] = useState<AuthzRoleTemplate[]>([]);
  const [fallbackPermissions, setFallbackPermissions] = useState<Record<string, string[]>>({});
  const [accessMap, setAccessMap] = useState<Record<string, RoleAccessData | null>>({});
  const [updatedAt, setUpdatedAt] = useState("");

  const loadAccess = useCallback(async (roleList: AuthzRoleTemplate[]) => {
    if (!roleList.length) return;
    setAccessLoading(true);
    setAccessError("");
    try {
      const entries = await Promise.all(
        roleList.map(async (role) => {
          try {
            return [role.id, await fetchRoleAccess(role.id)] as const;
          } catch {
            return [role.id, null] as const;
          }
        }),
      );
      setAccessMap(Object.fromEntries(entries));
      if (entries.some(([, access]) => access === null)) {
        setAccessError("部分角色的访问数据加载失败，角色矩阵可能不完整。");
      }
    } finally {
      setAccessLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [routeData, permissionData, roleData] = await Promise.all([
        loadRoutes(),
        loadPermissions(),
        loadRoles(),
      ]);
      const byRoute = new Map<number, FrontendRequirement[]>();
      routeData.requirements.forEach((item) =>
        byRoute.set(item.frontend_route_id, [...(byRoute.get(item.frontend_route_id) || []), item]),
      );
      setRoutes(
        sortRoutes(routeData.list).map((route) => ({
          ...route,
          requirements: byRoute.get(route.id) || [],
        })),
      );
      setPermissions(permissionData);
      setRoles(roleData.list);
      setFallbackPermissions(roleData.permissions);
      setUpdatedAt(new Date().toLocaleString("zh-CN", { hour12: false }));
      void loadAccess(roleData.list);
    } catch (error: any) {
      messageApi.error(error.message || "加载权限总览失败");
    } finally {
      setLoading(false);
    }
  }, [loadAccess, messageApi]);

  useEffect(() => {
    void load();
  }, [load]);

  const permissionNames = useMemo(
    () => new Map(permissions.map((item) => [item.permission_key, item.name])),
    [permissions],
  );
  const permissionName = useCallback((key: string) => permissionNames.get(key) || key, [permissionNames]);

  const requirementText = useCallback(
    (requirements: FrontendRequirement[]) => {
      if (!requirements.length || requirements.some((item) => item.requirement_type === "authenticated")) {
        return "仅需登录";
      }
      const parts: string[] = [];
      const any = requirements.filter((item) => item.requirement_type === "any");
      const all = requirements.filter((item) => item.requirement_type === "all");
      if (any.length) {
        parts.push(`任一：${any.map((item) => permissionName(item.permission_key)).join(" / ")}`);
      }
      if (all.length) {
        parts.push(`全部：${all.map((item) => permissionName(item.permission_key)).join(" 且 ")}`);
      }
      return parts.join("；") || "仅需登录";
    },
    [permissionName],
  );

  // 权限 → 关联页面（页面目录里要求了该权限的页面）
  const permissionRoutes = useMemo(() => {
    const map = new Map<string, FrontendRoute[]>();
    routes.forEach((route) => {
      route.requirements.forEach((item) => {
        if (item.requirement_type === "authenticated") return;
        map.set(item.permission_key, [...(map.get(item.permission_key) || []), route]);
      });
    });
    return map;
  }, [routes]);

  const rolePermissionKeys = useCallback(
    (roleId: string) => accessMap[roleId]?.permission_keys ?? fallbackPermissions[roleId] ?? [],
    [accessMap, fallbackPermissions],
  );
  const roleRoutes = useCallback(
    (roleId: string) => (accessMap[roleId]?.frontend_routes || []).filter((item) => item.granted),
    [accessMap],
  );
  const accessIncomplete = useCallback((roleId: string) => accessMap[roleId] === null, [accessMap]);

  const buildMarkdown = useCallback(() => {
    const esc = (value: string) => value.replace(/\|/g, "\\|");
    const lines: string[] = ["# 权限矩阵文档", ""];
    lines.push(`> 生成时间：${updatedAt || new Date().toLocaleString("zh-CN", { hour12: false })}`, "");
    lines.push("## 一、权限系统说明", "", "| 概念 | 说明 |", "| --- | --- |");
    systemConcepts.forEach(([concept, note]) => lines.push(`| ${esc(concept)} | ${esc(note)} |`));
    lines.push("", "## 二、组织列表", "", "| 组织标识 | 名称 | 类型 | 说明 |", "| --- | --- | --- | --- |");
    domains.forEach((item) =>
      lines.push(
        `| \`${esc(item.code)}\` | ${esc(item.name || "—")} | ${domainTypeOf(item.wildcard)} | ${domainNoteOf(
          item.wildcard,
        )} |`,
      ),
    );
    lines.push(
      "",
      "## 三、系统页面",
      "",
      "| 页面 | 路径 | 类型 | 状态 | 进入路径 | 所需权限 |",
      "| --- | --- | --- | --- | --- | --- |",
    );
    routes.forEach((route) =>
      lines.push(
        `| ${esc(route.name)} | \`${route.path}\` | ${routeTypeLabels[route.route_type] || route.route_type} | ${
          route.status === 1 ? "启用" : "禁用"
        } | ${esc(routeClickPath(route, routes))} | ${esc(requirementText(route.requirements))} |`,
      ),
    );
    lines.push(
      "",
      "## 四、权限定义",
      "",
      "| 权限名称 | Permission Key | 模块 | 风险 | 状态 | 关联页面 |",
      "| --- | --- | --- | --- | --- | --- |",
    );
    permissions.forEach((item) => {
      const linked = (permissionRoutes.get(item.permission_key) || []).map((route) => route.name).join("、");
      lines.push(
        `| ${esc(item.name)} | \`${item.permission_key}\` | ${esc(resourceName(item.resource, permissions))} | ${
          item.risk_level
        } | ${item.status === 1 ? "启用" : "禁用"} | ${esc(linked || "—")} |`,
      );
    });
    lines.push(
      "",
      "## 五、角色模板",
      "",
      "| 角色 | ID | 内置 | 状态 | 权限数 | 可访问页面数 |",
      "| --- | --- | --- | --- | --- | --- |",
    );
    roles.forEach((role) =>
      lines.push(
        `| ${esc(role.name)} | ${role.id} | ${role.builtin === 1 ? "是" : "否"} | ${
          role.status === 1 ? "启用" : "禁用"
        } | ${rolePermissionKeys(role.id).length} | ${roleRoutes(role.id).length} |`,
      ),
    );
    lines.push(
      "",
      "## 六、角色 → 页面",
      "",
      "角色对页面的访问来自角色访问配置中的显式授权。",
      "",
      ["| 页面 \\ 角色", ...roles.map((role) => esc(role.name)), "|"].join(" | "),
      ["| ---", ...roles.map(() => "---"), "|"].join(" | "),
    );
    routes.forEach((route) => {
      const cells = roles.map((role) =>
        roleRoutes(role.id).some((item) => item.id === route.id) ? "✓" : "",
      );
      lines.push([`| ${esc(`${route.name} (${route.path})`)}`, ...cells, "|"].join(" | "));
    });
    lines.push(
      "",
      "## 七、角色 → 权限",
      "",
      ["| 权限 \\ 角色", ...roles.map((role) => esc(role.name)), "|"].join(" | "),
      ["| ---", ...roles.map(() => "---"), "|"].join(" | "),
    );
    permissions.forEach((permission) => {
      const cells = roles.map((role) =>
        rolePermissionKeys(role.id).includes(permission.permission_key) ? "✓" : "",
      );
      lines.push(
        [`| ${esc(`${permission.name} (${permission.permission_key})`)}`, ...cells, "|"].join(" | "),
      );
    });
    lines.push("");
    return lines.join("\n");
  }, [
    domains,
    permissionRoutes,
    permissions,
    requirementText,
    rolePermissionKeys,
    roleRoutes,
    roles,
    routes,
    updatedAt,
  ]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildMarkdown());
      messageApi.success("Markdown 已复制到剪贴板");
    } catch {
      messageApi.warning("复制失败，请使用下载功能");
    }
  };

  // 矢量 PDF（jsPDF-AutoTable + 内嵌 Noto Sans SC）：几 MB 大小、文字可选中，替代旧位图方案。
  const [exporting, setExporting] = useState(false);
  const handleDownloadPdf = async () => {
    setExporting(true);
    try {
      const roleWidths: MatrixPdfSection["columnStyles"] = { 0: { cellWidth: 210 } };
      const sections: MatrixPdfSection[] = [
        {
          title: "一、权限系统说明",
          head: ["概念", "说明"],
          body: systemConcepts.map(([concept, note]) => [concept, note]),
          columnStyles: { 0: { cellWidth: 96 } },
          accentFirstColumn: true,
          bodyFontSize: 9,
        },
        {
          title: `二、组织列表（${domains.length}）`,
          head: ["组织标识", "名称", "类型", "说明"],
          body: domains.map((item) => [
            item.code,
            item.name || "—",
            domainTypeOf(item.wildcard),
            domainNoteOf(item.wildcard),
          ]),
          columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 160 }, 2: { cellWidth: 120 } },
          bodyFontSize: 9,
          highlightRows: domains
            .map((item, index) => (item.wildcard ? index : -1))
            .filter((index) => index >= 0),
        },
        {
          title: `三、系统页面（${routes.length}）`,
          head: ["页面", "路径", "类型", "状态", "进入路径", "所需权限"],
          body: routes.map((route) => [
            route.name,
            route.path,
            routeTypeLabels[route.route_type] || route.route_type,
            route.status === 1 ? "启用" : "禁用",
            routeClickPath(route, routes),
            requirementText(route.requirements),
          ]),
          columnStyles: {
            0: { cellWidth: 105 },
            1: { cellWidth: 130 },
            2: { cellWidth: 42 },
            3: { cellWidth: 42 },
          },
          centerColumns: [2, 3],
          statusColumns: [3],
        },
        {
          title: `四、权限定义（${permissions.length}）`,
          head: ["权限名称", "Permission Key", "模块", "风险", "状态", "关联页面"],
          body: permissions.map((item) => [
            item.name,
            item.permission_key,
            resourceName(item.resource, permissions),
            item.risk_level,
            item.status === 1 ? "启用" : "禁用",
            (permissionRoutes.get(item.permission_key) || []).map((route) => route.name).join("、") || "—",
          ]),
          columnStyles: {
            0: { cellWidth: 120 },
            1: { cellWidth: 190 },
            2: { cellWidth: 90 },
            3: { cellWidth: 52 },
            4: { cellWidth: 42 },
          },
          centerColumns: [3, 4],
          riskColumn: 3,
          statusColumns: [4],
        },
        {
          title: `五、角色模板（${roles.length}）`,
          head: ["角色", "ID", "内置", "状态", "权限数", "可访问页面数"],
          body: roles.map((role) => [
            role.name,
            role.id,
            role.builtin === 1 ? "是" : "否",
            role.status === 1 ? "启用" : "禁用",
            String(rolePermissionKeys(role.id).length),
            String(roleRoutes(role.id).length),
          ]),
          columnStyles: {
            0: { cellWidth: 120 },
            1: { cellWidth: 220 },
            2: { cellWidth: 50 },
            3: { cellWidth: 60 },
            4: { cellWidth: 90 },
          },
          centerColumns: [2, 3, 4, 5],
          statusColumns: [3],
        },
        {
          title: "六、角色 → 页面",
          head: ["页面 \\ 角色", ...roles.map((role) => role.name)],
          body: routes.map((route) => [
            `${route.name} (${route.path})`,
            ...roles.map((role) => (roleRoutes(role.id).some((item) => item.id === route.id) ? "✓" : "")),
          ]),
          columnStyles: roleWidths,
          checkFrom: 1,
        },
        {
          title: "七、角色 → 权限",
          head: ["权限 \\ 角色", ...roles.map((role) => role.name)],
          body: permissions.map((permission) => [
            `${permission.name} (${permission.permission_key})`,
            ...roles.map((role) =>
              rolePermissionKeys(role.id).includes(permission.permission_key) ? "✓" : "",
            ),
          ]),
          columnStyles: roleWidths,
          checkFrom: 1,
        },
      ];
      const stamp = new Date().toISOString().slice(0, 10);
      await exportMatrixPdf(
        sections,
        {
          generatedAt: updatedAt || new Date().toLocaleString("zh-CN", { hour12: false }),
        },
        `权限矩阵-${stamp}.pdf`,
      );
      messageApi.success("PDF 已下载");
    } catch (error) {
      console.error(error);
      messageApi.error("PDF 导出失败，请重试");
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const blob = new Blob([buildMarkdown()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `权限矩阵-${stamp}.md`;
    link.click();
    URL.revokeObjectURL(url);
    messageApi.success("文档已下载");
  };

  const routeColumns: ColumnsType<RouteWithRequirements> = [
    { title: "页面", dataIndex: "name", width: 200, ellipsis: true },
    {
      title: "路径",
      dataIndex: "path",
      ellipsis: true,
      render: (value: string) => (
        <Typography.Text code ellipsis={{ tooltip: value }} style={{ display: "block" }}>
          {value}
        </Typography.Text>
      ),
    },
    {
      title: "类型",
      dataIndex: "route_type",
      width: 70,
      render: (value: string) => <Tag>{routeTypeLabels[value] || value}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 70,
      render: (value: BinaryStatus) => <StatusTag value={value} />,
    },
    {
      title: "进入路径",
      key: "click-path",
      ellipsis: true,
      render: (_, row) => (
        <Typography.Text
          type="secondary"
          ellipsis={{ tooltip: routeClickPath(row, routes) }}
          style={{ display: "block" }}
        >
          {routeClickPath(row, routes)}
        </Typography.Text>
      ),
    },
    {
      title: "所需权限",
      key: "requirements",
      ellipsis: true,
      render: (_, row) => requirementText(row.requirements),
    },
  ];

  const permissionColumns: ColumnsType<AuthzPermission> = [
    { title: "权限名称", dataIndex: "name", width: 180, ellipsis: true },
    {
      title: "Permission Key",
      dataIndex: "permission_key",
      ellipsis: true,
      render: (value: string) => (
        <Typography.Text
          code
          className="authz-code authz-key-chip"
          ellipsis={{ tooltip: value }}
          style={{ display: "block" }}
        >
          {value}
        </Typography.Text>
      ),
    },
    {
      title: "模块",
      key: "resource",
      width: 120,
      ellipsis: true,
      render: (_, row) => {
        const label = resourceName(row.resource, permissions);
        return (
          <span className="authz-module-title">
            <ModuleIcon resource={row.resource} name={label} />
            <span>{label}</span>
          </span>
        );
      },
    },
    { title: "风险", dataIndex: "risk_level", width: 70, render: (value) => <RiskTag value={value} /> },
    {
      title: "状态",
      dataIndex: "status",
      width: 70,
      render: (value: BinaryStatus) => <StatusTag value={value} />,
    },
    {
      title: "关联页面",
      key: "routes",
      ellipsis: { showTitle: false },
      render: (_, row) => {
        const names = (permissionRoutes.get(row.permission_key) || []).map((route) => route.name);
        return names.length ? (
          <Tooltip title={names.join("、")}>
            <span>{names.join("、")}</span>
          </Tooltip>
        ) : (
          "—"
        );
      },
    },
  ];

  const roleColumns: ColumnsType<AuthzRoleTemplate> = [
    { title: "角色", dataIndex: "name", width: 200, ellipsis: true },
    {
      title: "ID",
      dataIndex: "id",
      width: 220,
      ellipsis: true,
      render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
    },
    {
      title: "内置",
      dataIndex: "builtin",
      width: 70,
      render: (value: BinaryStatus) => (value === 1 ? <Tag color="purple">内置</Tag> : <Tag>自定义</Tag>),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 70,
      render: (value: BinaryStatus) => <StatusTag value={value} />,
    },
    { title: "权限数", key: "permissions", width: 80, render: (_, row) => rolePermissionKeys(row.id).length },
    { title: "可访问页面数", key: "routes", width: 110, render: (_, row) => roleRoutes(row.id).length },
  ];

  const matrixColumns = (rowTitle: string): ColumnsType<{ label: string } & Record<string, unknown>> => [
    { title: rowTitle, dataIndex: "label", fixed: "left", width: 240, ellipsis: true },
    ...roles.map((role) => ({
      title: accessIncomplete(role.id) ? (
        <Tooltip title="访问数据加载失败">{role.name} ？</Tooltip>
      ) : (
        role.name
      ),
      dataIndex: role.id,
      width: 110,
      align: "center" as const,
      render: (value: unknown) => (value ? <span className="authz-matrix-check">✓</span> : ""),
    })),
  ];

  const roleRouteMatrix = useMemo(
    () =>
      routes.map((route) => ({
        label: `${route.name} (${route.path})`,
        ...Object.fromEntries(
          roles.map((role) => [role.id, roleRoutes(role.id).some((item) => item.id === route.id)]),
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routes, roles, accessMap],
  );
  const rolePermissionMatrix = useMemo(
    () =>
      permissions.map((permission) => ({
        label: `${permission.name} (${permission.permission_key})`,
        ...Object.fromEntries(
          roles.map((role) => [role.id, rolePermissionKeys(role.id).includes(permission.permission_key)]),
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [permissions, roles, accessMap, fallbackPermissions],
  );

  return (
    <>
      {contextHolder}
      <div className="authz-doc-toolbar">
        <Typography.Text type="secondary">
          页面所需权限来自前端页面目录；角色对页面的访问来自角色访问配置中的显式授权。
          {updatedAt && ` 数据时间：${updatedAt}`}
        </Typography.Text>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={() => void load()} loading={loading}>
            刷新
          </Button>
          <Button icon={<CopyOutlined />} onClick={() => void handleCopy()} disabled={loading}>
            复制 Markdown
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={() => void handleDownloadPdf()}
            loading={exporting}
            disabled={loading}
          >
            下载 PDF
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload} disabled={loading}>
            下载 Markdown
          </Button>
        </Space>
      </div>
      {loading ? (
        <div style={{ minHeight: 320, display: "grid", placeItems: "center" }}>
          <Spin size="large" tip="加载权限总览..." />
        </div>
      ) : (
        <>
          {accessError && (
            <Alert type="warning" showIcon message={accessError} style={{ marginBottom: 16 }} />
          )}
          <section className="authz-doc-section">
            <Typography.Title level={5} className="authz-doc-section-title">
              一、权限系统说明
            </Typography.Title>
            {/* 模型图：授权链路 + 访问判定，与下方概念说明对照阅读 */}
            <div className="authz-model-card authz-fade-in">
              <div className="authz-model-caption">授权模型</div>
              <div className="authz-model-flow">
                <div className="authz-model-node">
                  主体（账号）
                  <span className="authz-model-node-sub">用户 / 服务账号</span>
                </div>
                <div className="authz-model-link">
                  <span>授予</span>
                  <i className="authz-model-line" />
                </div>
                <div className="authz-model-node">
                  角色
                  <span className="authz-model-node-sub">权限的集合</span>
                </div>
                <div className="authz-model-link">
                  <span>绑定组织</span>
                  <i className="authz-model-line" />
                </div>
                <div className="authz-model-node">
                  组织（数据域）
                  <span className="authz-model-node-sub">授权生效范围 · * = 全部组织</span>
                </div>
              </div>
              <div className="authz-model-flow">
                <div className="authz-model-node">
                  角色
                  <span className="authz-model-node-sub">绑定组织后生效</span>
                </div>
                <div className="authz-model-link">
                  <span>聚合</span>
                  <i className="authz-model-line" />
                </div>
                <div className="authz-model-node is-permission">
                  权限
                  <span className="authz-model-node-sub">对功能的操作许可</span>
                </div>
                <div className="authz-model-link is-back">
                  <span>声明所需</span>
                  <i className="authz-model-line" />
                </div>
                <div className="authz-model-node is-resource">
                  页面 / 接口
                  <span className="authz-model-node-sub">前端页面 · 后端端点</span>
                </div>
              </div>
              <div className="authz-model-chain">
                <span className="authz-model-caption is-inline">访问判定</span>
                <span className="authz-model-chain-node">收到请求</span>
                <span className="authz-model-chain-arrow">→</span>
                <span className="authz-model-chain-node">校验登录</span>
                <span className="authz-model-chain-arrow">→</span>
                <span className="authz-model-chain-node">汇总权限集合</span>
                <span className="authz-model-chain-arrow">→</span>
                <span className="authz-model-chain-node">比对页面 / 接口要求</span>
                <span className="authz-model-chain-arrow">→</span>
                <span className="authz-model-chain-node">按组织过滤数据</span>
              </div>
            </div>
            <table className="authz-glossary">
              <tbody>
                {systemConcepts.map(([concept, note]) => (
                  <tr key={concept}>
                    <th scope="row">{concept}</th>
                    <td>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="authz-doc-section">
            <Typography.Title level={5} className="authz-doc-section-title">
              二、组织列表（{domains.length}）
            </Typography.Title>
            {domains.length === 0 ? (
              <Typography.Text type="secondary">暂无组织</Typography.Text>
            ) : (
              <Table
                className="authz-table"
                size="small"
                rowKey="code"
                columns={domainColumns}
                dataSource={domains}
                rowClassName={(item) => (item.wildcard ? "authz-domain-wildcard-row" : "")}
                pagination={false}
                locale={{ emptyText: "暂无组织" }}
              />
            )}
          </section>
          <section className="authz-doc-section">
            <Typography.Title level={5} className="authz-doc-section-title">
              三、系统页面（{routes.length}）
            </Typography.Title>
            <Table
              className="authz-table"
              size="small"
              rowKey="id"
              columns={routeColumns}
              dataSource={routes}
              tableLayout="fixed"
              pagination={{
                pageSize: 20,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 个页面`,
              }}
              locale={{ emptyText: "暂无页面" }}
            />
          </section>
          <section className="authz-doc-section">
            <Typography.Title level={5} className="authz-doc-section-title">
              四、权限定义（{permissions.length}）
            </Typography.Title>
            <Table
              className="authz-table"
              size="small"
              rowKey="id"
              columns={permissionColumns}
              dataSource={permissions}
              tableLayout="fixed"
              pagination={{
                pageSize: 20,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 项权限`,
              }}
              locale={{ emptyText: "暂无权限" }}
            />
          </section>
          <section className="authz-doc-section">
            <Typography.Title level={5} className="authz-doc-section-title">
              五、角色模板（{roles.length}）
            </Typography.Title>
            <Table
              className="authz-table"
              size="small"
              rowKey="id"
              columns={roleColumns}
              dataSource={roles}
              tableLayout="fixed"
              pagination={false}
              locale={{ emptyText: "暂无角色" }}
            />
          </section>
          <section className="authz-doc-section">
            <Typography.Title level={5} className="authz-doc-section-title">
              六、角色 → 页面
            </Typography.Title>
            {accessLoading && (
              <Typography.Paragraph type="secondary">
                <Spin size="small" /> 正在加载各角色的访问数据...
              </Typography.Paragraph>
            )}
            <Table
              className="authz-table"
              size="small"
              rowKey="label"
              columns={matrixColumns("页面 \\ 角色")}
              dataSource={roleRouteMatrix}
              scroll={{ x: "max-content", y: 420 }}
              pagination={false}
              locale={{ emptyText: "暂无页面" }}
            />
          </section>
          <section className="authz-doc-section">
            <Typography.Title level={5} className="authz-doc-section-title">
              七、角色 → 权限
            </Typography.Title>
            <Table
              className="authz-table"
              size="small"
              rowKey="label"
              columns={matrixColumns("权限 \\ 角色")}
              dataSource={rolePermissionMatrix}
              scroll={{ x: "max-content", y: 420 }}
              pagination={false}
              locale={{ emptyText: "暂无权限" }}
            />
          </section>
        </>
      )}
    </>
  );
}
