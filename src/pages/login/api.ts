import { useState } from "react";
import Cookies from "js-cookie";
import { LoginField } from "./type.ts";
import { COOKIE_DOMAIN } from "@/constants/common.ts";

import { fetchGet, fetchPost } from "@/helper/fetchHelper.ts";

export function useLogin() {
  const [isPending, setIsPending] = useState(false); // 请求状态

  // const mutate = async (data: LoginField) => {
  //   setIsPending(true);
  //
  //   const response = login(data);
  //
  //   setIsPending(false);
  //
  //   return response;
  // };

  const mutate = async (data: LoginField) => {
    setIsPending(true);
    try {
      const response = await login(data); // 确保等待响应
      return response; // 返回服务器响应
    } finally {
      setIsPending(false); // 无论如何都要重置状态
    }
  };

  return {
    mutate,
    isPending,
  };
}

export async function fetchCaptcha() {
  return await fetchGet("passport/captcha");
}

export async function login(data: LoginField) {
  return await fetchPost("passport/login", data);
}

export async function loginOut(data: any) {
  // 清除所有本地存储数据
  localStorage.clear();
  sessionStorage.clear();
  Cookies.remove("access_token", { domain: COOKIE_DOMAIN, path: "/" });
  Cookies.remove("refresh_token", { domain: COOKIE_DOMAIN, path: "/" });
  return await fetchPost("/passport/logout", data);
}
