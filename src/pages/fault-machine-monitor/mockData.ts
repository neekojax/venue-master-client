import { MOCK_FARM_SITES } from "@/pages/farm-monitor/mockData";

export type FaultType = "零算力" | "低算力" | "离线" | "高温";

export interface FaultMinerRecord {
  id: number;
  farm: string;
  agent: string;
  ip: string;
  mac: string;
  serial: string;
  hashrate: number;
  theoreticalHashrate: number;
  model: string;
  faultType: FaultType;
  faultDuration: string;
  lastOnline: string;
}

const FAULT_TYPES: FaultType[] = ["零算力", "低算力", "离线", "高温"];
const MODELS = ["Antminer S19 Pro", "Antminer S19j Pro", "Whatsminer M30S++"];

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

export const MOCK_FAULT_MINERS: FaultMinerRecord[] = MOCK_FARM_SITES.flatMap((site, farmIndex) =>
  Array.from({ length: 4 }, (_, j) => {
    const i = farmIndex * 4 + j;
    const theoretical = 90;
    const faultType = FAULT_TYPES[j % FAULT_TYPES.length];
    const hashrate = faultType === "零算力" ? 0 : faultType === "低算力" ? 42 : faultType === "离线" ? 0 : 65;
    return {
      id: i + 1,
      farm: site.name,
      agent: `agent-${(j % 3) + 1}`,
      ip: randomIp(),
      mac: randomMac(),
      serial: `SN-F${String(200000 + i).slice(1)}`,
      hashrate,
      theoreticalHashrate: theoretical,
      model: MODELS[j % MODELS.length],
      faultType,
      faultDuration: `${(j + 1) * 2}小时${(j * 13) % 60}分`,
      lastOnline: `2026-05-${String(20 - (j % 3)).padStart(2, "0")} ${10 + j}:30`,
    };
  }),
);

export const FAULT_SUMMARY = {
  total: MOCK_FAULT_MINERS.length,
  zeroHashrate: MOCK_FAULT_MINERS.filter((m) => m.faultType === "零算力").length,
  lowHashrate: MOCK_FAULT_MINERS.filter((m) => m.faultType === "低算力").length,
  offline: MOCK_FAULT_MINERS.filter((m) => m.faultType === "离线").length,
  highTemp: MOCK_FAULT_MINERS.filter((m) => m.faultType === "高温").length,
};

export const FAULT_TYPE_COLOR: Record<FaultType, string> = {
  零算力: "#ff4d4f",
  低算力: "#fa8c16",
  离线: "#8c8c8c",
  高温: "#eb2f96",
};
