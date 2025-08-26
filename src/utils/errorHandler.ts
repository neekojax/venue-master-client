// src/utils/errorHandler.ts
const APP_VERSION = "1.0.2"; // 每次发版修改

function clearCacheAndReload() {
  console.warn("清理缓存并刷新页面...");

  try {
    localStorage.clear();
    sessionStorage.clear();
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  } catch (e) {
    console.error("清理缓存失败:", e);
  }

  // 设置一个刷新标记，避免死循环
  sessionStorage.setItem("reloaded", "true");
  location.reload();
}

export function setupGlobalErrorHandler() {
  // 防止死循环：如果是刚刷新过一次，就不再继续刷新
  if (sessionStorage.getItem("reloaded") === "true") {
    sessionStorage.removeItem("reloaded"); // 只生效一次
    return;
  }

  // 1. 检查版本号
  const savedVersion = localStorage.getItem("app_version");
  if (savedVersion !== APP_VERSION) {
    localStorage.setItem("app_version", APP_VERSION);
    clearCacheAndReload();
  }

  // index.tsx 或 main.tsx
  window.addEventListener(
    "error",
    (event: any) => {
      // 专门针对 JS 脚本加载失败的情况
      // alert(event.target?.tagName)
      console.log(event.target?.tagName);
      if (event.target?.tagName === "SCRIPT" && event.target.src?.includes(".js")) {
        console.error("检测到 JS 资源加载失败:", event.target.src);

        // 避免死循环，加个标志
        if (!sessionStorage.getItem("reload-once")) {
          sessionStorage.setItem("reload-once", "true");
          window.location.reload();
        }
      }
    },
    true,
  ); // ⚠️ 注意这里必须用捕获阶段 true

  window.addEventListener("unhandledrejection", (event) => {
    alert(event.reason?.message);
    if (event.reason?.message?.includes("Failed to fetch dynamically imported module")) {
      console.error("动态模块加载失败:", event.reason);

      if (!sessionStorage.getItem("reload-once")) {
        sessionStorage.setItem("reload-once", "true");
        window.location.reload();
      }
    }
  });
}
