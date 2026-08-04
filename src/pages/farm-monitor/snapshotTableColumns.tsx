import { Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { HashBoardData, TaskSnapshotItem } from "./types";
import {
  formatSnapshotHashrate,
  formatSnapshotIp,
  formatSnapshotJson,
  formatSnapshotText,
  formatSnapshotTime,
} from "./utils";

const { Link } = Typography;

export type ColumnPin = false | "left" | "right";

export interface SnapshotColumnConfig {
  key: string;
  title: string;
  visible: boolean;
  pin: ColumnPin;
  /** 不允许取消显示 */
  lockVisible?: boolean;
}

export const SNAPSHOT_COLUMN_STORAGE_KEY = "venue-master:farm-monitor:snapshot-columns:v5";

const AGENT_CODE_DEFAULT_HIDDEN_KEY = "venue-master:farm-monitor:agent-code-default-hidden:v1";
const HASH_BOARD_SN_DEFAULT_HIDDEN_KEY = "venue-master:farm-monitor:hash-board-sn-default-hidden:v1";
const HASH_BOARD_METRICS_DEFAULT_HIDDEN_KEY =
  "venue-master:farm-monitor:hash-board-metrics-default-hidden:v1";
const HASH_BOARD_SN_COLUMN_KEYS = ["hash_board_1_sn", "hash_board_2_sn", "hash_board_3_sn"] as const;
const HASH_BOARD_METRIC_COLUMN_KEYS = [
  "hash_board_1_hashrate",
  "hash_board_1_temperature",
  "hash_board_2_hashrate",
  "hash_board_2_temperature",
  "hash_board_3_hashrate",
  "hash_board_3_temperature",
] as const;
const HASH_BOARD_COLUMN_KEYS = [...HASH_BOARD_SN_COLUMN_KEYS, ...HASH_BOARD_METRIC_COLUMN_KEYS] as const;

type HashBoardInfo = {
  index?: number;
  sn?: string;
  hashrate?: number | string | null;
  temperature?: number | string | null;
};

function renderWorkerTag(value?: string) {
  if (!value?.trim()) {
    return <span className="text-gray-400">-</span>;
  }
  return (
    <Tag
      color="processing"
      className="!m-0 max-w-full truncate !rounded-full !border-0 !px-2 !py-0 !text-xs"
      title={value}
    >
      {value}
    </Tag>
  );
}

function renderHashrateCell(value?: number | null, fractionDigits = 2) {
  if (value == null || Number.isNaN(Number(value))) {
    return <span className="text-gray-400">-</span>;
  }
  return (
    <span>
      {Number(value).toFixed(fractionDigits)}
      <span className="text-gray-400"> TH/s</span>
    </span>
  );
}

function renderPowerRatioCell(power?: number | string | null, hashrate30m?: number | string | null) {
  if (power == null || power === "" || Number.isNaN(Number(power))) {
    return <span className="text-gray-400">-</span>;
  }
  if (
    hashrate30m == null ||
    hashrate30m === "" ||
    Number.isNaN(Number(hashrate30m)) ||
    Number(hashrate30m) <= 0
  ) {
    return <span className="text-gray-400">-</span>;
  }

  const ratio = Number(power) / Number(hashrate30m);

  return (
    <span>
      {ratio.toFixed(2)}
      <span className="text-gray-400"> J/T</span>
    </span>
  );
}

function parseHashBoards(value: unknown): HashBoardInfo[] {
  const parsed = parseUnknownHashBoards(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.map((item) => normalizeHashBoard(item)).filter((item) => item != null);
}

function parseUnknownHashBoards(value: unknown): unknown {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      return JSON.parse(trimmed);
    } catch {
      return [];
    }
  }
  return value;
}

function normalizeHashBoard(value: unknown): HashBoardInfo | null {
  if (!value || typeof value !== "object") return null;
  const row = value as HashBoardData;
  return {
    index: typeof row.index === "number" ? row.index : undefined,
    sn: row.serial_number?.trim() || undefined,
    hashrate: row.hashrate,
    temperature: row.temperature,
  };
}

function getHashBoardValue(hashBoards: unknown, index: number): HashBoardInfo | null {
  const boards = parseHashBoards(hashBoards);
  const boardIndex = index + 1;
  return boards.find((board) => board.index === boardIndex) ?? boards[index] ?? null;
}

