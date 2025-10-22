import { Table } from "antd";
export type EfficiencyRegionDetail = {
  Date: string;
  Category: string;
  EffectivePower: number;
  Efficiency: number;
  DailyOutput: number;
  CumulativeOutput: number;
  TheoreticalHashrate: number;
};
import { TableProps } from "antd/es/table";

const EfficiencyTable = ({
  tableProps,
  headerBgColor = "#f3f4f6",
}: {
  tableProps: TableProps<EfficiencyRegionDetail>;
  headerBgColor?: string;
}) => {
  const { columns, dataSource, pagination } = tableProps;
  const styledColumns = (columns || []).map((col: any) => ({
    ...col,
    onHeaderCell: (column: any) => {
      const prevProps = col.onHeaderCell ? col.onHeaderCell(column) : {};
      const prevStyle = prevProps?.style || {};
      return { ...prevProps, style: { ...prevStyle, backgroundColor: headerBgColor } };
    },
  }));
  return (
    <Table
      className="w-full data-summary"
      columns={styledColumns}
      dataSource={dataSource}
      pagination={pagination}
    />
  );
};
export default EfficiencyTable;
