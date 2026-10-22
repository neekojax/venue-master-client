import React, { useEffect, useMemo, useState } from "react";
import { CopyOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, message, Modal, Spin } from "antd";
import { fetchSummaryOverview } from "../../api";
import { useSelector, useSettingsStore } from "@/stores";

import { t } from "@/locales";
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
        message.error(t("加载数据失败，请稍后重试"));
      })
      .finally(() => setLoading(false));
  }, [open, chartDate, poolType]);

  const summaryText = useMemo(() => {
    if (!overview) {
      return t("日期：{{chartDate}} 矿机类型：{{poolType}}", { chartDate: chartDate, poolType: poolType });
    }
    const p = (n: number, digits = 2) => {
      const sign = n >= 0 ? t("上升") : t("下降");
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
    lines.push(t("1.市场行情"));
    lines.push(
      t("今日市价{{value}}$，相比昨日同期{{sign}}{{abs}}%；", {
        value: fmtUSD(overview.btcPrice, 0),
        sign: priceDiff.sign,
        abs: priceDiff.abs,
      }),
    );
    lines.push(
      t("全网算力{{value}}，环比{{sign}}{{abs}}%；市场份额{{value2}}，环比{{sign2}}{{abs2}}%；", {
        value: fmtEH(overview.networkHashRate),
        sign: netHashDiff.sign,
        abs: netHashDiff.abs,
        value2: fmtPercent(overview.hashMarketShare),
        sign2: shareDiff.sign,
        abs2: shareDiff.abs,
      }),
    );
    lines.push(" ");
    lines.push(
      t("2.昨日有效算力") +
        `${fmtEH(overview.hashRate)},` +
        t("算力有效率{{value}},", { value: fmtPercent(overview.hashEfficiency) }) +
        t("新增故障率{{value}},", { value: fmtPercent(overview.newFailureRate) }) +
        t("总故障率{{value}};", { value: fmtPercent(overview.failureRate) }),
    );
    lines.push(" ");
    lines.push(
      t(
        "3.昨日产出{{value}}枚，价值{{value2}}$；MTD产出{{value3}}枚，MTD产出价值{{value4}}$，累计产出{{value5}}枚，累计产出价值{{value6}}$；",
        {
          value: Number(overview.btcOutput).toFixed(2),
          value2: fmtUSD(overview.usdOutput, 0),
          value3: Number(overview.mtdBtcOutput).toFixed(2),
          value4: fmtUSD(overview.mtdUsdOutput, 0),
          value5: Number(overview.cumulativeBtcOutput).toFixed(2),
          value6: fmtUSD(overview.cumulativeUsdOutput, 0),
        },
      ),
    );
    lines.push(" ");
    lines.push(
      t("4. 共计影响日算力") +
        t("{{value}}E，影响日产出{{value2}}枚", {
          value: Number(overview.powerImpact).toFixed(2),
          value2: Number(overview.outputImpact).toFixed(4),
        }),
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
      message.success(t("已复制到剪贴板"));
    } catch (e) {
      console.error(e);
      message.error(t("复制失败，请手动选择后复制"));
    }
  };

  return (
    <>
      <Button icon={<EyeOutlined />} onClick={() => setOpen(true)}>
        {t("数据概览")}
      </Button>
      <Modal
        title={
          <div className="flex items-center justify-between">
            <span>{t("数据概览")}</span>
            <Button type="link" icon={<CopyOutlined />} onClick={handleCopy}>
              {t("复制")}
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
