import { fetchDelete, fetchGet, fetchPost, fetchPut } from "@/helper/fetchHelper";

export type BinaryStatus = 0 | 1;
export type PrincipalType = "user" | "service";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type PublicMode = "protected" | "public" | "hmac_read" | "hmac_write";
export type RequirementType = "any" | "all" | "authenticated";

export interface AuthzPermission {
  id: number;
  permission_key: string;
  resource: string;
  action: string;
  name: string;
  description: string;
  risk_level: RiskLevel;
  status: BinaryStatus;
  add_time: string;
  update_time: string;
}

export interface AuthzRoleTemplate {
  id: string;
  name: string;
  description: string;
  builtin: BinaryStatus;
  frontend_configured?: BinaryStatus;
  status: BinaryStatus;
  add_time: string;
  update_time: string;
}

export interface AuthzAssignment {
  id: number;
  principal_type: PrincipalType;
  principal_id: string;
  role_template_id: string;
  domain: string;
  enabled: BinaryStatus;
  add_time: string;
  update_time: string;
}

export interface AuthzPrincipal {
  principal_type: PrincipalType;
  principal_id: string;
  name: string;
  nickname: string;
  email: string;
  status: BinaryStatus;
  assignments: AuthzAssignment[];
}

export interface AuthzEndpoint {
  id: number;
  method: string;
  path_pattern: string;
  permission_key: string;
  domain_resolver: string;
  public_mode: PublicMode;
  status: BinaryStatus;
  add_time: string;
  update_time: string;
}

export interface FrontendRoute {
  id: number;
  path: string;
  name: string;
  description: string;
  navigation: string;
  parent_path: string;
  route_type: "navigation" | "page" | "detail";
  list_order: number;
  status: BinaryStatus;
}

export type FrontendRouteInput = Pick<FrontendRoute, "path" | "name" | "description" | "status">;

export interface FrontendRequirement {
  id: number;
  frontend_route_id: number;
  permission_key: string;
  requirement_type: RequirementType;
}

export interface RolePermissionOption extends AuthzPermission {
  granted: boolean;
}

export interface RoleFrontendRouteOption extends FrontendRoute {
  granted: boolean;
  configurable: boolean;
  requirements_satisfied: boolean;
  requirements: FrontendRequirement[];
}

export interface RoleAccessData {
  role: AuthzRoleTemplate;
  permissions: RolePermissionOption[];
  permission_keys: string[];
  frontend_routes: RoleFrontendRouteOption[];
  frontend_route_ids: number[];
  policy_version: number;
}

export interface ReplaceRoleAccessRequest {
  permission_keys: string[];
  frontend_route_ids: number[];
}

export interface AuthzOptions {
  principal_types: PrincipalType[];
  risk_levels: RiskLevel[];
  public_modes: PublicMode[];
  requirement_types: RequirementType[];
  domain_resolvers: string[];
  statuses: BinaryStatus[];
}

export interface AuthzDomain {
  code: string;
  name: string;
  wildcard: boolean;
}

export interface AuthorizationSnapshot {
  policy_version: number;
  assignments: AuthzAssignment[];
  permissions: string[];
  domains: Record<string, string[]>;
  frontend_routes: FrontendRoute[];
}

export interface PageData<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface RoleTemplatePage extends PageData<AuthzRoleTemplate> {
  permissions: Record<string, string[]>;
}

export interface FrontendRoutePage extends PageData<FrontendRoute> {
  requirements: FrontendRequirement[];
}

export interface PolicyResult {
  policy_version: number;
}

const unwrap = async <T>(request: Promise<any>): Promise<T> => {
  const response = await request;
  if (response?.success !== true || response?.code !== 0) {
    throw new Error(response?.message || "请求失败");
  }
  return response.data as T;
};

const encoded = (value: string | number) => encodeURIComponent(String(value));

export const fetchAuthorization = () => unwrap<AuthorizationSnapshot>(fetchGet("/profile/authorization"));
export const fetchAuthzOptions = () => unwrap<AuthzOptions>(fetchGet("/authz/options"));
export const fetchAuthzDomains = async () => {
  const data = await unwrap<{ list: AuthzDomain[]; wildcard?: AuthzDomain }>(fetchGet("/authz/domains"));
  return data.wildcard ? [...data.list, data.wildcard] : data.list;
};

export const fetchPrincipals = (params: Record<string, unknown>) =>
  unwrap<{ list: AuthzPrincipal[]; total: number }>(fetchGet("/authz/principals", params));
export const fetchPrincipalAuthorization = (type: PrincipalType, id: string) =>
  unwrap<AuthorizationSnapshot>(fetchGet(`/authz/principals/${type}/${encoded(id)}/authorization`));

