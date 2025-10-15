import React from "react";

export type DataCardItem = {
  label: string;
  value: string | number | React.ReactNode;
};

type DataCardGridProps = {
  items: DataCardItem[];
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
};

export const DataCard: React.FC<DataCardItem> = ({ label, value }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="text-gray-500 mb-2">{label}</div>
      <div className="text-2xl">{value}</div>
    </div>
  );
};

const colsClassMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const DataCardGrid: React.FC<DataCardGridProps> = ({ items, cols = 3, className }) => {
  const colsClass = colsClassMap[cols] ?? colsClassMap[3];
  return (
    <div className={["grid", colsClass, "gap-4", "mb-6", className || ""].join(" ").trim()}>
      {items.map((item, idx) => (
        <DataCard key={idx} label={item.label} value={item.value} />
      ))}
    </div>
  );
};

export default DataCardGrid;
