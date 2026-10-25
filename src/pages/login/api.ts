import { useState } from "react";
import Cookies from "js-cookie";
import { LoginField } from "./type.ts";
import { getCookieDomain } from "@/constants/common.ts";

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
  const domain = getCookieDomain();
  Cookies.remove("access_token", { domain, path: "/" });
  Cookies.remove("refresh_token", { domain, path: "/" });
  return await fetchPost("/passport/logout", data);
}
