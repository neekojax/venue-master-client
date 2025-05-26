import { useEffect, useRef, useState } from "react";
import { message, Pagination, Radio, Table, Spin } from "antd";
import { exportElectricBasicToExcel } from "@/utils/excel.ts";

import { downloadSettlementData, fetchSettlementDataWithPagination } from "@/pages/electric-data/api.tsx";
import ElectricSelectComponent from "@/pages/electric-data/components/electric-select.tsx";
import {
  PRICE_TYPE_REAL_TIME,
  SettlementQueryParam,
  SettlementQueryWithPageParam,
} from "@/pages/electric-data/type.tsx";

const StoragePrefix = "electric-basic";

export default function ElectricBasic() {
  const [selectedType, setSelectedType] = useState<string>(
    localStorage.getItem(`${StoragePrefix}_selectedType`) || PRICE_TYPE_REAL_TIME,
  );

  // 计算当前页的数据
  const [currentPage, setCurrentPage] = useState(1); // 当前页
  const [pageSize, setPageSize] = useState(20); // 每页显示的条目数
  const [total, setTotal] = useState(0); // 总条目数
  const [priceType, setPriceType] = useState<string>(() => {
    return localStorage.getItem(`${StoragePrefix}_priceType`) || "all";
  }); // 每页显示的条目数

  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);

  const electricSelectRef = useRef<any>(null); // 创建 ref 用于访问子组件
  const [isInitialMount, setIsInitialMount] = useState(true); // 标识是否初次挂载

  const [queryParam, setQueryParam] = useState<SettlementQueryWithPageParam | null>(null); // 新增状态保存 queryParam

  const [loading, setLoading] = useState<boolean>(false); // 新增加载状态

  // 表头定义
  useEffect(() => {
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
        width: 200,
      },
      {
        title: "限电时间范围",
        dataIndex: "time",
        key: "time",
      },
      {
        title: "电力价格",
        dataIndex: "price",
        key: "price",
        width: 300,
        // sorter: (a: any, b: any) => a.price - b.price,
        render: (text: any) => (
          <span>
            {text} <span style={{ fontSize: "em", color: "#888" }}> US$ Cent/KWH </span>
          </span>
        ),
      },
    ]);
  }, []);

  // 定义 handleSearch 函数
  const handleSearch = async (params: SettlementQueryParam) => {
    setLoading(true); // 开始加载
    // 调用 fetSettlementData 函数
    try {
      const queryParam: SettlementQueryWithPageParam = {
        type: params.type,
        name: params.name,
        start: params.start, // 开始时间
        end: params.end, // 结束时间
        price: priceType,
        page: currentPage, // 当前页
        page_size: pageSize, // 每页显示的条目数
      };
      setQueryParam(queryParam); // 保存 queryParam
      const result = await fetchSettlementDataWithPagination(queryParam);
      setTableData(result.data.data || []); // 假设 result.data 是您需要的数组
      setTotal(result.data.total); // 假设 result.data.total 是总条目数
    } catch (error) {
      setLoading(false); // 结束加载
      console.error("Error fetching settlement data:", error);
    } finally {
      setLoading(false); // 结束加载
    }
  };

  const handleDownload = async () => {
    // 调用 fetSettlementData 函数
    try {
      if (queryParam) {
        const result = await downloadSettlementData(queryParam);
        exportElectricBasicToExcel(result.data.data);
      } else {
        message.error("无效的下载参数");
      }
    } catch (error) {
      console.error("Error fetching settlement data:", error);
    }
  };

  // 处理页码变化
  const onPageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };
  const onPriceTypeChange = (e: any) => {
    const newPriceType = e.target.value;
    setCurrentPage(1);
    setPriceType(newPriceType);
    localStorage.setItem(`${StoragePrefix}_priceType`, newPriceType); // 将新的价格类型存储到 localStorage
  };

  // 使用 useEffect 监听 currentPage 和 pageSize 的变化
  useEffect(() => {
    if (!isInitialMount) {
      // 当 currentPage 或 pageSize 变化时，调用 handleSearch
      if (electricSelectRef.current) {
        electricSelectRef.current.triggerSearch(); // 触发电力选择组件中的搜索
      }
    } else {
      // 在首次挂载后，将 isInitialMount 设为 false
      setIsInitialMount(false);
    }
  }, [currentPage, pageSize, priceType]); // 仅在 currentPage 或 pageSize 改变时调用

  return (
    <div style={{ padding: "20px" }}>
      <ElectricSelectComponent
        ref={electricSelectRef} // 将 ref 传递给子组件
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        handleSearch={handleSearch}
        onDownload={handleDownload}
        storagePrefix={StoragePrefix}
      />

      <div className={"mt-5"}>
        <Radio.Group
          name="priceType"
          value={priceType}
          onChange={onPriceTypeChange} // 处理变化的回调
          options={[
            { value: "all", label: "全部" },
            { value: "greaterThan7.5", label: "大于7.5" },
            { value: "lessThanEqual7.5", label: "小于7.5" },
          ]}
        />
      </div>

      <div style={{ marginTop: "20px", minWidth: "300px" }}>
        <Spin spinning={loading}>
          {/* 包裹内容以实现加载效果 */}
          {tableData.length > 0 ? (
            <div>
              <Table columns={columns} dataSource={tableData} pagination={false} />
              <Pagination
                className={"mt-5"}
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={onPageChange}
                showSizeChanger
                showQuickJumper
                pageSizeOptions={[20, 50, 100]}
                align={"center"}
              />
            </div>
          ) : (
            <div style={{ textAlign: "center", marginTop: "60px" }}>
              <p style={{ color: "#888", fontSize: "16px" }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: "8px", color: "#f39c12" }}></i>
                请选择电网场地搜索数据
              </p>
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
}
