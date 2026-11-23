import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Input, message, Modal } from "antd";
import { saveOtherPoolDailyReason } from "../miner-anomaly-history-api";
import type { OtherPoolMachineAnomalyHistoryItem } from "../types";
import ReasonActionButton from "./ReasonActionButton";

import { t } from "@/locales";

interface Props {
  venueType: string;
  row: OtherPoolMachineAnomalyHistoryItem;
  canCreate: boolean;
  canEdit: boolean;
}

export default function OtherPoolDailyReasonCell({ venueType, row, canCreate, canEdit }: Props) {
  const [editing, setEditing] = useState<"post" | "put" | null>(null);
  const method = row.reason ? "put" : "post";
  const canWrite = row.siteCode && (row.reason ? canEdit : canCreate);
  return (
    <div>
      {row.reason ? (
        <div className="whitespace-pre-wrap break-words">{row.reason}</div>
      ) : (
        <span className="block text-gray-500">{t("该日期暂无原因记录")}</span>
      )}
      {canWrite && (
        <ReasonActionButton inline editing={method === "put"} onClick={() => setEditing(method)} />
      )}
      {canWrite && editing === method && (
        <DailyReasonEditor method={method} venueType={venueType} row={row} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function DailyReasonEditor({
  method,
  venueType,
  row,
  onClose,
}: Pick<Props, "venueType" | "row"> & { method: "post" | "put"; onClose: () => void }) {
  const [value, setValue] = useState(row.reason);
  const cache = useQueryClient();
  const save = useMutation({
    mutationFn: () =>
      saveOtherPoolDailyReason(method, venueType, row.siteCode, row.businessDate, value.trim()),
    onSuccess: () => {
      // 同一场地可共享给多个组织，已缓存的各组织历史页都需要重新读取。
      void cache.invalidateQueries({ queryKey: ["other-pool-machine-anomaly-history"] });
      message.success(t("保存成功"));
      onClose();
    },
  });
  return (
    <Modal
      open
      title={row.reason ? t("编辑原因") : t("填写原因")}
      okText={t("保存")}
      cancelText={t("取消")}
      confirmLoading={save.isPending}
      okButtonProps={{ disabled: !value.trim() }}
      onCancel={() => {
        if (!save.isPending) onClose();
      }}
      onOk={() => {
        if (!save.isPending && value.trim()) save.mutate();
      }}
    >
      <p className="mb-4 flex flex-wrap gap-x-4 text-blue-700">
        <span>
          {t("场地编码")} · {row.siteCode}
        </span>
        <span>
          {t("业务日期")} · {row.businessDate}
        </span>
      </p>
      <Input.TextArea
        aria-label={t("异常原因")}
        placeholder={t("请填写异常原因")}
        autoFocus
        rows={4}
        value={value}
        disabled={save.isPending}
        onChange={(event) => setValue(event.target.value)}
      />
      {save.isError && <Alert className="mt-3" type="error" showIcon message={save.error.message} />}
    </Modal>
  );
}