function renderHashBoardText(hashBoards: unknown, index: number, field: keyof HashBoardInfo) {
  const board = getHashBoardValue(hashBoards, index);
  const value = board?.[field];
  return formatSnapshotText(value == null ? null : String(value));
}

function renderHashBoardHashrate(hashBoards: unknown, index: number) {
  const board = getHashBoardValue(hashBoards, index);
  const value = board?.hashrate;
  if (value == null || value === "") {
    return <span className="text-gray-400">-</span>;
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return <span>{String(value)}</span>;
  }
  return renderHashrateCell(num, 2);
}

/** 默认显示列及顺序（列设置可调整） */
export const DEFAULT_SNAPSHOT_COLUMN_CONFIGS: SnapshotColumnConfig[] = [
  { key: "index", title: "序号", visible: true, pin: "left", lockVisible: true },
  { key: "site_code", title: "场地", visible: true, pin: "left" },
  { key: "miner_code", title: "矿工号", visible: true, pin: false },
  { key: "ip", title: "机器IP", visible: true, pin: false },
  { key: "mac_address", title: "MAC地址", visible: true, pin: false },
  { key: "control_board_sn", title: "控制板序列号", visible: true, pin: false },
  { key: "full_type", title: "机型", visible: true, pin: false },
  { key: "power", title: "功耗比", visible: true, pin: false },
  { key: "hashrate", title: "算力", visible: true, pin: false },
  { key: "hashrate_30m", title: "30分钟算力", visible: true, pin: false },
  { key: "total_hashrate", title: "平均算力", visible: true, pin: false },
  { key: "ideal_hashrate", title: "理论算力", visible: true, pin: false },
  { key: "firmware_version", title: "固件版本", visible: true, pin: false },
  { key: "pool1_worker", title: "矿池1", visible: true, pin: false },
  { key: "pool2_worker", title: "矿池2", visible: true, pin: false },
  { key: "pool3_worker", title: "矿池3", visible: true, pin: false },
  { key: "temperature", title: "温度", visible: true, pin: false },
  { key: "fans", title: "风扇", visible: true, pin: false },
  { key: "hash_board_1_sn", title: "算力板1序列号", visible: false, pin: false },
  { key: "hash_board_1_hashrate", title: "算力板1算力", visible: false, pin: false },
  { key: "hash_board_1_temperature", title: "算力板1温度", visible: false, pin: false },
  { key: "hash_board_2_sn", title: "算力板2序列号", visible: false, pin: false },
  { key: "hash_board_2_hashrate", title: "算力板2算力", visible: false, pin: false },
  { key: "hash_board_2_temperature", title: "算力板2温度", visible: false, pin: false },
  { key: "hash_board_3_sn", title: "算力板3序列号", visible: false, pin: false },
  { key: "hash_board_3_hashrate", title: "算力板3算力", visible: false, pin: false },
  { key: "hash_board_3_temperature", title: "算力板3温度", visible: false, pin: false },
  { key: "uptime", title: "运行时长", visible: true, pin: false },
  { key: "run_mode", title: "运行模式", visible: true, pin: false },
  { key: "error", title: "错误信息", visible: true, pin: false },
  { key: "collect_time", title: "采集时间", visible: true, pin: false },
  { key: "created_at", title: "创建时间", visible: true, pin: false },
  { key: "updated_at", title: "更新时间", visible: true, pin: false },
  // 默认隐藏
  { key: "agent_code", title: "代理编码", visible: false, pin: false },
  { key: "task_id", title: "任务ID", visible: false, pin: false },
  { key: "hashrate_5s", title: "5秒算力", visible: false, pin: false },
  { key: "hashrate_fault", title: "算力异常", visible: false, pin: false },
  { key: "pool1_url", title: "矿池1地址", visible: false, pin: false },
  { key: "pool2_url", title: "矿池2地址", visible: false, pin: false },
  { key: "pool3_url", title: "矿池3地址", visible: false, pin: false },
];

export function cloneColumnConfigs(configs: SnapshotColumnConfig[]) {
  return configs.map((item) => ({ ...item }));
}

