import { useEffect, useState } from "react";
import { Row, Col } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { CascaderProps, Spin } from "antd";
import { Cascader } from "antd";
import { DatePicker } from "antd";
import { Button, Space, Flex, Tooltip } from "antd";
import dayjs, { Dayjs } from "dayjs";
import EditTable from "@/components/edit-table";

import { fetchSettlementData } from "@/pages/electric-data/api.tsx";
import { useSettlementPointsList } from "@/pages/electric-data/hook.ts";
import { SettlementQueryParam } from "@/pages/electric-data/type.tsx";
import { exportElectricDataToExcel } from "@/utils/excel.ts";

const { RangePicker } = DatePicker;

const { SHOW_CHILD } = Cascader;
interface Option {
  value: string | number;
  label: string;
  children?: Option[];
}

export default function ElectricLimit() {
  const { data: settlementPointData, error, isLoading: isSettlementPointLoading } = useSettlementPointsList();

  // 使用状态来存储日期范围
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [selectedNames, setSelectedNames] = useState<{ [key: string]: string[] }>({});

  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);

  useEffect(() => {
    // 从本地存储获取日期
    const storedStartDate = localStorage.getItem("startDate");
    const storedEndDate = localStorage.getItem("endDate");

    if (storedStartDate && storedEndDate) {
      setDateRange([
        dayjs(storedStartDate), // 使用 dayjs 解析存储的日期字符串
        dayjs(storedEndDate),
      ]);
    }

    // 从本地存储获取选中的名称
    const storedSelectedNames = localStorage.getItem("selectedNames");
    if (storedSelectedNames) {
      setSelectedNames(JSON.parse(storedSelectedNames)); // 解析并设置状态
    }
  }, []);

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
        sorter: (a: any, b: any) => a.time_length - b.time_length, // 添加排序逻辑
        render: (text: any) => (
          <span>
            {text} <span style={{ fontSize: "em", color: "#888" }}> 分 </span>
          </span>
        ), // 渲染单位
      },
      // {
      //   title: "操作",
      //   valueType: "option",
      //   key: "operation",
      // },
    ]);
  }, []);

  // 定义 handleSearch 函数
  const handleSearch = async () => {
    const queryParam: SettlementQueryParam = {
      name: selectedNames,
      start: dateRange ? dateRange[0]?.format("YYYY-MM-DD") || "" : "",
      end: dateRange ? dateRange[1]?.format("YYYY-MM-DD") || "" : "",
    };

    // 调用 fetSettlementData 函数
    try {
      const result = await fetchSettlementData(queryParam);
      setTableData(result.data || []); // 假设 result.data 是您需要的数组
      console.log(result); // 处理获取的数据
    } catch (error) {
      console.error("Error fetching settlement data:", error);
    }
  };

  useEffect(() => {
    if (Object.keys(selectedNames).length > 0 && dateRange && dateRange[0] && dateRange[1]) {
      handleSearch();
    } else {
      setTableData([]); // 假设 result.data 是您需要的数组
    }
  }, [selectedNames, dateRange]);

  // 如果数据加载中或者出现错误，处理相应的情况
  if (isSettlementPointLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  // 将 settlementPointData 转换为 Cascader 所需的格式
  const options: Option[] = Object.keys(settlementPointData?.data).map((key) => ({
    label: key, // map 的键作为 label
    value: key, // map 的键也作为 value
    children: settlementPointData?.data[key].map((child) => ({
      label: child, // map 的值数组中的每个元素作为子项的 label
      value: child, // map 的值数组中的每个元素作为子项的 value
    })),
  }));

  const onChange: CascaderProps<Option, "value", true>["onChange"] = (value) => {
    const newSelectedNames: { [key: string]: string[] } = {};

    if (Array.isArray(value) && value.length > 0) {
      value.forEach((item) => {
        const [key, childValue] = item as [string, string]; // 解析选中的值
        if (!newSelectedNames[key]) {
          newSelectedNames[key] = []; // 如果该键不存在，初始化为一个空数组
        }
        newSelectedNames[key].push(childValue); // 将子项添加到对应的键下
      });
    }

    setSelectedNames(newSelectedNames); // 更新状态

    // 保存到本地存储
    localStorage.setItem("selectedNames", JSON.stringify(newSelectedNames));
  };

  const onDateChange = (_date: Dayjs | (Dayjs | null)[] | null, dateString: string | string[]) => {
    if (dateString[0] && dateString[1]) {
      const startDate = dateString[0];
      const endDate = dateString[1];

      setDateRange([
        dayjs(startDate), // 使用 dayjs 解析存储的日期字符串
        dayjs(endDate),
      ]);

      localStorage.setItem("startDate", startDate);
      localStorage.setItem("endDate", endDate);
    } else {
      setDateRange([null, null]);

      localStorage.setItem("startDate", "");
      localStorage.setItem("endDate", "");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Row gutter={16} style={{ width: "80%", flexGrow: 1 }}>
          <Col span={6}>
            <Cascader
              style={{ width: "100%", fontSize: "14px" }}
              options={options}
              onChange={onChange}
              multiple
              maxTagCount="responsive"
              showCheckedStrategy={SHOW_CHILD}
              placeholder="请选择类型（可多选）"
              value={Object.entries(selectedNames).flatMap(([key, values]) =>
                values.map(value => [key, value]) // 生成 [key, value] 的数组
              )}
            />
          </Col>

          <Col span={6}>
            <RangePicker
              value={dateRange}
              onChange={onDateChange}
              style={{ width: "100%", fontSize: "14px" }} // 使日期选择器填满
            />
          </Col>

          <Col span={3} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Button
              type="primary"
              danger
              size="middle"
              icon={<SearchOutlined style={{ color: "white" }} />}
              style={{
                backgroundColor: "#40A9FF",
                borderColor: "#40A9FF",
                color: "#FFFFFF",
                width: "100%", // 使按钮填满
              }}
            >
              搜索
            </Button>
          </Col>
        </Row>
        <Button
          type="text"
          icon={<DownloadOutlined />}
          size="middle"
          className={"text-blue-500"}
          onClick={() => exportElectricDataToExcel(tableData)}
        >
          导出
        </Button>
      </div>
      <div style={{ marginTop: "20px", minWidth: "300px" }}>
        {tableData.length > 0 ? (
          <EditTable
            tableData={tableData}
            setTableData={setTableData}
            columns={columns}
            handleDelete={() => {
            }}
            handleSave={() => {
            }}
          />
        ) : (
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            {Object.keys(selectedNames).length > 0 && dateRange && dateRange[0] && dateRange[1] ? (
              <p style={{ color: "#888", fontSize: "16px" }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: "8px", color: "#f39c12" }}></i>
                暂无数据
              </p>
            ) : (
              <p style={{ color: "#888", fontSize: "16px" }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: "8px", color: "#f39c12" }}></i>
                请选择电网场地搜索数据
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
