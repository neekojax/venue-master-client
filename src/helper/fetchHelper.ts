// fetchWrapper.ts
import axiosInstance from "./axiosInstance";

// GET 请求
export const fetchGet = async (endpoint: string) => {
  try {
    const response = await axiosInstance.get(endpoint);
    checkSuccess(response);
    return response;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.message); // 抛出错误信息
  }
};

// POST 请求
export const fetchPost = async (endpoint: string, body: any, customHeaders?: Record<string, string>) => {
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders, // 合并自定义的请求头
  };

  try {
    const response = await axiosInstance.post(endpoint, body, { headers });
    checkSuccess(response);
    return response;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.message); // 抛出错误信息
  }
};

// DELETE 请求
export const fetchDelete = async (endpoint: string) => {
  try {
    const response = await axiosInstance.delete(endpoint);
    checkSuccess(response);
    return response;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.message); // 抛出错误信息
  }
};

const checkSuccess = (result: any) => {
  if (!result.success) {
    const errorMessage = result.message || "操作失败"; // 默认错误信息
    console.error("服务器返回的错误信息:", errorMessage);
    throw new Error(errorMessage); // 抛出服务器返回的错误信息
  }
};
