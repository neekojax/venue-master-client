import dayjs from "dayjs";
import { FAULT_CODE_EXPLANATIONS, FAULT_CODES, type FaultCode, SITE_LINE_COLORS } from "./constants";
import type { AbnormalLogRecord } from "./types";

import { MOCK_FARM_SITES } from "@/pages/farm-monitor/mockData";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomMac(rand: () => number) {
  const hex = () =>
    Math.floor(rand() * 256)
      .toString(16)
      .padStart(2, "0");
  return Array.from({ length: 6 }, hex).join(":").toUpperCase();
}

function randomIp(rand: () => number) {
  return `10.${Math.floor(rand() * 200) + 10}.${Math.floor(rand() * 200)}.${Math.floor(rand() * 200) + 1}`;
}

function buildMockLogs(): AbnormalLogRecord[] {
  const sites = MOCK_FARM_SITES.slice(0, 10);
  const records: AbnormalLogRecord[] = [];
  let id = 1;
  const now = dayjs();

  for (let siteIndex = 0; siteIndex < sites.length; siteIndex++) {
    const site = sites[siteIndex];
    const rand = mulberry32(1000 + siteIndex * 97);

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const day = now.subtract(dayOffset, "day");
      const logsPerDay = Math.floor(rand() * 6) + (siteIndex % 3) + (dayOffset < 7 ? 3 : 1);

      for (let j = 0; j < logsPerDay; j++) {
        const code = FAULT_CODES[Math.floor(rand() * FAULT_CODES.length)] as FaultCode;
        const explanations = FAULT_CODE_EXPLANATIONS[code];
        const explanation = explanations[Math.floor(rand() * explanations.length)];
        const hour = Math.floor(rand() * 24);
        const minute = Math.floor(rand() * 60);
        const collectTime = day
          .hour(hour)
          .minute(minute)
          .second(Math.floor(rand() * 60));
        const logTime = collectTime.add(Math.floor(rand() * 45) + 1, "minute");
        const createdAt = logTime.add(Math.floor(rand() * 10) + 1, "minute");

        records.push({
          id: id++,
          siteId: site.id,
          siteName: site.name,
          agentCode: `agent-${String((siteIndex % 4) + 1).padStart(2, "0")}`,
          ip: randomIp(rand),
          mac: randomMac(rand),
          controlBoardSN: `SN-ABN-${String(300000 + id).slice(1)}`,
          code,
          explanation,
          logTime: logTime.format("YYYY-MM-DD HH:mm:ss"),
          collectTime: collectTime.format("YYYY-MM-DD HH:mm:ss"),
          createdAt: createdAt.format("YYYY-MM-DD HH:mm:ss"),
        });
      }
    }
  }

  return records.sort((a, b) => dayjs(b.collectTime).valueOf() - dayjs(a.collectTime).valueOf());
}

export const MOCK_ABNORMAL_LOGS: AbnormalLogRecord[] = buildMockLogs();

export function getSiteLineColor(siteIndex: number) {
  return SITE_LINE_COLORS[siteIndex % SITE_LINE_COLORS.length];
}
