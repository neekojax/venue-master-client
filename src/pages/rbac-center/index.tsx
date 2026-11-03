import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ApiOutlined,
  BranchesOutlined,
  ProfileOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Alert, Card, message, Result, Spin, Tabs } from "antd";
import {
  type AuthzDomain,
  type AuthzOptions,
  type AuthzPermission,
  type AuthzRoleTemplate,
  fetchAuthorization,
  fetchAuthzDomains,
  fetchAuthzOptions,
  fetchPermissions,
  fetchRoleTemplates,
} from "./api";
import { AuthzPageProvider, defaultOptions } from "./context";
import EndpointsTab from "./endpoints-tab";
import OverviewTab from "./overview-tab";
import PermissionsTab from "./permissions-tab";
import PrincipalsTab from "./principals-tab";
import RolesTab from "./roles-tab";
import RoutesTab from "./routes-tab";

import "./index.css";

export default function RbacCenterPage() {
  const [searchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [options, setOptions] = useState<AuthzOptions>(defaultOptions);
  const [domains, setDomains] = useState<AuthzDomain[]>([]);
  const [roles, setRoles] = useState<AuthzRoleTemplate[]>([]);
  const [permissions, setPermissions] = useState<AuthzPermission[]>([]);

  const refreshMetadata = useCallback(async () => {
    const [optionData, domainData, roleData, permissionData] = await Promise.all([
      fetchAuthzOptions(),
      fetchAuthzDomains(),
      fetchRoleTemplates({ page: 1, page_size: 200, status: 1 }),
      fetchPermissions({ page: 1, page_size: 200, status: 1 }),
    ]);
    setOptions(optionData || defaultOptions);
    setDomains(domainData || []);
    setRoles(roleData.list || []);
    setPermissions(permissionData.list || []);
  }, []);

  const initialize = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await fetchAuthorization();
      const permissionKeys = snapshot.permissions || [];
      const readable = permissionKeys.includes("authz:read") || permissionKeys.includes("system:all");
      setCanRead(readable);
      setCanManage(permissionKeys.includes("authz:manage") || permissionKeys.includes("system:all"));
      if (readable) await refreshMetadata();
    } catch (error: any) {
      messageApi.error(error.message || "加载权限管理信息失败");
    } finally {
      setLoading(false);
    }
  }, [messageApi, refreshMetadata]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const publishSuccess = useCallback(() => {
    messageApi.success("权限配置已保存，最多约 30 秒生效");
  }, [messageApi]);

  const contextValue = useMemo(
    () => ({
      canManage,
      options,
      domains,
      roles,
      permissions,
      publishSuccess,
      refreshMetadata,
    }),
    [canManage, domains, options, permissions, publishSuccess, refreshMetadata, roles],
  );

  if (loading) {
    return (
      <div style={{ minHeight: 420, display: "grid", placeItems: "center" }}>
        {contextHolder}
        <Spin size="large" tip="加载权限配置..." />
      </div>
    );
  }

  if (!canRead) {
    return (
      <>
        {contextHolder}
        <Result
          status="403"
          title="无权访问权限管理"
          subTitle="当前账号缺少 authz:read 权限，请联系系统管理员。"
        />
      </>
    );
  }

  const items = [
    {
      key: "principals",
      label: (
        <span>
          <UserSwitchOutlined />
          用户授权
        </span>
      ),
      children: <PrincipalsTab />,
    },
    {
      key: "roles",
      label: (
        <span>
          <TeamOutlined />
          角色模板
        </span>
      ),
      children: <RolesTab />,
    },
    {
      key: "permissions",
      label: (
        <span>
          <SafetyCertificateOutlined />
          权限定义
        </span>
      ),
      children: <PermissionsTab />,
    },
    {
      key: "endpoints",
      label: (
        <span>
          <ApiOutlined />
          API 映射
        </span>
      ),
      children: <EndpointsTab />,
    },
    {
      key: "routes",
      label: (
        <span>
          <BranchesOutlined />
          前端页面
        </span>
      ),
      children: <RoutesTab />,
    },
    {
      key: "overview",
      label: (
        <span>
          <ProfileOutlined />
          权限总览
        </span>
      ),
      children: <OverviewTab />,
    },
  ];
  const activeKey = items.some((item) => item.key === searchParams.get("tab"))
    ? searchParams.get("tab")!
    : "principals";

  return (
    <AuthzPageProvider value={contextValue}>
      {contextHolder}
      <div className="authz-page">
        {!canManage && (
          <Alert
            showIcon
            type="info"
            message="当前为只读模式"
            description="你拥有 authz:read，但没有 authz:manage；新增、编辑、禁用和授权操作已隐藏。"
          />
        )}
        <Card className="authz-main-card">
          <Tabs
            activeKey={activeKey}
            items={items}
            renderTabBar={() => <></>}
            destroyInactiveTabPane={false}
          />
        </Card>
      </div>
    </AuthzPageProvider>
  );
}
