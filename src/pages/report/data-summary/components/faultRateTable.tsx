import { Table } from "antd";
export type FaultDetail = {
  Date: string;
  Category: string;
  TotalMachine: number;
  TotalFailure: number;
  NewFailure: number;
  NewFailureRate: number;
};
import { TableProps } from "antd/es/table";

const FaultRateTable = ({
  tableProps,
  headerBgColor = "#f3f4f6",
}: {
  tableProps: TableProps<FaultDetail>;
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
export default FaultRateTable;
