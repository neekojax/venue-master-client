import { useEffect, useState } from "react";
import EditTable from "@/components/edit-table";
import { exportElectricAverageToExcel } from "@/utils/excel.ts";

import { fetchSettlementAverage } from "@/pages/electric-data/api.tsx";
import ElectricSelectComponent from "@/pages/electric-data/components/electric-select.tsx";
import { PRICE_TYPE_REAL_TIME, SettlementQueryParam } from "@/pages/electric-data/type.tsx";

const StoragePrefix = "electric-average";

export default function ElectricAverage() {
  const [selectedType, setSelectedType] = useState<string>(
    localStorage.getItem(`${StoragePrefix}_selectedType`) || PRICE_TYPE_REAL_TIME,
  );

  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);

  // 表头定义
  useEffect(() => {
    setColumns([
      {
        title: "电力接入点",
        dataIndex: "name",
        key: "name",
        width: 100,
      },
      {
        title: "数据口径",
        dataIndex: "type",
        key: "type",
        width: 80,
      },
      {
        title: "时间范围",
        dataIndex: "time_range",
        key: "time_range",
        width: 120,
      },
      {
        title: "平均电价",
        dataIndex: "average",
        key: "average",
        width: 200,
        sorter: (a: any, b: any) => a.average - b.average, // 添加排序逻辑
        render: (text: any) => (
          <span>
            {text} <span style={{ fontSize: "em" }}>US$ Cent/KWH</span>
          </span>
        ), // 渲染单位
      },
    ]);
  }, []);

  const handleSearch = async (params: SettlementQueryParam) => {
    try {
      if (Object.keys(params.name).length > 0 && params.start != "" && params.end != "") {
        const result = await fetchSettlementAverage(params);
        setTableData(result.data || []);
      } else {
        setTableData([]);
      }
    } catch (error) {
      console.error("Error fetching settlement data:", error);
    }
  };

  const handleDownload = () => {
    exportElectricAverageToExcel(tableData);
  };

  return (
    <div style={{ padding: "20px" }}>
      <ElectricSelectComponent
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        handleSearch={handleSearch}
        onDownload={handleDownload}
        storagePrefix={StoragePrefix}
      />
      <div style={{ marginTop: "20px", minWidth: "300px" }}>
        {tableData.length > 0 ? (
          <EditTable
            tableData={tableData}
            setTableData={setTableData}
            columns={columns}
            // @ts-ignore
            handleDelete={() => {}}
            // @ts-ignore
            handleSave={() => {}}
          />
        ) : (
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            {/*{Object.keys(selectedNames).length > 0 && dateRange && dateRange[0] && dateRange[1] ? (*/}
            {/*  <p style={{ fontSize: "16px" }}>*/}
            {/*    <i className="fas fa-exclamation-circle" style={{ marginRight: "8px", color: "#f39c12" }}></i>*/}
            {/*    暂无数据*/}
            {/*  </p>*/}
            {/*) : (*/}
            <p style={{ fontSize: "16px" }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: "8px", color: "#f39c12" }}></i>
              暂无数据, 请选择电网场地搜索数据
            </p>
            {/*)}*/}
          </div>
        )}
      </div>
    </div>
  );
}
