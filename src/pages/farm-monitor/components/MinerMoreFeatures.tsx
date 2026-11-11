import { useState } from "react";
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  DownOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Popover } from "antd";

import { t } from "@/locales";

interface MinerMoreFeaturesProps {
  hasSelectedSite: boolean;
  onDailyMacStatsClick: () => void;
  onMinerPowerClick: () => void;
}

export default function MinerMoreFeatures({
  hasSelectedSite,
  onDailyMacStatsClick,
  onMinerPowerClick,
}: MinerMoreFeaturesProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      title={<span className="text-sm font-semibold text-gray-800">{t("更多功能")}</span>}
      getPopupContainer={() => (document.fullscreenElement as HTMLElement | null) ?? document.body}
      content={
        <div
          className="flex w-[300px] max-w-[calc(100vw-48px)] flex-col gap-2"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          <button
            type="button"
            disabled={!hasSelectedSite}
            className="group flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
            onClick={() => {
              setOpen(false);
              onDailyMacStatsClick();
            }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base text-blue-500">
              <HistoryOutlined />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2 text-sm font-medium text-gray-800">
                <span>{t("每日 MAC 地址统计")}</span>
                <ArrowRightOutlined className="text-xs text-gray-400 group-hover:text-blue-500" />
              </span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">
                {hasSelectedSite ? t("查看每日唯一 MAC、新增和减少数量") : t("请先选择场地")}
              </span>
            </span>
          </button>
          <button
            type="button"
            disabled={!hasSelectedSite}
            className="group flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
            onClick={() => {
              setOpen(false);
              onMinerPowerClick();
            }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-base text-amber-500">
              <ThunderboltOutlined />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2 text-sm font-medium text-gray-800">
                <span>{t("矿机功耗")}</span>
                <ArrowRightOutlined className="text-xs text-gray-400 group-hover:text-blue-500" />
              </span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">
                {hasSelectedSite ? t("查看场地及各 Agent 的每日功耗趋势") : t("请先选择场地")}
              </span>
            </span>
          </button>
        </div>
      }
    >
      <Button
        icon={<AppstoreOutlined />}
        aria-expanded={open}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="shrink-0 !text-gray-600"
      >
        {t("更多功能")}
        <DownOutlined className="!text-[10px]" rotate={open ? 180 : 0} />
      </Button>
    </Popover>
  );
}
