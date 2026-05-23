import type { OverviewPoint, TimeRange } from "./types";

export type { OverviewPoint, TimeRange } from "./types";

export interface MinerRecord {
  id: number;
  farm: string;
  agent: string;
  ip: string;
  mac: string;
  serial: string;
  hashrate: number;
  theoreticalHashrate: number;
  model: string;
  firmware: string;
}

export const KPI_SUMMARY = {
  theoreticalOnline: 128,
  online: 123,
  theoreticalOffline: 5,
  lowHashrate: 2,
  zeroHashrate: 1,
  networkEvents: 3,
  powerLimitEvents: 1,
  highTempEvents: 4,
};

export const FARM_OPTIONS = ["新疆数据中心", "内蒙古矿场", "四川矿场", "云南矿场"];

export type FarmStatus = "normal" | "warning" | "error";

export const FARM_STATUS_COLOR: Record<FarmStatus, string> = {
  normal: "#52c41a",
  warning: "#fa8c16",
  error: "#ff4d4f",
};

export interface FarmSite {
  id: string;
  name: string;
  hashrate: number;
  status: FarmStatus;
  iconColor?: string;
  iconBg?: string;
}

const FARM_NAMES = [
  "四川甘孜矿场",
  "新疆哈密矿场",
  "内蒙古鄂尔多斯矿场",
  "云南昭通矿场",
  "甘肃酒泉矿场",
  "青海海西矿场",
  "宁夏中卫矿场",
  "新疆数据中心",
  "内蒙古矿场",
  "四川矿场",
  "云南矿场",
  "ETH02-01",
  "OBTX01",
  "sabeta",
  "HF01-J XP",
  "Arct-HF02",
  "CANGO-01",
  "CANGO-02",
  "LN-矿场-A",
  "LN-矿场-B",
  "ND-西部01",
  "ND-西部02",
  "华北矿场01",
  "华北矿场02",
  "华南矿场01",
  "华南矿场02",
  "西南矿场01",
  "西南矿场02",
];

const ICON_PALETTE = [
  { color: "#ff4d4f", bg: "#fff1f0" },
  { color: "#1677ff", bg: "#e6f4ff" },
  { color: "#722ed1", bg: "#f9f0ff" },
  { color: "#eb2f96", bg: "#fff0f6" },
  { color: "#13c2c2", bg: "#e6fffb" },
  { color: "#fa8c16", bg: "#fff7e6" },
  { color: "#52c41a", bg: "#f6ffed" },
  { color: "#2f54eb", bg: "#f0f5ff" },
];

export const MOCK_FARM_SITES: FarmSite[] = FARM_NAMES.map((name, i) => {
  const palette = ICON_PALETTE[i % ICON_PALETTE.length];
  return {
    id: `farm-${i}`,
    name,
    hashrate: Math.round(1800 + Math.sin(i * 1.7) * 1200 + (28 - i) * 42),
    status: (i % 11 === 0 ? "error" : i % 5 === 0 ? "warning" : "normal") as FarmStatus,
    iconColor: palette.color,
    iconBg: palette.bg,
  };
});

const MODELS = ["Antminer S19 Pro", "Antminer S19j Pro", "Whatsminer M30S++", "Antminer S21"];
const FIRMWARES = ["FW-v2.1.5", "FW-v2.0.8", "FW-v1.9.3", "FW-v2.2.1"];

function randomMac() {
  const hex = () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  return Array.from({ length: 6 }, hex).join(":").toUpperCase();
}

function randomIp() {
  return `10.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200) + 1}`;
}

const MINERS_PER_FARM = 15;

export const MOCK_MINERS: MinerRecord[] = MOCK_FARM_SITES.flatMap((site, farmIndex) =>
  Array.from({ length: MINERS_PER_FARM }, (_, j) => {
    const i = farmIndex * MINERS_PER_FARM + j;
    const theoretical = 88 + (j % 5);
    const hashrate = theoretical - (j % 8 === 0 ? 12 : j % 5 === 0 ? 4 : 2);
    return {
      id: i + 1,
      farm: site.name,
      agent: `agent-${(j % 4) + 1}`,
      ip: randomIp(),
      mac: randomMac(),
      serial: `SN${String(100000 + i).slice(1)}`,
      hashrate: Number(hashrate.toFixed(1)),
      theoreticalHashrate: theoretical,
      model: MODELS[j % MODELS.length],
      firmware: FIRMWARES[j % FIRMWARES.length],
    };
  }),
);

function generate24hData(): OverviewPoint[] {
  const points: OverviewPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600 * 1000);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hour = String(d.getHours()).padStart(2, "0");
    const wave = Math.sin(i / 3) * 3;
    points.push({
      time: `${month}-${day} ${hour}:00`,
      theoreticalOnline: 128,
      online: Math.round(120 + wave + (i % 4)),
      lowHashrate: Math.max(0, Math.round(1 + (i % 5 === 0 ? 2 : 0))),
      zeroHashrate: i % 7 === 0 ? 2 : i % 11 === 0 ? 1 : 0,
      totalHashrate: Number((10500 + wave * 80 + i * 12).toFixed(0)),
    });
  }
  return points;
}

function generate7dData(): OverviewPoint[] {
  const points: OverviewPoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const wave = Math.sin(i) * 4;
    points.push({
      time: `${month}-${day}`,
      theoreticalOnline: 128,
      online: Math.round(118 + wave + i),
      lowHashrate: Math.max(0, Math.round(2 + (i % 3))),
      zeroHashrate: i % 2,
      totalHashrate: Number((10200 + wave * 120).toFixed(0)),
    });
  }
  return points;
}

export function getOverviewData(range: TimeRange): OverviewPoint[] {
  return range === "24h" ? generate24hData() : generate7dData();
}
