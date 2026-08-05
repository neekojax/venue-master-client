import { fetchDelete, fetchGet, fetchPost, fetchPut } from "@/helper/fetchHelper";

export interface RbacRole {
  id: string;
  name: string;
  description: string;
  status: number;
  business_modules?: Array<{ slug: string; name: string }>;
  api_modules?: Array<{ slug?: string; name: string; api_count: number }>;
  business_module_count?: number;
  api_count?: number;
}

export interface RbacUser {
  user_id: string;
  username: string;
  nickname: string;
  email: string;
  status: number;
  is_root?: number;
  role_ids: string[];
  role_names: string[];
}

export interface RbacBusinessPermission {
  parent_slug: string;
  name: string;
  enabled: number;
}

export interface RbacApiPermission {
  api_slug: string;
  name: string;
  method: string;
  path_pattern: string;
  enabled: number;
}

export interface RbacApiRouteGroup {
  route: string;
  name: string;
  apis: RbacApiPermission[];
}

export interface RbacRolePermissions {
  role_id: string;
  business_permissions: RbacBusinessPermission[];
  routes: RbacApiRouteGroup[];
}

export interface FrontendRoutePermission {
  id: number;
  path: string;
  name: string;
  description: string;
  status: number;
  enabled: number;
}

export interface FrontendRouteItem {
  id: number;
  path: string;
  name: string;
  description: string;
  status: number;
}

export const fetchRbacRoles = async () => {
  return await fetchGet("/rbac/roles");
};

export const fetchRbacUsers = async () => {
  return await fetchGet("/rbac/users");
};

export const fetchRolePermissions = async (roleId: string) => {
  return await fetchGet(`/rbac/role/${roleId}/permissions`);
};

export const updateRoleApiPermission = async (roleId: string, apiSlug: string, enabled: number) => {
  return await fetchPut(`/rbac/role/${roleId}/api-permission`, {
    api_slug: apiSlug,
    enabled,
  });
};

export const fetchRoleFrontendRoutes = async (roleId: string) => {
  return await fetchGet(`/rbac/role/${roleId}/frontend-routes`);
};

export const updateRoleFrontendRoutePermission = async (
  roleId: string,
  frontendRouteId: number,
  enabled: number,
) => {
  return await fetchPut(`/rbac/role/${roleId}/frontend-route-permission`, {
    frontend_route_id: frontendRouteId,
    enabled,
  });
};

export const createRole = async (payload: { role_id?: string; name: string; description?: string }) => {
  return await fetchPost("/rbac/roles", payload);
};

export const deleteRole = async (roleId: string) => {
  return await fetchDelete(`/rbac/roles/${roleId}`);
};

export const updateUserRoles = async (payload: { user_id: string; role_ids: string[] }) => {
  return await fetchPut("/rbac/user-roles", payload);
};

export const createUser = async (payload: {
  username: string;
  nickname?: string;
  email?: string;
  password: string;
}) => {
  return await fetchPost("/rbac/users", payload);
};

export const deleteUser = async (userId: string) => {
  return await fetchDelete(`/rbac/users/${userId}`);
};

export const updateUserPassword = async (userId: string, password: string) => {
  return await fetchPut(`/rbac/users/${userId}/password`, { password });
};

export const fetchFrontendRoutesWithStatus = async () => {
  return await fetchGet("/rbac/frontend-routes/all");
};

export const createFrontendRoute = async (payload: {
  path: string;
  name: string;
  description?: string;
  status?: number;
}) => {
  return await fetchPost("/rbac/frontend-routes", payload);
};

export const updateFrontendRoute = async (
  routeId: number,
  payload: { path: string; name: string; description?: string; status?: number },
) => {
  return await fetchPut(`/rbac/frontend-routes/${routeId}`, payload);
};

export const deleteFrontendRoute = async (routeId: number) => {
  return await fetchDelete(`/rbac/frontend-routes/${routeId}`);
};

export const deleteRoleFrontendRoute = async (roleId: string, frontendRouteId: number) => {
  return await fetchDelete(`/rbac/role/${roleId}/frontend-route`, {
    frontend_route_id: frontendRouteId,
  });
};
