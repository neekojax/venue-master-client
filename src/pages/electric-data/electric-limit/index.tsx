import { useEffect, useRef, useState } from "react";
import EditTable from "@/components/edit-table";

import { fetchSettlementData } from "@/pages/electric-data/api.tsx";
import ElectricSelectComponent from "@/pages/electric-data/components/electric-select.tsx";
import { PRICE_TYPE_REAL_TIME, PRICE_TYPE_T1, SettlementQueryParam } from "@/pages/electric-data/type.tsx";
import { exportElectricDataToExcel, exportElectricDataToExcelT } from "@/utils/excel.ts";

const StoragePrefix = "electric-limit";

export default function ElectricLimit() {
  const [selectedType, setSelectedType] = useState<string>(
    localStorage.getItem(`${StoragePrefix}_selectedType`) || PRICE_TYPE_REAL_TIME,
  );

  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);

  // 表头定义
  useEffect(() => {
    if (selectedType === PRICE_TYPE_REAL_TIME) {
      setColumns([
        {
          title: "电力接入点",
          dataIndex: "name",
          key: "name",
          width: 300,
        },
        {
          title: "数据口径",
          dataIndex: "type",
          key: "type",
          width: 300,
        },
        {
          title: "限电时间范围",
          dataIndex: "time_range",
          key: "time_range",
        },
        {
          title: "限电时长",
          dataIndex: "time_length",
          key: "time_length",
          width: 100,
          sorter: (a: any, b: any) => a.time_length - b.time_length,
          render: (text: any) => (
            <span>
              {text} <span style={{ fontSize: "em", color: "#888" }}> 分 </span>
            </span>
          ),
        },
      ]);
    } else if (selectedType === PRICE_TYPE_T1) {
      setColumns([
        {
          title: "电力接入点",
          dataIndex: "name",
          key: "name",
          width: 100,
        },
        {
          title: "限电时间范围",
          dataIndex: "time_range",
          key: "time_range",
          width: 100,
        },
        {
          title: "限电时长",
          dataIndex: "time_length",
          key: "time_length",
          width: 100,
          sorter: (a: any, b: any) => a.time_length - b.time_length,
          render: (text: any) => (
            <span>
              {text} <span style={{ fontSize: "em", color: "#888" }}> 小时 </span>
            </span>
          ),
        },
      ]);
    }
  }, [selectedType]);

  const handleSearch = async (params: SettlementQueryParam) => {
    try {
      const result = await fetchSettlementData(params);
      setTableData(result.data || []);
    } catch (error) {
      console.error("Error fetching settlement data:", error);
    }
  };

  const handleDownload = () => {
    // 实现导出逻辑
    if (selectedType === PRICE_TYPE_REAL_TIME) {
      exportElectricDataToExcel(tableData); // 调用实时数据导出函数
    } else if (selectedType === PRICE_TYPE_T1) {
      exportElectricDataToExcelT(tableData); // 调用 T-1 数据导出函数
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <ElectricSelectComponent
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        handleSearch={handleSearch}
        setTableData={setTableData}
        onDownload={handleDownload}
        storagePrefix={StoragePrefix}
      />
      <div style={{ marginTop: "20px", minWidth: "300px" }}>
        {tableData.length > 0 ? (
          <EditTable
            tableData={tableData}
            setTableData={setTableData}
            columns={columns}
            handleDelete={() => {}}
            handleSave={() => {}}
          />
        ) : (
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            {/*{Object.keys(selectedNames).length > 0 && dateRange && dateRange[0] && dateRange[1] ? (*/}
            {/*  <p style={{ color: "#888", fontSize: "16px" }}>*/}
            {/*    <i className="fas fa-exclamation-circle" style={{ marginRight: "8px", color: "#f39c12" }}></i>*/}
            {/*    暂无数据*/}
            {/*  </p>*/}
            {/*) : (*/}
            <p style={{ color: "#888", fontSize: "16px" }}>
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
