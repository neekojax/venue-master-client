import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PartitionOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  createFrontendRoute,
  createRole,
  createUser,
  deleteFrontendRoute,
  deleteRole,
  deleteUser,
  fetchFrontendRoutesWithStatus,
  fetchRbacRoles,
  fetchRbacUsers,
  fetchRoleFrontendRoutes,
  fetchRolePermissions,
  type FrontendRouteItem,
  type FrontendRoutePermission,
  type RbacRole,
  type RbacRolePermissions,
  type RbacUser,
  updateFrontendRoute,
  updateRoleApiPermission,
  updateRoleFrontendRoutePermission,
  updateUserPassword,
  updateUserRoles,
} from "./api";

const { Paragraph, Text } = Typography;

type RouteModalMode = "create" | "edit";
type PermissionStatusFilter = "all" | "enabled" | "disabled";

export default function RbacCenterPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [users, setUsers] = useState<RbacUser[]>([]);
  const [frontendRoutes, setFrontendRoutes] = useState<FrontendRouteItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [rolePermissions, setRolePermissions] = useState<RbacRolePermissions | null>(null);
  const [roleFrontendRoutes, setRoleFrontendRoutes] = useState<FrontendRoutePermission[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingRoleDetail, setLoadingRoleDetail] = useState(false);
  const [savingApiSlug, setSavingApiSlug] = useState<string>("");
  const [savingFrontendRouteId, setSavingFrontendRouteId] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("roles");
  const [roleSearchKeyword, setRoleSearchKeyword] = useState("");
  const [userSearchKeyword, setUserSearchKeyword] = useState("");
  const [apiPermissionStatusFilter, setApiPermissionStatusFilter] = useState<PermissionStatusFilter>("all");
  const [frontendRouteStatusFilter, setFrontendRouteStatusFilter] = useState<PermissionStatusFilter>("all");

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [roleAssignModalOpen, setRoleAssignModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [routeModalOpen, setRouteModalOpen] = useState(false);

  const [routeModalMode, setRouteModalMode] = useState<RouteModalMode>("create");
  const [editingUser, setEditingUser] = useState<RbacUser | null>(null);
  const [editingRoute, setEditingRoute] = useState<FrontendRouteItem | null>(null);

  const [roleForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [assignRoleForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [routeForm] = Form.useForm();

  const roleIds = (localStorage.getItem("permission_ids") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const isSuperAdmin = roleIds.includes("role-super-admin");

  const roleOptions = useMemo(
    () => roles.map((role) => ({ label: `${role.name} (${role.id})`, value: role.id })),
    [roles],
  );

  const flattenedApiPermissions = useMemo(() => {
    if (!rolePermissions) {
      return [];
    }

    return rolePermissions.routes.flatMap((group) =>
      group.apis.map((api) => ({
        ...api,
        route_name: group.name,
        route_slug: group.route,
      })),
    );
  }, [rolePermissions]);

  const filteredApiPermissions = useMemo(() => {
    if (apiPermissionStatusFilter === "enabled") {
      return flattenedApiPermissions.filter((item) => item.enabled === 1);
    }
    if (apiPermissionStatusFilter === "disabled") {
      return flattenedApiPermissions.filter((item) => item.enabled !== 1);
    }
    return flattenedApiPermissions;
  }, [apiPermissionStatusFilter, flattenedApiPermissions]);

  const filteredRoleFrontendRoutes = useMemo(() => {
    if (frontendRouteStatusFilter === "enabled") {
      return roleFrontendRoutes.filter((item) => item.enabled === 1);
    }
    if (frontendRouteStatusFilter === "disabled") {
      return roleFrontendRoutes.filter((item) => item.enabled !== 1);
    }
    return roleFrontendRoutes;
  }, [frontendRouteStatusFilter, roleFrontendRoutes]);

  const filteredRoles = useMemo(() => {
    const keyword = roleSearchKeyword.trim().toLowerCase();
    if (!keyword) {
      return roles;
    }

    return roles.filter((role) =>
      [role.name, role.id, role.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [roleSearchKeyword, roles]);

  const filteredUsers = useMemo(() => {
    const keyword = userSearchKeyword.trim().toLowerCase();
    if (!keyword) {
      return users;
    }

    return users.filter((user) =>
      [user.username, user.user_id, user.nickname, user.email, ...(user.role_names || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [userSearchKeyword, users]);

  const loadRoles = useCallback(
    async (preferredRoleId?: string) => {
      setLoadingRoles(true);
      try {
        const res: any = await fetchRbacRoles();
        const nextRoles: RbacRole[] = Array.isArray(res?.data?.roles) ? res.data.roles : [];
        setRoles(nextRoles);

        setSelectedRoleId((currentRoleId) => {
          if (preferredRoleId && nextRoles.some((role) => role.id === preferredRoleId)) {
            return preferredRoleId;
          }
          if (currentRoleId && nextRoles.some((role) => role.id === currentRoleId)) {
            return currentRoleId;
          }
          return nextRoles[0]?.id || "";
        });
      } catch (error: any) {
        messageApi.error(error?.message || "加载角色失败");
      } finally {
        setLoadingRoles(false);
      }
    },
    [messageApi],
  );

  const loadRoleDetail = useCallback(
    async (roleId: string) => {
      if (!roleId) {
        setRolePermissions(null);
        setRoleFrontendRoutes([]);
        return;
      }

      setLoadingRoleDetail(true);
      try {
        const [permissionRes, routeRes]: any[] = await Promise.all([
          fetchRolePermissions(roleId),
          fetchRoleFrontendRoutes(roleId),
        ]);
        setRolePermissions(permissionRes?.data || null);
        setRoleFrontendRoutes(Array.isArray(routeRes?.data?.routes) ? routeRes.data.routes : []);
      } catch (error: any) {
        messageApi.error(error?.message || "加载角色详情失败");
      } finally {
        setLoadingRoleDetail(false);
      }
    },
    [messageApi],
  );

  const loadUsers = useCallback(async () => {
    if (!isSuperAdmin) return;
    setLoadingUsers(true);
    try {
      const res: any = await fetchRbacUsers();
      setUsers(Array.isArray(res?.data?.users) ? res.data.users : []);
    } catch (error: any) {
      messageApi.error(error?.message || "加载用户失败");
    } finally {
      setLoadingUsers(false);
    }
  }, [isSuperAdmin, messageApi]);

  const loadFrontendRoutes = useCallback(async () => {
    if (!isSuperAdmin) return;
    setLoadingRoutes(true);
    try {
      const res: any = await fetchFrontendRoutesWithStatus();
      setFrontendRoutes(Array.isArray(res?.data?.routes) ? res.data.routes : []);
    } catch (error: any) {
      messageApi.error(error?.message || "加载前端路由失败");
    } finally {
      setLoadingRoutes(false);
    }
  }, [isSuperAdmin, messageApi]);

  useEffect(() => {
    void loadRoles();
    if (isSuperAdmin) {
      void loadUsers();
      void loadFrontendRoutes();
    }
  }, [isSuperAdmin, loadFrontendRoutes, loadRoles, loadUsers]);

  useEffect(() => {
    void loadRoleDetail(selectedRoleId);
  }, [selectedRoleId, loadRoleDetail]);

  const refreshCurrentTab = async () => {
    if (activeTab === "roles") {
      await loadRoles(selectedRoleId);
      return;
    }
    if (activeTab === "users") {
      await loadUsers();
      return;
    }
    await loadFrontendRoutes();
  };

  const handleApiToggle = async (apiSlug: string, enabled: boolean) => {
    if (!selectedRoleId) return;
    setSavingApiSlug(apiSlug);
    try {
      await updateRoleApiPermission(selectedRoleId, apiSlug, enabled ? 1 : 0);
      messageApi.success("接口权限已更新");
      await loadRoleDetail(selectedRoleId);
    } catch (error: any) {
      messageApi.error(error?.message || "更新接口权限失败");
    } finally {
      setSavingApiSlug("");
    }
  };

  const handleFrontendRouteToggle = async (frontendRouteId: number, enabled: boolean) => {
    if (!selectedRoleId) return;
    setSavingFrontendRouteId(frontendRouteId);
    try {
      await updateRoleFrontendRoutePermission(selectedRoleId, frontendRouteId, enabled ? 1 : 0);
      messageApi.success("前端路由权限已更新");
      await loadRoleDetail(selectedRoleId);
    } catch (error: any) {
      messageApi.error(error?.message || "更新前端路由权限失败");
    } finally {
      setSavingFrontendRouteId(0);
    }
  };

  const openCreateRoleModal = () => {
    roleForm.resetFields();
    setRoleModalOpen(true);
  };

  const openCreateUserModal = () => {
    userForm.resetFields();
    setUserModalOpen(true);
  };

  const openAssignRoleModal = (user: RbacUser) => {
    setEditingUser(user);
    assignRoleForm.setFieldsValue({ role_ids: user.role_ids });
    setRoleAssignModalOpen(true);
  };

  const openPasswordModal = (user: RbacUser) => {
    setEditingUser(user);
    passwordForm.resetFields();
    setPasswordModalOpen(true);
  };

  const openCreateRouteModal = () => {
    setRouteModalMode("create");
    setEditingRoute(null);
    routeForm.resetFields();
    routeForm.setFieldsValue({ status: true });
    setRouteModalOpen(true);
  };

  const openEditRouteModal = (route: FrontendRouteItem) => {
    setRouteModalMode("edit");
    setEditingRoute(route);
    routeForm.setFieldsValue({ ...route, status: route.status === 1 });
    setRouteModalOpen(true);
  };

  const submitCreateRole = async () => {
    const values = await roleForm.validateFields();
    try {
      await createRole(values);
      messageApi.success("角色创建成功");
      setRoleModalOpen(false);
      await loadRoles();
    } catch (error: any) {
      messageApi.error(error?.message || "角色创建失败");
    }
  };

  const submitCreateUser = async () => {
    const values = await userForm.validateFields();
    try {
      await createUser(values);
      messageApi.success("用户创建成功");
      setUserModalOpen(false);
      await loadUsers();
    } catch (error: any) {
      messageApi.error(error?.message || "用户创建失败");
    }
  };

  const submitAssignRoles = async () => {
    if (!editingUser) return;
    const values = await assignRoleForm.validateFields();
    try {
      await updateUserRoles({
        user_id: editingUser.user_id,
        role_ids: values.role_ids || [],
      });
      messageApi.success("用户角色已更新");
      setRoleAssignModalOpen(false);
      await loadUsers();
    } catch (error: any) {
      messageApi.error(error?.message || "更新用户角色失败");
    }
  };

  const submitPassword = async () => {
    if (!editingUser) return;
    const values = await passwordForm.validateFields();
    try {
      await updateUserPassword(editingUser.user_id, values.password);
      messageApi.success("密码已更新");
      setPasswordModalOpen(false);
    } catch (error: any) {
      messageApi.error(error?.message || "更新密码失败");
    }
  };

  const submitRoute = async () => {
    const values = await routeForm.validateFields();
    const payload = {
      ...values,
      status: values.status ? 1 : 0,
    };
    try {
      if (routeModalMode === "create") {
        await createFrontendRoute(payload);
        messageApi.success("前端路由创建成功");
      } else if (editingRoute) {
        await updateFrontendRoute(editingRoute.id, payload);
        messageApi.success("前端路由更新成功");
      }
      setRouteModalOpen(false);
      await loadFrontendRoutes();
      if (selectedRoleId) {
        await loadRoleDetail(selectedRoleId);
      }
    } catch (error: any) {
      messageApi.error(error?.message || "保存前端路由失败");
    }
  };

  const roleColumns: ColumnsType<RbacRole> = [
    {
      title: "角色",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <Space align="center" size={8} wrap>
            <Text strong>{record.name}</Text>
            <Tag
              color={record.status === 1 ? "green" : "default"}
              bordered={false}
              style={{ marginInlineEnd: 0 }}
            >
              {record.status === 1 ? "启用" : "禁用"}
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.id}
          </Text>
          <Text
            type="secondary"
            style={{
              fontSize: 12,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {record.description || "暂无描述"}
          </Text>
          <Space size={[6, 6]} wrap>
            <Tag color="orange" bordered={false} style={{ marginInlineEnd: 0 }}>
              接口 {record.api_count || 0}
            </Tag>
            <Tag color="cyan" bordered={false} style={{ marginInlineEnd: 0 }}>
              业务 {record.business_module_count || 0}
            </Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: "接口",
      dataIndex: "api_count",
      key: "api_count",
      width: 78,
      align: "center",
      render: (value) => <Text strong>{value || 0}</Text>,
    },
    ...(isSuperAdmin
      ? [
          {
            title: "操作",
            key: "action",
            width: 100,
            render: (_: unknown, record: RbacRole) =>
              record.id === "role-super-admin" ? null : (
                <Popconfirm
                  title="删除角色"
                  description={`确认删除角色 ${record.name} 吗？`}
                  onConfirm={async () => {
                    try {
                      await deleteRole(record.id);
                      messageApi.success("角色已删除");
                      await loadRoles();
                    } catch (error: any) {
                      messageApi.error(error?.message || "删除角色失败");
                    }
                  }}
                >
                  <Button type="link" danger size="small">
                    删除
                  </Button>
                </Popconfirm>
              ),
          },
        ]
      : []),
  ];

  const userColumns: ColumnsType<RbacUser> = [
    {
      title: "用户",
      dataIndex: "username",
      key: "username",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.username}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.user_id}
          </Text>
        </Space>
      ),
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      key: "nickname",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      render: (value) => value || "-",
    },
    {
      title: "角色",
      dataIndex: "role_names",
      key: "role_names",
      render: (value: string[]) =>
        value?.length ? (
          <Space wrap>
            {value.map((roleName) => (
              <Tag key={roleName}>{roleName}</Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">未分配</Text>
        ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (value) => <Tag color={value === 1 ? "green" : "default"}>{value === 1 ? "启用" : "禁用"}</Tag>,
    },
    {
      title: "操作",
      key: "action",
      width: 220,
      render: (_: unknown, record: RbacUser) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openAssignRoleModal(record)}>
            分配角色
          </Button>
          <Button type="link" size="small" onClick={() => openPasswordModal(record)}>
            改密码
          </Button>
          <Popconfirm
            title="删除用户"
            description={`确认删除用户 ${record.username} 吗？`}
            onConfirm={async () => {
              try {
                await deleteUser(record.user_id);
                messageApi.success("用户已删除");
                await loadUsers();
              } catch (error: any) {
                messageApi.error(error?.message || "删除用户失败");
              }
            }}
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const apiPermissionColumns: ColumnsType<any> = [
    {
      title: "模块",
      dataIndex: "route_name",
      key: "route_name",
      width: 160,
    },
    {
      title: "接口名",
      dataIndex: "name",
      key: "name",
      width: 180,
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      width: 90,
      render: (value) => <Tag color={value === "GET" ? "blue" : "orange"}>{value}</Tag>,
    },
    {
      title: "路径",
      dataIndex: "path_pattern",
      key: "path_pattern",
    },
    {
      title: "启用",
      dataIndex: "enabled",
      key: "enabled",
      width: 110,
      render: (value, record) => (
        <Switch
          checked={value === 1}
          disabled={!isSuperAdmin}
          loading={savingApiSlug === record.api_slug}
          onChange={(checked) => void handleApiToggle(record.api_slug, checked)}
        />
      ),
    },
  ];

  const roleFrontendRouteColumns: ColumnsType<FrontendRoutePermission> = [
    {
      title: "前端路由",
      dataIndex: "path",
      key: "path",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.path}
          </Text>
        </Space>
      ),
    },
    {
      title: "说明",
      dataIndex: "description",
      key: "description",
      render: (value) => value || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (value) => <Tag color={value === 1 ? "green" : "default"}>{value === 1 ? "启用" : "禁用"}</Tag>,
    },
    {
      title: "可访问",
      dataIndex: "enabled",
      key: "enabled",
      width: 110,
      render: (value, record) => (
        <Switch
          checked={value === 1}
          disabled={!isSuperAdmin}
          loading={savingFrontendRouteId === record.id}
          onChange={(checked) => void handleFrontendRouteToggle(record.id, checked)}
        />
      ),
    },
  ];

  const frontendRouteColumns: ColumnsType<FrontendRouteItem> = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.path}
          </Text>
        </Space>
      ),
    },
    {
      title: "说明",
      dataIndex: "description",
      key: "description",
      render: (value) => value || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (value) => <Tag color={value === 1 ? "green" : "default"}>{value === 1 ? "启用" : "禁用"}</Tag>,
    },
    {
      title: "操作",
      key: "action",
      width: 160,
      render: (_: unknown, record: FrontendRouteItem) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => openEditRouteModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="删除前端路由"
            description={`确认删除路由 ${record.path} 吗？`}
            onConfirm={async () => {
              try {
                await deleteFrontendRoute(record.id);
                messageApi.success("前端路由已删除");
                await loadFrontendRoutes();
                if (selectedRoleId) {
                  await loadRoleDetail(selectedRoleId);
                }
              } catch (error: any) {
                messageApi.error(error?.message || "删除前端路由失败");
              }
            }}
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Card bordered={false} styles={{ body: { padding: 20 } }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarStyle={{ marginBottom: 20 }}
            tabBarExtraContent={
              <Button icon={<ReloadOutlined />} onClick={() => void refreshCurrentTab()}>
                刷新
              </Button>
            }
            items={[
              {
                key: "roles",
                label: (
                  <Space size={8}>
                    <SafetyCertificateOutlined />
                    <span>角色权限</span>
                    <Badge count={roles.length} color="#1677ff" />
                  </Space>
                ),
                children: (
                  <Row gutter={[16, 16]} align="stretch">
                    <Col xs={24} xl={8} style={{ display: "flex" }}>
                      <Card
                        bordered={false}
                        style={{ width: "100%" }}
                        styles={{ body: { paddingTop: 8, height: "100%" } }}
                      >
                        <Row
                          justify="space-between"
                          align="middle"
                          gutter={[12, 12]}
                          style={{ marginBottom: 16 }}
                        >
                          <Col xs={24} md={12} lg={13}>
                            <Input.Search
                              allowClear
                              placeholder="搜索角色名、角色ID或描述"
                              value={roleSearchKeyword}
                              onChange={(event) => setRoleSearchKeyword(event.target.value)}
                            />
                          </Col>
                          <Col>
                            <Space size={8} wrap>
                              {isSuperAdmin ? (
                                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateRoleModal}>
                                  新建角色
                                </Button>
                              ) : (
                                <Tag color="default" bordered={false} style={{ marginInlineEnd: 0 }}>
                                  只读
                                </Tag>
                              )}
                            </Space>
                          </Col>
                        </Row>
                        <Table<RbacRole>
                          loading={loadingRoles}
                          columns={roleColumns}
                          dataSource={filteredRoles}
                          pagination={false}
                          rowKey="id"
                          rowSelection={{
                            type: "radio",
                            selectedRowKeys: selectedRoleId ? [selectedRoleId] : [],
                            onChange: (selectedRowKeys) =>
                              setSelectedRoleId(String(selectedRowKeys[0] || "")),
                          }}
                          onRow={(record) => ({
                            onClick: () => setSelectedRoleId(record.id),
                            style: {
                              cursor: "pointer",
                              background:
                                record.id === selectedRoleId ? "rgba(22, 119, 255, 0.06)" : undefined,
                            },
                          })}
                          scroll={{ y: 560 }}
                          locale={{ emptyText: "暂无角色数据" }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} xl={16} style={{ display: "flex" }}>
                      <Card
                        bordered={false}
                        style={{ width: "100%" }}
                        styles={{ body: { paddingTop: 8, height: "100%" } }}
                      >
                        <Tabs
                          defaultActiveKey="api-permissions"
                          items={[
                            {
                              key: "api-permissions",
                              label: (
                                <Space size={8}>
                                  <span>接口权限</span>
                                  <Badge
                                    count={flattenedApiPermissions.length}
                                    style={{ backgroundColor: "#fa8c16" }}
                                  />
                                </Space>
                              ),
                              children: (
                                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                  <Row justify="space-between" align="middle" gutter={[12, 12]}>
                                    <Col xs={24} md={14}>
                                      <Text type="secondary">
                                        按业务模块聚合后的接口权限，适合逐项开关和排查权限缺口。
                                      </Text>
                                    </Col>
                                    <Col>
                                      <Space size={8} wrap>
                                        <Select<PermissionStatusFilter>
                                          value={apiPermissionStatusFilter}
                                          onChange={setApiPermissionStatusFilter}
                                          style={{ width: 120 }}
                                          options={[
                                            { label: "全部", value: "all" },
                                            { label: "启用", value: "enabled" },
                                            { label: "关闭", value: "disabled" },
                                          ]}
                                        />
                                        <Tag color="orange" bordered={false} style={{ marginInlineEnd: 0 }}>
                                          {filteredApiPermissions.length} / {flattenedApiPermissions.length}
                                        </Tag>
                                      </Space>
                                    </Col>
                                  </Row>
                                  <Table
                                    loading={loadingRoleDetail}
                                    columns={apiPermissionColumns}
                                    dataSource={filteredApiPermissions}
                                    rowKey="api_slug"
                                    pagination={{
                                      pageSize: 8,
                                      hideOnSinglePage: true,
                                      showSizeChanger: false,
                                    }}
                                    scroll={{ x: 960 }}
                                  />
                                </Space>
                              ),
                            },
                            {
                              key: "frontend-route-permissions",
                              label: (
                                <Space size={8}>
                                  <span>前端路由权限</span>
                                  <Badge
                                    count={roleFrontendRoutes.length}
                                    style={{ backgroundColor: "#722ed1" }}
                                  />
                                </Space>
                              ),
                              children: (
                                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                  <Row justify="space-between" align="middle" gutter={[12, 12]}>
                                    <Col xs={24} md={14}>
                                      <Text type="secondary">
                                        这里控制页面级访问权限，和路由资源表保持一一对应。
                                      </Text>
                                    </Col>
                                    <Col>
                                      <Space size={8} wrap>
                                        <Select<PermissionStatusFilter>
                                          value={frontendRouteStatusFilter}
                                          onChange={setFrontendRouteStatusFilter}
                                          style={{ width: 120 }}
                                          options={[
                                            { label: "全部", value: "all" },
                                            { label: "启用", value: "enabled" },
                                            { label: "关闭", value: "disabled" },
                                          ]}
                                        />
                                        <Tag color="purple" bordered={false} style={{ marginInlineEnd: 0 }}>
                                          {filteredRoleFrontendRoutes.length} / {roleFrontendRoutes.length}
                                        </Tag>
                                      </Space>
                                    </Col>
                                  </Row>
                                  <Table
                                    loading={loadingRoleDetail}
                                    columns={roleFrontendRouteColumns}
                                    dataSource={filteredRoleFrontendRoutes}
                                    rowKey="id"
                                    pagination={{
                                      pageSize: 8,
                                      hideOnSinglePage: true,
                                      showSizeChanger: false,
                                    }}
                                    scroll={{ x: 900 }}
                                  />
                                </Space>
                              ),
                            },
                          ]}
                        />
                      </Card>
                    </Col>
                  </Row>
                ),
              },
              {
                key: "users",
                label: (
                  <Space size={8}>
                    <UserOutlined />
                    <span>用户角色</span>
                    {isSuperAdmin ? <Badge count={users.length} color="#52c41a" /> : null}
                  </Space>
                ),
                children: isSuperAdmin ? (
                  <Card
                    bordered={false}
                    title={
                      <Space direction="vertical" size={2}>
                        <Text strong style={{ fontSize: 16 }}>
                          用户与角色绑定
                        </Text>
                        <Text type="secondary">
                          把后台用户和角色关系维护在一起，权限调整后更容易核对影响范围。
                        </Text>
                      </Space>
                    }
                    extra={
                      <Button type="primary" icon={<PlusOutlined />} onClick={openCreateUserModal}>
                        新建用户
                      </Button>
                    }
                  >
                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                      <Col xs={24} sm={8}>
                        <Card
                          bordered={false}
                          styles={{
                            body: { padding: 16, background: "rgba(22,119,255,0.06)", borderRadius: 16 },
                          }}
                        >
                          <Statistic
                            title="用户总数"
                            value={users.length}
                            valueStyle={{ color: "#1677ff" }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card
                          bordered={false}
                          styles={{
                            body: { padding: 16, background: "rgba(82,196,26,0.06)", borderRadius: 16 },
                          }}
                        >
                          <Statistic
                            title="启用用户"
                            value={users.filter((item) => item.status === 1).length}
                            valueStyle={{ color: "#52c41a" }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card
                          bordered={false}
                          styles={{
                            body: { padding: 16, background: "rgba(114,46,209,0.06)", borderRadius: 16 },
                          }}
                        >
                          <Statistic
                            title="已分配角色用户"
                            value={users.filter((item) => item.role_ids?.length).length}
                            valueStyle={{ color: "#722ed1" }}
                          />
                        </Card>
                      </Col>
                    </Row>
                    <Row
                      justify="space-between"
                      align="middle"
                      gutter={[12, 12]}
                      style={{ marginBottom: 16 }}
                    >
                      <Col xs={24} md={14} lg={12}>
                        <Input.Search
                          allowClear
                          placeholder="搜索用户名、用户ID、昵称、邮箱或角色名"
                          value={userSearchKeyword}
                          onChange={(event) => setUserSearchKeyword(event.target.value)}
                        />
                      </Col>
                      <Col>
                        <Tag color="blue" bordered={false} style={{ marginInlineEnd: 0 }}>
                          {filteredUsers.length} / {users.length} 条
                        </Tag>
                      </Col>
                    </Row>
                    <Divider style={{ marginTop: 0 }} />
                    <Table<RbacUser>
                      loading={loadingUsers}
                      columns={userColumns}
                      dataSource={filteredUsers}
                      rowKey="user_id"
                      pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
                      scroll={{ x: 960 }}
                    />
                  </Card>
                ) : (
                  <Card bordered={false}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="仅超级管理员可管理用户角色" />
                  </Card>
                ),
              },
              {
                key: "routes",
                label: (
                  <Space size={8}>
                    <PartitionOutlined />
                    <span>前端路由</span>
                    {isSuperAdmin ? <Badge count={frontendRoutes.length} color="#722ed1" /> : null}
                  </Space>
                ),
                children: isSuperAdmin ? (
                  <Card
                    bordered={false}
                    title={
                      <Space direction="vertical" size={2}>
                        <Text strong style={{ fontSize: 16 }}>
                          前端路由资源
                        </Text>
                        <Text type="secondary">
                          维护可分配给角色的页面路径，角色页里再决定具体哪些角色可访问。
                        </Text>
                      </Space>
                    }
                    extra={
                      <Button type="primary" icon={<PlusOutlined />} onClick={openCreateRouteModal}>
                        新建前端路由
                      </Button>
                    }
                  >
                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                      <Col xs={24} sm={8}>
                        <Card
                          bordered={false}
                          styles={{
                            body: { padding: 16, background: "rgba(114,46,209,0.06)", borderRadius: 16 },
                          }}
                        >
                          <Statistic
                            title="路由总数"
                            value={frontendRoutes.length}
                            valueStyle={{ color: "#722ed1" }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card
                          bordered={false}
                          styles={{
                            body: { padding: 16, background: "rgba(82,196,26,0.06)", borderRadius: 16 },
                          }}
                        >
                          <Statistic
                            title="启用路由"
                            value={frontendRoutes.filter((item) => item.status === 1).length}
                            valueStyle={{ color: "#52c41a" }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card
                          bordered={false}
                          styles={{
                            body: { padding: 16, background: "rgba(250,140,22,0.06)", borderRadius: 16 },
                          }}
                        >
                          <Statistic
                            title="带说明路由"
                            value={frontendRoutes.filter((item) => item.description).length}
                            valueStyle={{ color: "#fa8c16" }}
                          />
                        </Card>
                      </Col>
                    </Row>
                    <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                      创建或编辑路由后，可以回到“角色权限”页快速核对某个角色的页面访问范围。
                    </Paragraph>
                    <Table<FrontendRouteItem>
                      loading={loadingRoutes}
                      columns={frontendRouteColumns}
                      dataSource={frontendRoutes}
                      rowKey="id"
                      pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
                      scroll={{ x: 960 }}
                    />
                  </Card>
                ) : (
                  <Card bordered={false}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="仅超级管理员可管理前端路由" />
                  </Card>
                ),
              },
            ]}
          />
        </Card>
      </Space>

      <Modal
        open={roleModalOpen}
        title="新建角色"
        onCancel={() => setRoleModalOpen(false)}
        onOk={() => void submitCreateRole()}
        destroyOnHidden
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item label="角色ID" name="role_id" extra="可选。为空时由后端自动生成。">
            <Input placeholder="例如：role-audit-admin" />
          </Form.Item>
          <Form.Item label="角色名称" name="name" rules={[{ required: true, message: "请输入角色名称" }]}>
            <Input placeholder="例如：审计管理员" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="描述该角色的使用范围" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={userModalOpen}
        title="新建用户"
        onCancel={() => setUserModalOpen(false)}
        onOk={() => void submitCreateUser()}
        destroyOnHidden
      >
        <Form form={userForm} layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input placeholder="例如：admin_ops" />
          </Form.Item>
          <Form.Item label="昵称" name="nickname">
            <Input placeholder="例如：运维管理员" />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input placeholder="例如：admin@example.com" />
          </Form.Item>
          <Form.Item
            label="初始密码"
            name="password"
            rules={[
              { required: true, message: "请输入初始密码" },
              { min: 8, message: "密码至少 8 位" },
            ]}
            extra="后端会校验密码强度，建议使用字母和数字组合。"
          >
            <Input.Password placeholder="请输入初始密码" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={roleAssignModalOpen}
        title={editingUser ? `分配角色: ${editingUser.username}` : "分配角色"}
        onCancel={() => setRoleAssignModalOpen(false)}
        onOk={() => void submitAssignRoles()}
        destroyOnHidden
      >
        <Form form={assignRoleForm} layout="vertical">
          <Form.Item label="角色列表" name="role_ids">
            <Checkbox.Group options={roleOptions} style={{ display: "grid", gap: 8 }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={passwordModalOpen}
        title={editingUser ? `修改密码: ${editingUser.username}` : "修改密码"}
        onCancel={() => setPasswordModalOpen(false)}
        onOk={() => void submitPassword()}
        destroyOnHidden
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="新密码"
            name="password"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 8, message: "密码至少 8 位" },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={routeModalOpen}
        title={routeModalMode === "create" ? "新建前端路由" : "编辑前端路由"}
        onCancel={() => setRouteModalOpen(false)}
        onOk={() => void submitRoute()}
        destroyOnHidden
      >
        <Form form={routeForm} layout="vertical">
          <Form.Item label="路由路径" name="path" rules={[{ required: true, message: "请输入路由路径" }]}>
            <Input placeholder="例如：/rbac-center" />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: "请输入名称" }]}>
            <Input placeholder="例如：权限管理" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="描述这个前端页面的用途" />
          </Form.Item>
          <Form.Item label="状态" name="status" valuePropName="checked" initialValue={true}>
            <Checkbox>启用该前端路由</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