export function loadSnapshotColumnConfigs(): SnapshotColumnConfig[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_COLUMN_STORAGE_KEY);
    if (!raw) {
      return migrateHashBoardMetricsDefaultHidden(
        migrateHashBoardSnDefaultHidden(
          migrateAgentCodeDefaultHidden(
            migrateSnapshotColumnOrder(cloneColumnConfigs(DEFAULT_SNAPSHOT_COLUMN_CONFIGS)),
          ),
        ),
      );
    }
    const parsed = JSON.parse(raw) as SnapshotColumnConfig[];
    return migrateHashBoardMetricsDefaultHidden(
      migrateHashBoardSnDefaultHidden(
        migrateAgentCodeDefaultHidden(migrateSnapshotColumnOrder(mergeColumnConfigs(parsed))),
      ),
    );
  } catch {
    return migrateHashBoardMetricsDefaultHidden(
      migrateHashBoardSnDefaultHidden(
        migrateAgentCodeDefaultHidden(
          migrateSnapshotColumnOrder(cloneColumnConfigs(DEFAULT_SNAPSHOT_COLUMN_CONFIGS)),
        ),
      ),
    );
  }
}

export function saveSnapshotColumnConfigs(configs: SnapshotColumnConfig[]) {
  localStorage.setItem(SNAPSHOT_COLUMN_STORAGE_KEY, JSON.stringify(configs));
}

/** 代理编码改为默认隐藏（仅执行一次，不覆盖用户之后在列设置中重新开启的选择） */
function migrateAgentCodeDefaultHidden(configs: SnapshotColumnConfig[]) {
  if (localStorage.getItem(AGENT_CODE_DEFAULT_HIDDEN_KEY)) return configs;
  localStorage.setItem(AGENT_CODE_DEFAULT_HIDDEN_KEY, "1");
  const agent = configs.find((c) => c.key === "agent_code");
  if (!agent?.visible) return configs;
  const next = configs.map((c) => (c.key === "agent_code" ? { ...c, visible: false } : c));
  saveSnapshotColumnConfigs(next);
  return next;
}

function migrateHashBoardSnDefaultHidden(configs: SnapshotColumnConfig[]) {
  if (localStorage.getItem(HASH_BOARD_SN_DEFAULT_HIDDEN_KEY)) return configs;
  localStorage.setItem(HASH_BOARD_SN_DEFAULT_HIDDEN_KEY, "1");
  const next = configs.map((c) =>
    (HASH_BOARD_SN_COLUMN_KEYS as readonly string[]).includes(c.key) ? { ...c, visible: false } : c,
  );
  if (next.every((c, index) => c.visible === configs[index]?.visible)) return configs;
  saveSnapshotColumnConfigs(next);
  return next;
}

function migrateHashBoardMetricsDefaultHidden(configs: SnapshotColumnConfig[]) {
  if (localStorage.getItem(HASH_BOARD_METRICS_DEFAULT_HIDDEN_KEY)) return configs;
  localStorage.setItem(HASH_BOARD_METRICS_DEFAULT_HIDDEN_KEY, "1");
  const next = configs.map((c) =>
    (HASH_BOARD_METRIC_COLUMN_KEYS as readonly string[]).includes(c.key) ? { ...c, visible: false } : c,
  );
  if (next.every((c, index) => c.visible === configs[index]?.visible)) return configs;
  saveSnapshotColumnConfigs(next);
  return next;
}

/** 理论算力排在平均算力之后 */
function migrateHashrateColumnOrder(configs: SnapshotColumnConfig[]) {
  const idealIdx = configs.findIndex((c) => c.key === "ideal_hashrate");
  const totalIdx = configs.findIndex((c) => c.key === "total_hashrate");
  if (idealIdx === -1 || totalIdx === -1 || idealIdx > totalIdx) return configs;
  const next = cloneColumnConfigs(configs);
  const [ideal] = next.splice(idealIdx, 1);
  const newTotalIdx = next.findIndex((c) => c.key === "total_hashrate");
  next.splice(newTotalIdx + 1, 0, ideal);
  return next;
}

