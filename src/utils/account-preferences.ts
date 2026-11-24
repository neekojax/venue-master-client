const lastSitePrefix = "hashrate-comparison:last-site:";

export function getLoginAccountId() {
  try {
    return localStorage.getItem("user_id") ?? "";
  } catch {
    return "";
  }
}

export function comparisonSitePreferenceKey(accountId: string, organization: string) {
  if (!accountId || !organization) return "";
  return `${lastSitePrefix}${encodeURIComponent(accountId)}:${encodeURIComponent(organization)}`;
}

export function readComparisonSite(key: string) {
  try {
    return key ? (localStorage.getItem(key) ?? "") : "";
  } catch {
    return "";
  }
}

export function saveComparisonSite(key: string, siteCode: string) {
  if (!key) return;
  try {
    if (siteCode) localStorage.setItem(key, siteCode);
    else localStorage.removeItem(key);
  } catch {
    // 存储不可用时，本次页面内仍可切换场地。
  }
}

export function clearLoginSessionStorage() {
  // 仅保留按账号和组织隔离的场地偏好，登录和权限数据沿用原有清理行为。
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith(lastSitePrefix)) localStorage.removeItem(key);
  }
  sessionStorage.clear();
}
