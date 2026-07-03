export interface Rig {
  id: string;
  site: string;
  mac: string;
  controlBoardSN: string;
  model: string;
  minerId: string;
  ip: string;
  onlineTimeHours: number; // in hours, for sorting
  isDismantled: "下架" | "在架" | "未知";
  dismantledTime: string; // "YYYY-MM-DD HH:mm" or "-"
  assetOwnership: "自有" | "非自有" | "未知";
}

export interface SiteInfo {
  name: string;
  totalRigs: number;
  activeRigs: number;
  abnormalStats: {
    yesterday: number;
    day3: number;
    day7: number;
    day15: number;
    day30: number;
    all: number;
  };
  history30Days: Array<{
    date: string;
    abnormalCount: number;
    totalRigs: number;
  }>;
}

// Generate realistic sites data
export const SITES: SiteInfo[] = [
  {
    name: "四川阿坝一号场",
    totalRigs: 1250,
    activeRigs: 1210,
    abnormalStats: { yesterday: 8, day3: 15, day7: 24, day15: 42, day30: 68, all: 115 },
    history30Days: [],
  },
  {
    name: "内蒙古鄂尔多斯二号场",
    totalRigs: 2800,
    activeRigs: 2680,
    abnormalStats: { yesterday: 24, day3: 52, day7: 89, day15: 145, day30: 210, all: 345 },
    history30Days: [],
  },
  {
    name: "新疆准东三号场",
    totalRigs: 4500,
    activeRigs: 4350,
    abnormalStats: { yesterday: 45, day3: 98, day7: 154, day15: 280, day30: 420, all: 680 },
    history30Days: [],
  },
  {
    name: "云南昭通四号场",
    totalRigs: 950,
    activeRigs: 920,
    abnormalStats: { yesterday: 5, day3: 12, day7: 19, day15: 31, day30: 55, all: 92 },
    history30Days: [],
  },
  {
    name: "甘肃玉门五号场",
    totalRigs: 1600,
    activeRigs: 1520,
    abnormalStats: { yesterday: 18, day3: 35, day7: 58, day15: 92, day30: 148, all: 240 },
    history30Days: [],
  },
  {
    name: "青海海西六号场",
    totalRigs: 2100,
    activeRigs: 2010,
    abnormalStats: { yesterday: 12, day3: 28, day7: 49, day15: 78, day30: 125, all: 210 },
    history30Days: [],
  },
  {
    name: "四川雅安七号场",
    totalRigs: 1400,
    activeRigs: 1375,
    abnormalStats: { yesterday: 10, day3: 22, day7: 38, day15: 65, day30: 95, all: 155 },
    history30Days: [],
  },
  {
    name: "贵州贵阳八号场",
    totalRigs: 1100,
    activeRigs: 1080,
    abnormalStats: { yesterday: 6, day3: 14, day7: 25, day15: 44, day30: 72, all: 118 },
    history30Days: [],
  },
  {
    name: "青海格尔木九号场",
    totalRigs: 2300,
    activeRigs: 2240,
    abnormalStats: { yesterday: 19, day3: 41, day7: 72, day15: 120, day30: 185, all: 295 },
    history30Days: [],
  },
  {
    name: "内蒙古乌海十号场",
    totalRigs: 3200,
    activeRigs: 3120,
    abnormalStats: { yesterday: 31, day3: 65, day7: 112, day15: 195, day30: 310, all: 490 },
    history30Days: [],
  },
  {
    name: "云南怒江十一号场",
    totalRigs: 850,
    activeRigs: 830,
    abnormalStats: { yesterday: 4, day3: 9, day7: 15, day15: 28, day30: 48, all: 76 },
    history30Days: [],
  },
];

// Generate 30 days history data for each site with some deterministic variations
const generate30DaysHistory = () => {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }

  SITES.forEach((site, sIdx) => {
    const baseAbnormal = Math.round(site.totalRigs * 0.01); // ~1% base
    site.history30Days = dates.map((date, dIdx) => {
      // Add some random-looking but deterministic sinewave fluctuations
      const factor = Math.sin((dIdx + sIdx * 5) / 3) * 0.3 + 1; // 0.7 to 1.3
      const noise = (((dIdx * sIdx) % 7) - 3) * 2; // small noise
      const count = Math.max(0, Math.round(baseAbnormal * factor + noise));
      return {
        date,
        abnormalCount: count,
        totalRigs: site.totalRigs,
      };
    });
  });
};