function migrateHashBoardColumnsAfterFans(configs: SnapshotColumnConfig[]) {
  const fanIdx = configs.findIndex((c) => c.key === "fans");
  if (fanIdx === -1) return configs;

  const hashBoardColumns = configs.filter((c) =>
    (HASH_BOARD_COLUMN_KEYS as readonly string[]).includes(c.key),
  );
  if (hashBoardColumns.length === 0) return configs;

  const next = configs.filter((c) => !(HASH_BOARD_COLUMN_KEYS as readonly string[]).includes(c.key));
  const nextFanIdx = next.findIndex((c) => c.key === "fans");
  next.splice(nextFanIdx + 1, 0, ...hashBoardColumns);
  return next;
}

function migrateSnapshotColumnOrder(configs: SnapshotColumnConfig[]) {
  return migrateHashBoardColumnsAfterFans(migrateHashrateColumnOrder(configs));
}

/** 合并本地已存配置与默认列（保留顺序，兼容新增字段，标题以默认为准） */
export function mergeColumnConfigs(saved: SnapshotColumnConfig[]) {
  const defaultMap = new Map(DEFAULT_SNAPSHOT_COLUMN_CONFIGS.map((item) => [item.key, item]));
  const merged: SnapshotColumnConfig[] = [];
  const used = new Set<string>();

  for (const hit of saved) {
    const defaults = defaultMap.get(hit.key);
    if (!defaults) continue;
    merged.push({
      ...defaults,
      visible: defaults.lockVisible ? true : hit.visible,
      pin: hit.pin,
    });
    used.add(hit.key);
  }

  const defaultIndexMap = new Map(DEFAULT_SNAPSHOT_COLUMN_CONFIGS.map((item, index) => [item.key, index]));

  for (const defaults of DEFAULT_SNAPSHOT_COLUMN_CONFIGS) {
    if (used.has(defaults.key)) continue;

    const targetIndex = defaultIndexMap.get(defaults.key) ?? merged.length;
    let insertAt = merged.length;
    for (let i = 0; i < merged.length; i++) {
      const currentIndex = defaultIndexMap.get(merged[i].key) ?? Number.MAX_SAFE_INTEGER;
      if (currentIndex > targetIndex) {
        insertAt = i;
        break;
      }
    }

    merged.splice(insertAt, 0, { ...defaults });
    used.add(defaults.key);
  }

  return merged;
}

