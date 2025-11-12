import React, { useEffect, useMemo, useState } from "react";
import { CopyOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, message, Modal, Spin } from "antd";
import { fetchSummaryOverview } from "../../api";
import { useSelector, useSettingsStore } from "@/stores";

import type { SummaryOverview } from "@/pages/report/type";

const OverviewModel: React.FC<{ chartDate: string }> = ({ chartDate }) => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<SummaryOverview | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!chartDate) return;
    setLoading(true);
    fetchSummaryOverview(chartDate, poolType)
      .then((res) => {
        setOverview(res?.data ?? null);
      })
      .catch((err) => {
        console.error(err);
        message.error("加载数据失败，请稍后重试");
      })
      .finally(() => setLoading(false));
  }, [open, chartDate, poolType]);

  const summaryText = useMemo(() => {
    if (!overview) {
      return `日期：${chartDate}\n矿机类型：${poolType}`;
    }
    const p = (n: number, digits = 2) => {
      const sign = n >= 0 ? "上升" : "下降";
      const abs = Math.abs(n).toFixed(digits);
      return { sign, abs };
    };
    const fmtUSD = (n: number | string, digits = 2) => {
      const num = typeof n === "string" ? Number(n) : n;
      return num.toLocaleString(undefined, { maximumFractionDigits: digits });
    };
    const fmtEH = (n: number, digits = 2) => `${Number(n).toFixed(digits)}EH/S`;
    const fmtPercent = (n: number, digits = 2) => `${Number(n).toFixed(digits)}%`;
    const priceDiff = p(overview.btcPriceDiff);
    const netHashDiff = p(overview.networkHashRateDiff);
    const shareDiff = p(overview.hashMarketShareDiff);

    const lines: string[] = [];
    lines.push(" 1.市场行情 ");
    lines.push(` 今日市价${fmtUSD(overview.btcPrice, 0)}$，相比昨日同期${priceDiff.sign}${priceDiff.abs}%；`);
    lines.push(
      ` 全网算力${fmtEH(overview.networkHashRate)}，环比${netHashDiff.sign}${netHashDiff.abs}%；市场份额${fmtPercent(overview.hashMarketShare)}，环比${shareDiff.sign}${shareDiff.abs}%；`,
    );
    lines.push(" ");
    lines.push(
      " 2.昨日有效算力" +
        `${fmtEH(overview.hashRate)},` +
        `算力有效率${fmtPercent(overview.hashEfficiency)},` +
        `新增故障率${fmtPercent(overview.newFailureRate)},` +
        `总故障率${fmtPercent(overview.failureRate)};`,
    );
    lines.push(" ");
    lines.push(
      ` 3.昨日产出${Number(overview.btcOutput).toFixed(2)}枚，价值${fmtUSD(overview.usdOutput, 0)}$；MTD产出${Number(overview.mtdBtcOutput).toFixed(2)}枚，MTD产出价值${fmtUSD(overview.mtdUsdOutput, 0)}$，累计产出${Number(overview.cumulativeBtcOutput).toFixed(2)}枚，累计产出价值${fmtUSD(overview.cumulativeUsdOutput, 0)}$；`,
    );
    lines.push(" ");
    lines.push(
      " 4. 共计影响日算力" +
        `${Number(overview.powerImpact).toFixed(2)}E，影响日产出${Number(overview.outputImpact).toFixed(4)}枚`,
    );
    return lines.join("\n");
  }, [overview, chartDate, poolType]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summaryText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = summaryText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      message.success("已复制到剪贴板");
    } catch (e) {
      console.error(e);
      message.error("复制失败，请手动选择后复制");
    }
  };

  return (
    <>
      <Button icon={<EyeOutlined />} onClick={() => setOpen(true)}>
        数据概览
      </Button>
      <Modal
        title={
          <div className="flex items-center justify-between">
            <span>数据概览</span>
            <Button type="link" icon={<CopyOutlined />} onClick={handleCopy}>
              复制
            </Button>
          </div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={720}
      >
        <Spin spinning={loading}>
          <div className="space-y-2 whitespace-pre-wrap text-sm leading-6">{summaryText}</div>
        </Spin>
      </Modal>
    </>
  );
};

export default OverviewModel;