generate30DaysHistory();

// Calculate Global / All-Site Statistics
export const getGlobalStats = () => {
  const stats = {
    totalRigs: SITES.reduce((acc, s) => acc + s.totalRigs, 0),
    activeRigs: SITES.reduce((acc, s) => acc + s.activeRigs, 0),
    abnormalStats: {
      yesterday: SITES.reduce((acc, s) => acc + s.abnormalStats.yesterday, 0),
      day3: SITES.reduce((acc, s) => acc + s.abnormalStats.day3, 0),
      day7: SITES.reduce((acc, s) => acc + s.abnormalStats.day7, 0),
      day15: SITES.reduce((acc, s) => acc + s.abnormalStats.day15, 0),
      day30: SITES.reduce((acc, s) => acc + s.abnormalStats.day30, 0),
      all: SITES.reduce((acc, s) => acc + s.abnormalStats.all, 0),
    },
  };

  // Combine history
  const dates = SITES[0].history30Days.map((h) => h.date);
  const history30Days = dates.map((date, idx) => {
    const count = SITES.reduce((acc, s) => acc + s.history30Days[idx].abnormalCount, 0);
    return {
      date,
      abnormalCount: count,
      totalRigs: stats.totalRigs,
    };
  });

  return { ...stats, history30Days };
};

// Generate list of 100+ rigs with realistic data
export const generateRigs = (): Rig[] => {
  const models = [
    "Antminer S19 Pro",
    "Antminer T19",
    "Whatsminer M30S++",
    "Whatsminer M50S",
    "Avalon A1246",
    "Jasminer X4",
  ];
  const rigs: Rig[] = [];

  // Seeded values to ensure they stay consistent on re-renders
  const macPrefixes = ["00:25:90", "3c:d9:2b", "e0:db:55", "70:85:c2", "ac:87:a3"];

  SITES.forEach((site, sIdx) => {
    // Generate ~20-25 rigs per site to have a solid table
    const count = 22 + (sIdx % 3) * 4;
    for (let i = 1; i <= count; i++) {
      const isDismantled = i % 9 === 0 ? "下架" : i % 17 === 0 ? "未知" : "在架";
      const assetOwnership = i % 7 === 0 ? "非自有" : i % 13 === 0 ? "未知" : "自有";

      const mac = `${macPrefixes[sIdx % macPrefixes.length]}:${String(10 + sIdx).padStart(2, "0")}:${String(20 + i).padStart(2, "0")}:${String(30 + i).padStart(2, "0")}`;
      const controlBoardSN = `SN-${100000 + sIdx * 5000 + i * 137}`;
      const model = models[(i + sIdx) % models.length];
      const minerId = `ANT-${sIdx + 1}-${String(i).padStart(3, "0")}`;
      const ip = `192.168.${10 + sIdx}.${100 + i}`;
      const onlineTimeHours =
        isDismantled === "在架"
          ? Math.round(24 + i * 36.5 + sIdx * 110)
          : isDismantled === "下架"
            ? Math.round(i * 2)
            : Math.round(i * 12); // "未知" gets some intermediate hours

      let dismantledTime = "-";
      if (isDismantled === "下架") {
        const d = new Date();
        d.setDate(d.getDate() - (i % 15));
        d.setHours(10 + (i % 8), 15 + ((i * 12) % 45));
        dismantledTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      } else if (isDismantled === "未知") {
        dismantledTime = "待确认";
      }

      rigs.push({
        id: `${sIdx}-${i}`,
        site: site.name,
        mac,
        controlBoardSN,
        model,
        minerId,
        ip,
        onlineTimeHours,
        isDismantled,
        dismantledTime,
        assetOwnership,
      });
    }
  });

  return rigs;
};

export const RIG_MODELS = [
  "Antminer S19 Pro",
  "Antminer T19",
  "Whatsminer M30S++",
  "Whatsminer M50S",
  "Avalon A1246",
  "Jasminer X4",
];
export const ASSET_TYPES = ["自有", "非自有", "未知"];
export const DISMANTLED_STATES = ["下架", "在架", "未知"];
