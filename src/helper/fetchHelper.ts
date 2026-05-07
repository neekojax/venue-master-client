// fetchWrapper.ts
import axiosInstance from "./axiosInstance";

// GET 请求（支持可选查询参数）
export const fetchGet = async (endpoint: string, params?: Record<string, any>, config?: any) => {
  try {
    const response = await axiosInstance.get(endpoint, { params, ...config });
    if (config?.responseType === "blob") {
      // 只要是 blob 下载，不进入 checkSuccess 校验（避免抛出未识别错误）
      return response; // Blob 下载直接返回完整的 response 对象
    }
    checkSuccess(response);
    console.log("fetchGet GET API res: ", response);
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
    console.log("fetchPost POST API res: ", response);
    return response;
  } catch (error) {
    // @ts-ignore
    throw new Error(error.message); // 抛出错误信息
  }
};

// POST 请求
export const fetchPostFile = async (
  endpoint: string,
  body: FormData,
  customHeaders?: Record<string, string>,
) => {
  const headers = {
    "Content-Type": "multipart/form-data",
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
  // 对 blob 类型或特殊格式进行放行
  if (
    result instanceof Blob ||
    result?.type === "application/vnd.ms-excel" ||
    result?.type === "application/octet-stream" ||
    result?.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return;
  }
  if (result?.status === 200 && (result?.data instanceof Blob || result?.config?.responseType === "blob")) {
    return;
  }
  if (!result?.success) {
    const errorMessage = result.message || "操作失败"; // 默认错误信息
    console.error("服务器返回的错误信息:", errorMessage);
    throw new Error(errorMessage); // 抛出服务器返回的错误信息
  }
};
