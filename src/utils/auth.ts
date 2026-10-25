// utils/auth.ts
import Cookies from "js-cookie";
import { getCookieDomain } from "@/constants/common.ts";

export const checkLogin = () => {
  const userId = localStorage.getItem("user_id");

  if (!userId && window.location.pathname != "/login") {
    localStorage.clear();
    sessionStorage.clear();
    const domain = getCookieDomain();
    Cookies.remove("access_token", { domain, path: "/" });
    Cookies.remove("refresh_token", { domain, path: "/" });
    window.location.href = "/login";
  }
};
