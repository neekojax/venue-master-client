// import React from "react";
import { notification } from "antd";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

// 声明全局变量（来自 vite.config.ts define）
declare const BUILD_TIME: string;

export function setupAppErrorHandle() {
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });
}

export function setupAppVersionNotification() {
  const UPDATE_CHECK_INTERVAL = 3 * 60 * 1000;

  // const canAutoUpdateApp =
  //     import.meta.env.VITE_AUTOMATICALLY_DETECT_UPDATE === "Y" &&
  //     import.meta.env.PROD;
  // if (!canAutoUpdateApp) return;

  let isShow = false;
  let updateInterval: number | null = null;

  const checkForUpdates = async () => {
    if (isShow) return;

    const buildTime = await getHtmlBuildTime();

    if (!buildTime || buildTime === BUILD_TIME) {
      return;
    }

    isShow = true;

    notification.open({
      message: "系统版本更新通知",
      description: "检测到系统有新版本发布，是否立即刷新页面？",
      duration: 0, // 常驻通知
      //   btn: (
      //     <>
      //       <Button
      //         onClick={() => {
      //           notification.destroy();
      //           isShow = false;
      //         }}
      //       >
      //         稍后再说
      //       </Button>
      //       <Button
      //         type="primary"
      //         onClick={() => {
      //           location.reload();
      //         }}
      //       >
      //         立即刷新
      //       </Button>
      //     </>
      //   ),
      onClose: () => {
        isShow = false;
      },
    });
  };

  const startUpdateInterval = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    updateInterval = window.setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);
  };

  if (!isShow && document.visibilityState === "visible") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        checkForUpdates();
        startUpdateInterval();
      }
    });

    startUpdateInterval();
  }
}

async function getHtmlBuildTime(): Promise<string | null> {
  const baseUrl = import.meta.env.VITE_BASE_URL || "/";

  try {
    const res = await fetch(`${baseUrl}index.html?time=${Date.now()}`);
    if (!res.ok) return null;

    const html = await res.text();
    const match = html.match(/<meta name="buildTime" content="(.*)">/);
    return match?.[1] || null;
  } catch (error) {
    console.error("getHtmlBuildTime error:", error);
    return null;
  }
}
