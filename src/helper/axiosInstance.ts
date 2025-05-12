// axiosInstance.ts
import axios from "axios";
import eventBus from "@/components/event-bus";
import { ROUTE_PATHS } from "@/constants/common.ts";

// 存储当前的请求队列
let isRefreshing = false;
let subscribers: Array<(token: string) => void> = [];
// 添加请求订阅
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  subscribers.push(callback);
};

// 通知所有订阅者
const onRefreshed = (newToken: string) => {
  subscribers.forEach((callback) => callback(newToken));
  subscribers = []; // 清空订阅者
};

const axiosInstance = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL, // 你的 API 基础 URL
  baseURL: "http://127.0.0.1:8080/admin-api/", // 你的 API 基础 UR
});

// 刷新 token 的函数
const refreshToken = async () => {
  try {
    const token = localStorage.getItem("refresh_token");
    const response = await axiosInstance.put("passport/refresh-token", { refresh_token: token }); // 替换为您的 API 路径
    return response.data; // 返回新的 token 数据
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error("刷新 token 失败");
  }
};

// 请求拦截器（如果需要，可以在这里添加请求头等）
axiosInstance.interceptors.request.use(
  (config) => {
    // 在请求中添加自定义逻辑，比如添加 token
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  async (response) => {
    // @ts-ignore
    if (response && response.data?.code == 200204) {
      // 验证码过期，需要刷新验证码
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          console.log("refresh response");
          const newTokenData = await refreshToken();
          localStorage.setItem("access_token", newTokenData.access_token); // 更新存储的 token

          onRefreshed(newTokenData.access_token); // 通知所有订阅者
          isRefreshing = false; // 重新设置为 false
          // 重新发送原始请求
          response.config.headers.Authorization = `Bearer ${newTokenData.token}`;
          return axiosInstance(response.config);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          isRefreshing = false;
          eventBus.emit("redirect", ROUTE_PATHS.login); // Emit the redirect event
          return Promise.reject(new Error("刷新 token 失败，用户请重新登录。"));
        }
      }

      // 如果正在刷新 token，订阅当前请求
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken: any) => {
          response.config.headers.Authorization = `Bearer ${newToken}`;
          resolve(axiosInstance(response.config));
        });
      });
    }

    // 处理 token 刷新
    if (response && response.data?.code === 200205) {
      localStorage.removeItem("access_token");
      eventBus.emit("redirect", ROUTE_PATHS.login); // Emit the redirect event
      return Promise.reject(new Error("User needs to log in")); // 直接返回，后续逻辑不再执行
    }

    return response.data; // 直接返回数据部分
  },
  (error) => {
    const { response } = error;

    // 处理错误消息
    const errorMessage = getErrorMessage(response);
    return Promise.reject(new Error(errorMessage)); // 抛出错误
  },
);

// 提取错误信息
const getErrorMessage = (response: any) => {
  let errorMessage = "网络响应不正常";
  try {
    const errorData = response.data;
    if (errorData && errorData.error) {
      errorMessage = errorData.error; // 提取服务器返回的错误信息
    }
  } catch {
    // 如果解析失败，保留默认错误信息
  }
  return errorMessage;
};

export default axiosInstance;
