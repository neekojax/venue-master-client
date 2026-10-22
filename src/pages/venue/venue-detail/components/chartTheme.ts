export const chartCardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "14px",
} as const;

export const chartTitleStyle = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#0f172a",
} as const;

export function chartRangeBadge(color: string) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    color,
    background: `${color}14`,
  } as const;
}

export const commonGrid = {
  left: 18,
  right: 18,
  top: 24,
  bottom: 22,
  containLabel: true,
};

export const commonTooltip = {
  backgroundColor: "rgba(255,255,255,0.98)",
  borderColor: "rgba(148,163,184,0.25)",
  borderWidth: 1,
  padding: [10, 12],
  textStyle: { color: "#0f172a" },
  axisPointer: {
    type: "line",
    lineStyle: { color: "#94a3b8", type: "dashed" },
  },
};

export const commonAxisLabel = {
  color: "#94a3b8",
  fontSize: 11,
};

export const commonAxisLine = {
  lineStyle: { color: "#dbe5f2" },
};

export const commonSplitLine = {
  lineStyle: { type: "dashed", color: "#edf2f7" },
};
