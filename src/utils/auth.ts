// utils/auth.ts
import Cookies from "js-cookie";
import { COOKIE_DOMAIN } from "@/constants/common.ts";

export const checkLogin = () => {
  const userId = localStorage.getItem("user_id");

  if (!userId && window.location.pathname != "/login") {
    localStorage.clear();
    sessionStorage.clear();
    Cookies.remove("access_token", { domain: COOKIE_DOMAIN, path: "/" });
    Cookies.remove("refresh_token", { domain: COOKIE_DOMAIN, path: "/" });
    window.location.href = "/login";
  }
};
