// utils/auth.ts
import Cookies from "js-cookie";
import { clearLoginSessionStorage } from "./account-preferences";
import { getCookieDomain } from "@/constants/common.ts";

export const checkLogin = () => {
  const userId = localStorage.getItem("user_id");

  if (!userId && window.location.pathname != "/login") {
    clearLoginSessionStorage();
    const domain = getCookieDomain();
    Cookies.remove("access_token", { domain, path: "/" });
    Cookies.remove("refresh_token", { domain, path: "/" });
    window.location.href = "/login";
  }
};