export const createAssignment = (payload: {
  principal_type: PrincipalType;
  principal_id: string;
  role_template_id: string;
  domain: string;
}) => unwrap<PolicyResult>(fetchPost("/authz/assignments", payload));
export const updateAssignment = (
  id: number,
  payload: Pick<AuthzAssignment, "role_template_id" | "domain" | "enabled">,
) => unwrap<PolicyResult>(fetchPut(`/authz/assignments/${id}`, payload));
export const deleteAssignment = (id: number) => unwrap<PolicyResult>(fetchDelete(`/authz/assignments/${id}`));

export const fetchRoleTemplates = (params: Record<string, unknown>) =>
  unwrap<RoleTemplatePage>(fetchGet("/authz/role-templates", params));
export const createRoleTemplate = (payload: Pick<AuthzRoleTemplate, "id" | "name" | "description">) =>
  unwrap<PolicyResult>(fetchPost("/authz/role-templates", payload));
export const updateRoleTemplate = (
  id: string,
  payload: Pick<AuthzRoleTemplate, "name" | "description" | "status">,
) => unwrap<PolicyResult>(fetchPut(`/authz/role-templates/${encoded(id)}`, payload));
export const deleteRoleTemplate = (id: string) =>
  unwrap<PolicyResult>(fetchDelete(`/authz/role-templates/${encoded(id)}`));
export const replaceRolePermissions = (id: string, permissionKeys: string[]) =>
  unwrap<PolicyResult>(
    fetchPut(`/authz/role-templates/${encoded(id)}/permissions`, { permission_keys: permissionKeys }),
  );
export const fetchRoleAccess = (id: string) =>
  unwrap<RoleAccessData>(fetchGet(`/authz/role-templates/${encoded(id)}/access`));
export const replaceRoleAccess = (id: string, payload: ReplaceRoleAccessRequest) =>
  unwrap<PolicyResult>(fetchPut(`/authz/role-templates/${encoded(id)}/access`, payload));

export const fetchPermissions = (params: Record<string, unknown>) =>
  unwrap<PageData<AuthzPermission>>(fetchGet("/authz/permissions", params));
export const fetchPermission = (key: string) =>
  unwrap<AuthzPermission>(fetchGet(`/authz/permissions/${encoded(key)}`));
export const createPermission = (payload: Omit<AuthzPermission, "id" | "add_time" | "update_time">) =>
  unwrap<PolicyResult>(fetchPost("/authz/permissions", payload));
export const updatePermission = (
  key: string,
  payload: Omit<AuthzPermission, "id" | "add_time" | "update_time">,
) => unwrap<PolicyResult>(fetchPut(`/authz/permissions/${encoded(key)}`, payload));
export const deletePermission = (key: string) =>
  unwrap<PolicyResult>(fetchDelete(`/authz/permissions/${encoded(key)}`));

export const fetchEndpoints = (params: Record<string, unknown>) =>
  unwrap<PageData<AuthzEndpoint>>(fetchGet("/authz/endpoints", params));
export const createEndpoint = (payload: Omit<AuthzEndpoint, "id" | "add_time" | "update_time">) =>
  unwrap<PolicyResult>(fetchPost("/authz/endpoints", payload));
export const updateEndpoint = (id: number, payload: Omit<AuthzEndpoint, "id" | "add_time" | "update_time">) =>
  unwrap<PolicyResult>(fetchPut(`/authz/endpoints/${id}`, payload));
export const deleteEndpoint = (id: number) => unwrap<PolicyResult>(fetchDelete(`/authz/endpoints/${id}`));

export const fetchFrontendRoutes = (params: Record<string, unknown>) =>
  unwrap<FrontendRoutePage>(fetchGet("/authz/frontend-routes", params));
export const createFrontendRoute = (payload: FrontendRouteInput) =>
  unwrap<PolicyResult>(fetchPost("/authz/frontend-routes", payload));
export const updateFrontendRoute = (id: number, payload: FrontendRouteInput) =>
  unwrap<PolicyResult>(fetchPut(`/authz/frontend-routes/${id}`, payload));
export const deleteFrontendRoute = (id: number) =>
  unwrap<PolicyResult>(fetchDelete(`/authz/frontend-routes/${id}`));
export const replaceFrontendRequirements = (
  id: number,
  requirements: Array<Pick<FrontendRequirement, "permission_key" | "requirement_type">>,
) => unwrap<PolicyResult>(fetchPut(`/authz/frontend-routes/${id}/requirements`, { requirements }));

// 账号生命周期仍由旧账号管理接口负责；角色和组织授权不得使用这些接口。
export const createUser = (payload: {
  username: string;
  nickname?: string;
  email?: string;
  password: string;
}) => unwrap<unknown>(fetchPost("/rbac/users", payload));
export const deleteUser = (userId: string) => unwrap<unknown>(fetchDelete(`/rbac/users/${encoded(userId)}`));
export const updateUserPassword = (userId: string, password: string) =>
  unwrap<unknown>(fetchPut(`/rbac/users/${encoded(userId)}/password`, { password }));
