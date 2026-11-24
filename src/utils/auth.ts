// utils/auth.ts
import Cookies from "js-cookie";
import { clearLoginSessionStorage } from "./account-preferences";
import { COOKIE_DOMAIN } from "@/constants/common.ts";

export const checkLogin = () => {
  const userId = localStorage.getItem("user_id");

  if (!userId && window.location.pathname != "/login") {
    clearLoginSessionStorage();
    Cookies.remove("access_token", { domain: COOKIE_DOMAIN, path: "/" });
    Cookies.remove("refresh_token", { domain: COOKIE_DOMAIN, path: "/" });
    window.location.href = "/login";
  }
};
