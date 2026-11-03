import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppstoreOutlined,
  DownOutlined,
  FileTextOutlined,
  FolderOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  type BinaryStatus,
  createFrontendRoute,
  deleteFrontendRoute,
  fetchFrontendRoutes,
  type FrontendRequirement,
  type FrontendRoute,
  replaceFrontendRequirements,
  type RequirementType,
  updateFrontendRoute,
} from "./api";
import { FilterBar, StatusSelect, StatusTag } from "./common";
import { useAuthzPage } from "./context";
import { NavigationIcon } from "./navigation-icons";
import { groupRoutes, parentRoutePaths, routeDepth } from "./route-catalog";

// 「全部页面」视图下的行模型：真实页面行 + 导航分组标题行（__groupHeader 标记）
type CatalogRow = FrontendRoute & { __groupHeader?: string };

const requirementLabels: Record<RequirementType, string> = {
  any: "组内任一权限即可",
  all: "组内权限全部需要",
  authenticated: "登录即可访问",
};

export default function RoutesTab() {
  const { canManage, options, permissions, publishSuccess } = useAuthzPage();
  const [messageApi, contextHolder] = message.useMessage();
  const [rows, setRows] = useState<FrontendRoute[]>([]);
  const [requirements, setRequirements] = useState<FrontendRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [queryKeyword, setQueryKeyword] = useState("");
  const [status, setStatus] = useState<BinaryStatus | "">("");
  const [activeNavigation, setActiveNavigation] = useState("");
  const [collapsedPaths, setCollapsedPaths] = useState<string[]>([]);
  const [editing, setEditing] = useState<FrontendRoute | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [requirementsRoute, setRequirementsRoute] = useState<FrontendRoute | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [requirementsForm] = Form.useForm();
  const listRequestId = useRef(0);
  const watchedRequirements = Form.useWatch("requirements", requirementsForm);

  const load = useCallback(async () => {
    const requestId = ++listRequestId.current;
    setLoading(true);
    try {
      const allRows: FrontendRoute[] = [];
      const allRequirements: FrontendRequirement[] = [];
      let pageNumber = 1;
      let total = 0;
      do {
        const data = await fetchFrontendRoutes({ page: pageNumber, page_size: 200 });
        const batch = data.list || [];
        allRows.push(...batch);
        allRequirements.push(...(data.requirements || []));
        total = data.total || 0;
        if (batch.length === 0) break;
        pageNumber += 1;
      } while (allRows.length < total);
      if (requestId !== listRequestId.current) return;
      setRows(allRows);
      setRequirements(allRequirements);
      setCollapsedPaths(parentRoutePaths(allRows));
    } catch (error: any) {
      if (requestId === listRequestId.current) messageApi.error(error.message || "加载前端页面失败");
    } finally {
      if (requestId === listRequestId.current) setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (keyword.trim() !== queryKeyword) {
        setQueryKeyword(keyword.trim());
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword, queryKeyword]);

  const requirementsByRoute = useMemo(() => {
    const map = new Map<number, FrontendRequirement[]>();
    requirements.forEach((item) =>
      map.set(item.frontend_route_id, [...(map.get(item.frontend_route_id) || []), item]),
    );
    return map;
  }, [requirements]);
  const permissionNames = useMemo(
    () => new Map(permissions.map((item) => [item.permission_key, item.name])),
    [permissions],
  );
  const groupedCatalog = useMemo(() => groupRoutes(rows), [rows]);
  const matchedRows = useMemo(() => {
    const query = queryKeyword.toLowerCase();
    return rows.filter(
      (route) =>
        (!query || `${route.name} ${route.path} ${route.navigation}`.toLowerCase().includes(query)) &&
        (status === "" || route.status === status),
    );
  }, [rows, queryKeyword, status]);
  const visibleGroups =
    queryKeyword || status !== ""
      ? groupedCatalog.filter(([, routes]) => routes.some((route) => matchedRows.includes(route)))
      : groupedCatalog;
  // 「全部页面」伪分组：聚合所有导航下的页面（不含导航容器行）
  const ALL_PAGES = "__all__";
  const currentGroup: [string, FrontendRoute[]] | undefined = useMemo(() => {
    if (activeNavigation === ALL_PAGES) {
      return [
        ALL_PAGES,
        visibleGroups.flatMap(([, list]) => list.filter((route) => route.route_type !== "navigation")),
      ];
    }
    return (
      visibleGroups.find(([name]) => name === activeNavigation) ||
      visibleGroups.find(([, routes]) => routes.some((route) => route.route_type === "detail")) ||
      visibleGroups[0]
    );
  }, [activeNavigation, visibleGroups]);
  const groupRows = useMemo(() => currentGroup?.[1] || [], [currentGroup]);
  const navigationContainer = groupRows.find((route) => route.route_type === "navigation");
  const groupPageCount = groupRows.filter((route) => route.route_type !== "navigation").length;
  const groupDetailCount = groupRows.filter((route) => route.route_type === "detail").length;
  const allPageCount = visibleGroups.reduce(
    (sum, [, list]) => sum + list.filter((route) => route.route_type !== "navigation").length,
    0,
  );
  const catalogRows = useMemo<CatalogRow[]>(() => {
    const visible = new Set(matchedRows.map((route) => route.id));
    const byPath = new Map(rows.map((route) => [route.path, route]));
    matchedRows.forEach((route) => {
      const seen = new Set([route.path]);
      let parent = route.parent_path;
      while (parent && !seen.has(parent)) {
        seen.add(parent);
        const item = byPath.get(parent);
        if (!item || item.route_type === "navigation") break;
        visible.add(item.id);
        parent = item.parent_path;
      }
    });
    const notCollapsed = (route: FrontendRoute) => {
      if (queryKeyword || status !== "") return true;
      const seen = new Set([route.path]);
      let parent = route.parent_path;
      while (parent && !seen.has(parent)) {
        if (collapsedPaths.includes(parent)) return false;
        seen.add(parent);
        parent = byPath.get(parent)?.parent_path || "";
      }
      return true;
    };
    const pick = (list: FrontendRoute[]) =>
      list.filter((route) => route.route_type !== "navigation" && visible.has(route.id)).filter(notCollapsed);
    // 单导航视图：直接返回该组行；「全部页面」视图：按导航插入分组标题行
    if (activeNavigation !== ALL_PAGES) return pick(groupRows);
    const result: CatalogRow[] = [];
    visibleGroups.forEach(([name, list]) => {
      const rowsInGroup = pick(list);
      if (rowsInGroup.length > 0) {
        result.push({ __groupHeader: name } as CatalogRow);
        result.push(...rowsInGroup);
      }
    });
    return result;
  }, [rows, matchedRows, groupRows, visibleGroups, activeNavigation, queryKeyword, status, collapsedPaths]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 1 });
    setModalOpen(true);
  };
  const openEdit = (row: FrontendRoute) => {
    setEditing(row);
    form.setFieldsValue(row);
    setModalOpen(true);
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        path: values.path,
        name: values.name,
        description: values.description || "",
        status: values.status,
      };
      setSaving(true);
      const result = editing
        ? await updateFrontendRoute(editing.id, payload)
        : await createFrontendRoute(payload);
      setModalOpen(false);
      publishSuccess(result.policy_version);
      await load();
    } catch (error: any) {
      if (error?.errorFields) return;
      messageApi.error(error.message || "保存前端页面失败");
    } finally {
      setSaving(false);
    }
  };

  const openRequirements = (row: FrontendRoute) => {
    setRequirementsRoute(row);
    requirementsForm.setFieldsValue({
      requirements: (requirementsByRoute.get(row.id) || []).map(({ permission_key, requirement_type }) => ({
        permission_key,
        requirement_type,
      })),
    });
  };

  const saveRequirements = async () => {
    if (!requirementsRoute) return;
    try {
      const values = await requirementsForm.validateFields();
      const list = values.requirements || [];
      if (
        list.some((item: FrontendRequirement) => item.requirement_type === "authenticated") &&
        list.length !== 1
      ) {
        messageApi.warning("“登录即可访问”不能与其他权限条件同时设置");
        return;
      }
      const normalizedList = list.map((item: FrontendRequirement) => ({
        permission_key: item.requirement_type === "authenticated" ? "" : item.permission_key,
        requirement_type: item.requirement_type,
      }));
      const keys = list.map((item: any) => `${item.permission_key}:${item.requirement_type}`);
      if (new Set(keys).size !== keys.length) {
        messageApi.warning("存在重复的页面权限要求");
        return;
      }
      Modal.confirm({
        title: "确认替换页面基础权限？",
        content:
          list.length === 0
            ? "清空后该页面不再要求基础功能权限，仍可在角色的“页面访问”中分配。"
            : "本次提交会完整替换原基础权限。若已有角色因此缺少权限，后端会拒绝修改。",
        okText: "确认替换",
        onOk: async () => {
          try {
            setSaving(true);
            const result = await replaceFrontendRequirements(requirementsRoute.id, normalizedList);
            setRequirementsRoute(null);
            publishSuccess(result.policy_version);
            await load();
          } catch (error: any) {
            messageApi.error(error.message || "替换页面权限失败");
          } finally {
            setSaving(false);
          }
        },
      });
    } catch (error: any) {
      if (!error?.errorFields) messageApi.error(error.message || "请检查页面权限要求");
    }
  };

  const columns: ColumnsType<CatalogRow> = [
    {
      title: "页面",
      key: "route",
      width: "44%",
      render: (_, row) => {
        // 导航分组标题行：仅第一列渲染组名
        if (row.__groupHeader) {
          return (
            <div className="authz-catalog-group-title">
              <NavigationIcon name={row.__groupHeader} />
              {row.__groupHeader}
            </div>
          );
        }
        const hasChildren = groupRows.some((item) => item.parent_path === row.path);
        const collapsed = collapsedPaths.includes(row.path);
        const filtering = Boolean(queryKeyword) || status !== "";
        const depth = routeDepth(row, rows);
        return (
          <div
            className={`authz-catalog-row${row.parent_path ? " authz-catalog-child" : ""}`}
            style={{
              // GitHub 文件树风格：缩进区绘制竖向引导线，替代纯空白的层级暗示
              paddingLeft: depth * 18,
              backgroundImage:
                depth > 0
                  ? "repeating-linear-gradient(90deg, transparent 0, transparent 17px, #e8e8e8 17px, #e8e8e8 18px)"
                  : undefined,
              backgroundSize: depth > 0 ? `${depth * 18}px 100%` : undefined,
              backgroundRepeat: "no-repeat",
            }}
          >
            {hasChildren ? (
              <Button
                type="text"
                size="small"
                className="authz-page-tree-toggle"
                disabled={filtering}
                aria-label={`${collapsed && !filtering ? "展开" : "收起"}${row.name}的详情页`}
                aria-expanded={!collapsed || filtering}
                icon={collapsed && !filtering ? <RightOutlined /> : <DownOutlined />}
                onClick={() =>
                  setCollapsedPaths((current) =>
                    collapsed ? current.filter((path) => path !== row.path) : [...current, row.path],
                  )
                }
              />
            ) : (
              <span className="authz-page-tree-toggle-spacer" />
            )}
            <span
              className={`authz-catalog-node-icon${row.route_type === "detail" ? " is-detail" : ""}`}
              aria-hidden="true"
            >
              {/* GitHub 文件树隐喻：有下级=文件夹，叶子页面=文档；详情页图标转灰 */}
              {hasChildren ? <FolderOutlined /> : <FileTextOutlined />}
            </span>
            <Tooltip title={row.description || row.name}>
              <Typography.Text strong={row.route_type !== "detail"}>{row.name}</Typography.Text>
            </Tooltip>
            <span className={`authz-catalog-type-label${row.route_type === "detail" ? " is-detail" : ""}`}>
              {row.route_type === "detail" ? "详情页" : "主页面"}
            </span>
            <Tooltip title={row.path}>
              <code className="authz-catalog-path">{row.path}</code>
            </Tooltip>
            {!matchedRows.includes(row) && <span className="authz-page-tree-context">上级页面</span>}
          </div>
        );
      },
    },
    {
      title: "基础权限",
      key: "requirements",
      render: (_, row) => {
        if (row.__groupHeader) return null;
        if (row.route_type === "navigation") return <span className="authz-muted">自动管理</span>;
        const list = requirementsByRoute.get(row.id) || [];
        const any = list.filter((item) => item.requirement_type === "any");
        const all = list.filter((item) => item.requirement_type === "all");
        const authenticated = list.some((item) => item.requirement_type === "authenticated");
        return (
          <div className="authz-route-requirements">
            {list.length === 0 ? (
              <span className="authz-muted">无需基础权限</span>
            ) : authenticated ? (
              <Tag color="green">登录即可访问</Tag>
            ) : (
              <>
                {any.length > 0 && (
                  <div className="authz-route-requirement-group">
                    {any.length > 1 && <span className="authz-muted">任一：</span>}
                    {any.map((item) => (
                      <Tag
                        key={item.id || `${item.permission_key}:any`}
                        color="blue"
                        title={item.permission_key}
                      >
                        {permissionNames.get(item.permission_key) || item.permission_key}
                      </Tag>
                    ))}
                  </div>
                )}
                {any.length > 0 && all.length > 0 && <span className="authz-muted">或</span>}
                {all.length > 0 && (
                  <div className="authz-route-requirement-group">
                    <span className="authz-muted">全部：</span>
                    {all.map((item) => (
                      <Tag
                        key={item.id || `${item.permission_key}:all`}
                        color="purple"
                        title={item.permission_key}
                      >
                        {permissionNames.get(item.permission_key) || item.permission_key}
                      </Tag>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 70,
      render: (value, row) => (row.__groupHeader ? null : <StatusTag value={value} />),
    },
    {
      title: "操作",
      key: "actions",
      width: 158,
      render: (_, row) =>
        !row.__groupHeader && (
          <Space size={0} className="authz-catalog-actions">
            {row.route_type !== "navigation" && (
              <Button type="link" size="small" onClick={() => openRequirements(row)}>
                {canManage ? "配置权限" : "查看权限"}
              </Button>
            )}
            {canManage && (
              <Button type="link" size="small" onClick={() => openEdit(row)}>
                编辑
              </Button>
            )}
            {canManage && (
              <Popconfirm
                title="确认禁用该前端页面？"
                okButtonProps={{ danger: true }}
                onConfirm={async () => {
                  try {
                    const result = await deleteFrontendRoute(row.id);
                    publishSuccess(result.policy_version);
                    await load();
                  } catch (error: any) {
                    messageApi.error(error.message || "禁用页面失败");
                  }
                }}
              >
                <Button type="link" size="small" danger>
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
        onSearch={() => setQueryKeyword(keyword.trim())}
        onRefresh={() => void load()}
        placeholder="页面名称或路由"
        extra={
          canManage && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建页面
            </Button>
          )
        }
      >
        <StatusSelect value={status} onChange={setStatus} />
      </FilterBar>
      <div className="authz-page-browser authz-page-catalog">
        <nav className="authz-page-browser-nav" aria-label="页面所属导航">
          <button
            type="button"
            className={`authz-page-browser-nav-item${activeNavigation === ALL_PAGES ? " is-active" : ""}`}
            aria-pressed={activeNavigation === ALL_PAGES}
            onClick={() => setActiveNavigation(ALL_PAGES)}
          >
            <span>
              <AppstoreOutlined /> 全部页面
            </span>
            <span>{allPageCount}</span>
          </button>
          {visibleGroups.map(([name, routes]) => (
            <button
              key={name}
              type="button"
              className={`authz-page-browser-nav-item${currentGroup?.[0] === name ? " is-active" : ""}`}
              aria-pressed={currentGroup?.[0] === name}
              onClick={() => {
                setActiveNavigation(name);
              }}
            >
              <span>
                <NavigationIcon name={name} /> {name}
              </span>
              <span>{routes.filter((route) => route.route_type !== "navigation").length}</span>
            </button>
          ))}
        </nav>
        <div className="authz-page-tree-group">
          <div className="authz-page-tree-heading authz-catalog-heading">
            <div className="authz-catalog-heading-title">
              <strong>{activeNavigation === ALL_PAGES ? "全部页面" : currentGroup?.[0] || "页面"}</strong>
              <span>
                {groupDetailCount > 0
                  ? `${groupPageCount} 个页面 · ${groupDetailCount} 个详情页`
                  : `${groupPageCount} 个页面`}
              </span>
            </div>
            {!queryKeyword && status === "" && groupDetailCount > 0 && (
              <Space size={4}>
                <Button
                  type="link"
                  size="small"
                  disabled={collapsedPaths.length === 0}
                  onClick={() => setCollapsedPaths([])}
                >
                  展开全部
                </Button>
                <Button
                  type="link"
                  size="small"
                  onClick={() =>
                    setCollapsedPaths(
                      groupRows
                        .filter((route) => groupRows.some((item) => item.parent_path === route.path))
                        .map((route) => route.path),
                    )
                  }
                >
                  收起全部
                </Button>
              </Space>
            )}
            {navigationContainer && (
              <Space size={4}>
                <span className="authz-page-tree-count">导航容器</span>
                <StatusTag value={navigationContainer.status} />
                {canManage && (
                  <Button type="link" size="small" onClick={() => openEdit(navigationContainer)}>
                    编辑
                  </Button>
                )}
                {canManage && (
                  <Popconfirm
                    title="确认禁用该导航容器？"
                    okButtonProps={{ danger: true }}
                    onConfirm={async () => {
                      try {
                        const result = await deleteFrontendRoute(navigationContainer.id);
                        publishSuccess(result.policy_version);
                        await load();
                      } catch (error: any) {
                        messageApi.error(error.message || "禁用导航失败");
                      }
                    }}
                  >
                    <Button type="link" danger size="small">
                      禁用
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            )}
          </div>
          <Table
            className="authz-table authz-catalog-table"
            size="small"
            rowKey={(row) => (row.__groupHeader ? `group:${row.__groupHeader}` : String(row.id))}
            rowClassName={(row) =>
              row.__groupHeader
                ? "authz-catalog-group-row"
                : row.route_type === "detail"
                  ? "authz-catalog-detail-row"
                  : "authz-catalog-main-row"
            }
            columns={columns}
            dataSource={catalogRows}
            loading={loading}
            tableLayout="fixed"
            pagination={false}
            locale={{ emptyText: queryKeyword || status !== "" ? "没有匹配的页面" : "暂无页面" }}
          />
        </div>
      </div>
      <Modal
        title={editing ? "编辑前端页面" : "新建前端页面"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void save()}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="path"
            label="路由路径"
            rules={[{ required: true }, { pattern: /^\//, message: "路径必须以 / 开头" }]}
          >
            <Input placeholder="/devices" />
          </Form.Item>
          <Form.Item name="name" label="页面名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={3} />
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
      <Drawer
        title={`页面基础权限 · ${requirementsRoute?.name || ""}`}
        open={Boolean(requirementsRoute)}
        onClose={() => setRequirementsRoute(null)}
        width={720}
        extra={
          canManage && (
            <Button type="primary" loading={saving} onClick={() => void saveRequirements()}>
              保存要求
            </Button>
          )
        }
      >
        <Typography.Paragraph type="secondary">
          页面是否展示由角色的“页面访问”配置决定。这里的基础权限用于校验角色能否分配该页面：“组内任一权限即可”需拥有该组任意一项，“组内权限全部需要”需拥有该组所有项；两组都设置时满足其中一组即可。
        </Typography.Paragraph>
        <Form form={requirementsForm} layout="vertical" disabled={!canManage}>
          <Form.List name="requirements">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} align="start" style={{ display: "flex", marginBottom: 8 }}>
                    {watchedRequirements?.[field.name]?.requirement_type !== "authenticated" ? (
                      <Form.Item
                        {...field}
                        name={[field.name, "permission_key"]}
                        rules={[{ required: true, message: "请选择权限" }]}
                      >
                        <Select
                          showSearch
                          optionFilterProp="label"
                          style={{ width: 350 }}
                          placeholder="选择所需权限"
                          options={permissions.map((item) => ({
                            label: `${item.name} · ${item.permission_key}`,
                            value: item.permission_key,
                          }))}
                        />
                      </Form.Item>
                    ) : (
                      <Typography.Text
                        type="secondary"
                        style={{ display: "inline-block", width: 350, paddingTop: 5 }}
                      >
                        已启用且已登录的用户均可访问
                      </Typography.Text>
                    )}
                    <Form.Item
                      {...field}
                      name={[field.name, "requirement_type"]}
                      rules={[{ required: true }]}
                    >
                      <Select
                        style={{ width: 180 }}
                        options={options.requirement_types
                          .filter((value) => value !== "authenticated" || fields.length === 1)
                          .map((value) => ({
                            label: requirementLabels[value],
                            value,
                          }))}
                      />
                    </Form.Item>
                    {canManage && (
                      <Button danger onClick={() => remove(field.name)}>
                        移除
                      </Button>
                    )}
                  </Space>
                ))}
                {canManage && (
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    disabled={watchedRequirements?.some(
                      (item: FrontendRequirement) => item?.requirement_type === "authenticated",
                    )}
                    onClick={() => add({ requirement_type: "any" })}
                  >
                    添加权限要求
                  </Button>
                )}
              </>
            )}
          </Form.List>
        </Form>
      </Drawer>
    </>
  );
}