function buildColumnMap(
  page: number,
  pageSize: number,
  siteCodeFallback?: string,
): Record<string, ColumnsType<TaskSnapshotItem>[number]> {
  const textCell = (v?: string | number | null) => formatSnapshotText(v);

  return {
    index: {
      title: "序号",
      key: "index",
      width: 64,
      render: (_v, _row, index) => (page - 1) * pageSize + index + 1,
    },
    site_code: {
      title: "场地",
      dataIndex: "site_code",
      key: "site_code",
      width: 180,
      ellipsis: true,
      render: (v: string | undefined) => textCell(v ?? siteCodeFallback),
    },
    agent_code: {
      title: "代理编码",
      dataIndex: "agent_code",
      key: "agent_code",
      width: 120,
      ellipsis: true,
      render: textCell,
    },
    miner_code: {
      title: "矿工号",
      dataIndex: "miner_code",
      key: "miner_code",
      width: 120,
      ellipsis: true,
      render: (v: string | undefined) => renderWorkerTag(v),
    },
    ip: {
      title: "机器IP",
      dataIndex: "ip",
      key: "ip",
      width: 130,
      render: (v) => formatSnapshotIp(v),
    },
    mac_address: {
      title: "MAC地址",
      dataIndex: "mac_address",
      key: "mac_address",
      width: 160,
      ellipsis: true,
      render: (v: string | undefined) =>
        v ? (
          <Link className="!text-[#1677ff] !text-xs hover:!text-[#4096ff]">{v}</Link>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    control_board_sn: {
      title: "控制板序列号",
      dataIndex: "control_board_sn",
      key: "control_board_sn",
      width: 200,
      ellipsis: true,
      render: textCell,
    },
    full_type: {
      title: "机型",
      dataIndex: "full_type",
      key: "full_type",
      width: 150,
      ellipsis: true,
      render: (v: string | undefined) => renderWorkerTag(v),
    },
    power: {
      title: "功耗比",
      dataIndex: "power",
      key: "power",
      width: 110,
      render: (v: number | string | undefined, record: TaskSnapshotItem) =>
        renderPowerRatioCell(v, record.hashrate_30m),
    },
    hashrate: {
      title: "算力",
      dataIndex: "hashrate",
      key: "hashrate",
      width: 110,
      render: (v: number | undefined) => renderHashrateCell(v, 2),
    },
    hashrate_30m: {
      title: "30分钟算力",
      dataIndex: "hashrate_30m",
      key: "hashrate_30m",
      width: 120,
      render: (v: number | undefined) => renderHashrateCell(v, 2),
    },
    ideal_hashrate: {
      title: "理论算力",
      dataIndex: "ideal_hashrate",
      key: "ideal_hashrate",
      width: 110,
      render: (v: number | undefined) => renderHashrateCell(v, 2),
    },
    total_hashrate: {
      title: "平均算力",
      dataIndex: "total_hashrate",
      key: "total_hashrate",
      width: 110,
      render: (v: number | undefined) => renderHashrateCell(v, 2),
    },
    firmware_version: {
      title: "固件版本",
      dataIndex: "firmware_version",
      key: "firmware_version",
      width: 180,
      ellipsis: true,
      render: textCell,
    },
    pool1_worker: {
      title: "矿池1",
      dataIndex: "pool1_worker",
      key: "pool1_worker",
      width: 140,
      ellipsis: true,
      render: (v: string | undefined) => renderWorkerTag(v),
    },
    pool2_worker: {
      title: "矿池2",
      dataIndex: "pool2_worker",
      key: "pool2_worker",
      width: 140,
      ellipsis: true,
      render: (v: string | undefined) => renderWorkerTag(v),
    },
    pool3_worker: {
      title: "矿池3",
      dataIndex: "pool3_worker",
      key: "pool3_worker",
      width: 140,
      ellipsis: true,
      render: (v: string | undefined) => renderWorkerTag(v),
    },
    temperature: {
      title: "温度",
      dataIndex: "temperature",
      key: "temperature",
      width: 160,
      ellipsis: true,
      render: (v: unknown) => formatSnapshotJson(v),
    },
    fans: {
      title: "风扇",
      dataIndex: "fans",
      key: "fans",
      width: 160,
      ellipsis: true,
      render: (v: unknown) => formatSnapshotJson(v),
    },
    hash_board_1_sn: {
      title: "算力板1序列号",
      dataIndex: "hash_boards",
      key: "hash_board_1_sn",
      width: 180,
      ellipsis: true,
      render: (v: unknown) => renderHashBoardText(v, 0, "sn"),
    },
    hash_board_1_hashrate: {
      title: "算力板1算力",
      dataIndex: "hash_boards",
      key: "hash_board_1_hashrate",
      width: 130,
      render: (v: unknown) => renderHashBoardHashrate(v, 0),
    },
    hash_board_1_temperature: {
      title: "算力板1温度",
      dataIndex: "hash_boards",
      key: "hash_board_1_temperature",
      width: 130,
      render: (v: unknown) => renderHashBoardText(v, 0, "temperature"),
    },
    hash_board_2_sn: {
      title: "算力板2序列号",
      dataIndex: "hash_boards",
      key: "hash_board_2_sn",
      width: 180,
      ellipsis: true,
      render: (v: unknown) => renderHashBoardText(v, 1, "sn"),
    },
    hash_board_2_hashrate: {
      title: "算力板2算力",
      dataIndex: "hash_boards",
      key: "hash_board_2_hashrate",
      width: 130,
      render: (v: unknown) => renderHashBoardHashrate(v, 1),
    },
    hash_board_2_temperature: {
      title: "算力板2温度",
      dataIndex: "hash_boards",
      key: "hash_board_2_temperature",
      width: 130,
      render: (v: unknown) => renderHashBoardText(v, 1, "temperature"),
    },
    hash_board_3_sn: {
      title: "算力板3序列号",
      dataIndex: "hash_boards",
      key: "hash_board_3_sn",
      width: 180,
      ellipsis: true,
      render: (v: unknown) => renderHashBoardText(v, 2, "sn"),
    },
    hash_board_3_hashrate: {
      title: "算力板3算力",
      dataIndex: "hash_boards",
      key: "hash_board_3_hashrate",
      width: 130,
      render: (v: unknown) => renderHashBoardHashrate(v, 2),
    },
    hash_board_3_temperature: {
      title: "算力板3温度",
      dataIndex: "hash_boards",
      key: "hash_board_3_temperature",
      width: 130,
      render: (v: unknown) => renderHashBoardText(v, 2, "temperature"),
    },
    uptime: {
      title: "运行时长",
      dataIndex: "uptime",
      key: "uptime",
      width: 100,
      ellipsis: true,
      render: textCell,
    },
    run_mode: {
      title: "运行模式",
      dataIndex: "run_mode",
      key: "run_mode",
      width: 100,
      ellipsis: true,
      render: textCell,
    },
    error: {
      title: "错误信息",
      dataIndex: "error",
      key: "error",
      width: 140,
      ellipsis: true,
      render: textCell,
    },
    collect_time: {
      title: "采集时间",
      dataIndex: "collect_time",
      key: "collect_time",
      width: 170,
      render: (v: string | undefined) => formatSnapshotTime(v),
    },
    created_at: {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      width: 170,
      render: (v: string | undefined) => formatSnapshotTime(v),
    },
    updated_at: {
      title: "更新时间",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 170,
      render: (v: string | undefined) => formatSnapshotTime(v),
    },
    task_id: {
      title: "任务ID",
      dataIndex: "task_id",
      key: "task_id",
      width: 120,
      ellipsis: true,
      render: textCell,
    },
    hashrate_5s: {
      title: "5秒算力",
      dataIndex: "hashrate_5s",
      key: "hashrate_5s",
      width: 110,
      render: (v: number | undefined) => formatSnapshotHashrate(v, 2),
    },
    hashrate_fault: {
      title: "算力异常",
      dataIndex: "hashrate_fault",
      key: "hashrate_fault",
      width: 88,
      render: (v: boolean | undefined) => (v ? <Tag color="error">是</Tag> : <Tag color="default">否</Tag>),
    },
    pool1_url: {
      title: "矿池1地址",
      dataIndex: "pool1_url",
      key: "pool1_url",
      width: 180,
      ellipsis: true,
      render: textCell,
    },
    pool2_url: {
      title: "矿池2地址",
      dataIndex: "pool2_url",
      key: "pool2_url",
      width: 180,
      ellipsis: true,
      render: textCell,
    },
    pool3_url: {
      title: "矿池3地址",
      dataIndex: "pool3_url",
      key: "pool3_url",
      width: 180,
      ellipsis: true,
      render: textCell,
    },
  };
}

export function buildSnapshotTableColumns(
  configs: SnapshotColumnConfig[],
  page: number,
  pageSize: number,
  siteCodeFallback?: string,
): { columns: ColumnsType<TaskSnapshotItem>; scrollX: number } {
  const columnMap = buildColumnMap(page, pageSize, siteCodeFallback);
  const configMap = new Map(configs.map((item) => [item.key, item]));
  const visible = configs.filter((item) => item.visible);
  const leftKeys = visible.filter((item) => item.pin === "left").map((item) => item.key);
  const rightKeys = visible.filter((item) => item.pin === "right").map((item) => item.key);
  const centerKeys = visible
    .filter((item) => item.pin !== "left" && item.pin !== "right")
    .map((item) => item.key);
  const orderedKeys = [...leftKeys, ...centerKeys, ...rightKeys];

  let scrollX = 0;
  const columns: ColumnsType<TaskSnapshotItem> = orderedKeys
    .map((key) => {
      const col = columnMap[key];
      if (!col) return null;
      const config = configMap.get(key);
      const width = typeof col.width === "number" ? col.width : 120;
      scrollX += width;
      const base = { ...col, title: config?.title ?? col.title };
      if (config?.pin === "left") {
        return { ...base, fixed: "left" as const };
      }
      if (config?.pin === "right") {
        return { ...base, fixed: "right" as const };
      }
      const { fixed: _fixed, ...rest } = base as ColumnsType<TaskSnapshotItem>[number] & { fixed?: string };
      return rest;
    })
    .filter(Boolean) as ColumnsType<TaskSnapshotItem>;

  return { columns, scrollX: Math.max(scrollX, 800) };
}
