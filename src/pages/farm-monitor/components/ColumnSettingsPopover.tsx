import { useEffect, useMemo, useState } from "react";
import { HolderOutlined, PushpinOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Checkbox, Popover, Tooltip } from "antd";
import {
  cloneColumnConfigs,
  type ColumnPin,
  DEFAULT_SNAPSHOT_COLUMN_CONFIGS,
  type SnapshotColumnConfig,
} from "../snapshotTableColumns";

interface ColumnSettingsPopoverProps {
  value: SnapshotColumnConfig[];
  onChange: (configs: SnapshotColumnConfig[]) => void;
}

function reorderList<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

export default function ColumnSettingsPopover({ value, onChange }: ColumnSettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SnapshotColumnConfig[]>(() => cloneColumnConfigs(value));
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(cloneColumnConfigs(value));
    }
  }, [open, value]);

  const toggleableItems = useMemo(() => draft.filter((item) => !item.lockVisible), [draft]);

  const allChecked = toggleableItems.length > 0 && toggleableItems.every((item) => item.visible);
  const indeterminate =
    toggleableItems.some((item) => item.visible) && !toggleableItems.every((item) => item.visible);

  const handleCheckAll = (checked: boolean) => {
    setDraft((prev) => prev.map((item) => (item.lockVisible ? item : { ...item, visible: checked })));
  };

  const handleToggleVisible = (key: string, visible: boolean) => {
    setDraft((prev) => prev.map((item) => (item.key === key ? { ...item, visible } : item)));
  };

  const handleTogglePin = (key: string, side: "left" | "right") => {
    setDraft((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        const nextPin: ColumnPin = item.pin === side ? false : side;
        return { ...item, pin: nextPin };
      }),
    );
  };

  const handleDrop = (toIndex: number) => {
    if (dragIndex == null || dragIndex === toIndex) return;
    setDraft((prev) => reorderList(prev, dragIndex, toIndex));
    setDragIndex(null);
  };

  const handleConfirm = () => {
    onChange(cloneColumnConfigs(draft));
    setOpen(false);
  };

  const handleCancel = () => {
    setDraft(cloneColumnConfigs(value));
    setOpen(false);
  };

  const handleReset = () => {
    setDraft(cloneColumnConfigs(DEFAULT_SNAPSHOT_COLUMN_CONFIGS));
  };

  const content = (
    <div className="w-[300px]">
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
        <Checkbox
          checked={allChecked}
          indeterminate={indeterminate}
          onChange={(e) => handleCheckAll(e.target.checked)}
        >
          全部
        </Checkbox>
      </div>

      <div className="max-h-[360px] overflow-y-auto py-1">
        {draft.map((item, index) => (
          <div
            key={item.key}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => setDragIndex(null)}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-50 ${
              dragIndex === index ? "bg-blue-50" : ""
            }`}
          >
            <Checkbox
              checked={item.visible}
              disabled={item.lockVisible}
              onChange={(e) => handleToggleVisible(item.key, e.target.checked)}
            />
            <HolderOutlined className="cursor-grab text-gray-400 shrink-0 active:cursor-grabbing" />
            <span className="flex-1 min-w-0 truncate text-sm text-gray-700" title={item.title}>
              {item.title}
            </span>
            <div className="flex items-center gap-0.5 shrink-0">
              <Tooltip title="固定到左侧">
                <Button
                  type="text"
                  size="small"
                  icon={
                    <PushpinOutlined className={item.pin === "left" ? "text-[#1677ff]" : "text-gray-400"} />
                  }
                  onClick={() => handleTogglePin(item.key, "left")}
                />
              </Tooltip>
              <Tooltip title="固定到右侧">
                <Button
                  type="text"
                  size="small"
                  icon={
                    <PushpinOutlined
                      rotate={90}
                      className={item.pin === "right" ? "text-[#1677ff]" : "text-gray-400"}
                    />
                  }
                  onClick={() => handleTogglePin(item.key, "right")}
                />
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2.5">
        <Button type="link" size="small" className="!px-0" onClick={handleReset}>
          恢复默认
        </Button>
        <div className="flex gap-2">
          <Button size="small" onClick={handleCancel}>
            取消
          </Button>
          <Button type="primary" size="small" onClick={handleConfirm}>
            确认
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Popover open={open} trigger="click" placement="bottomRight" content={content} onOpenChange={setOpen}>
      <Tooltip title="列设置">
        <Button
          type="text"
          shape="circle"
          icon={<SettingOutlined />}
          className={open ? "text-[#1677ff]" : undefined}
        />
      </Tooltip>
    </Popover>
  );
}
