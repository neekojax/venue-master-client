import { createContext, useContext } from "react";
import type { AuthzDomain, AuthzOptions, AuthzPermission, AuthzRoleTemplate } from "./api";

export interface AuthzPageContextValue {
  canManage: boolean;
  options: AuthzOptions;
  domains: AuthzDomain[];
  roles: AuthzRoleTemplate[];
  permissions: AuthzPermission[];
  publishSuccess: (version?: number) => void;
  refreshMetadata: () => Promise<void>;
}

export const defaultOptions: AuthzOptions = {
  principal_types: ["user", "service"],
  risk_levels: ["low", "medium", "high", "critical"],
  public_modes: ["protected", "public", "hmac_read", "hmac_write"],
  requirement_types: ["any", "all", "authenticated"],
  domain_resolvers: [],
  statuses: [0, 1],
};

const AuthzPageContext = createContext<AuthzPageContextValue | null>(null);

export const AuthzPageProvider = AuthzPageContext.Provider;

export function useAuthzPage() {
  const value = useContext(AuthzPageContext);
  if (!value) throw new Error("useAuthzPage must be used inside AuthzPageProvider");
  return value;
}
