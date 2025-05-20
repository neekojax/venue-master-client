import { useEffect, useState } from "react";
import { Row, Col, Radio, RadioChangeEvent } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { CascaderProps, Spin } from "antd";
import { Cascader } from "antd";
import { DatePicker } from "antd";
import { Button, Flex, Tooltip } from "antd";
import dayjs, { Dayjs } from "dayjs";
import EditTable from "@/components/edit-table";

import { fetchSettlementAverage } from "@/pages/electric-data/api.tsx";
import { useSettlementPointsList } from "@/pages/electric-data/hook.ts";
import { SettlementQueryParam } from "@/pages/electric-data/type.tsx";
import { exportElectricAverageToExcel } from "@/utils/excel.ts";

const { RangePicker } = DatePicker;

const PRICE_TYPE_REAL_TIME = "realTime"; // 实时价格
const PRICE_TYPE_T1 = "t1"; // T-1价格

const { SHOW_CHILD } = Cascader;
interface Option {
  value: string | number;
  label: string;
  children?: Option[];
}

const getStoredType = () => {
  const storedType = localStorage.getItem("selectedType2");
  return storedType ? storedType : PRICE_TYPE_REAL_TIME; // 如果有存储的类型，则返回它，否则返回默认值
};

export default function ElectricAverage() {
  const [selectedType, setSelectedType] = useState<string>(getStoredType); // 默认值为实时价格
  const {
    data: settlementPointData,
    error,
    isLoading: isSettlementPointLoading,
  } = useSettlementPointsList(selectedType);

  // 使用状态来存储日期范围
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [selectedNames, setSelectedNames] = useState<{ [key: string]: string[] }>({});

  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);

  useEffect(() => {
    // 从本地存储获取日期
    const storedStartDate = localStorage.getItem("startDate2");
    const storedEndDate = localStorage.getItem("endDate2");

    if (storedStartDate && storedEndDate) {
      setDateRange([
        dayjs(storedStartDate), // 使用 dayjs 解析存储的日期字符串
        dayjs(storedEndDate),
      ]);
    }

    // 从本地存储获取选中的名称
    const storedSelectedNames = localStorage.getItem("selectedNames2");
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
            {text} <span style={{ fontSize: "em", color: "#888" }}>US$ Cent/KWH</span>
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
      type: selectedType,
      name: selectedNames,
      start: dateRange ? dateRange[0]?.format("YYYY-MM-DD") || "" : "",
      end: dateRange ? dateRange[1]?.format("YYYY-MM-DD") || "" : "",
    };

    // 调用 fetSettlementData 函数
    try {
      const result = await fetchSettlementAverage(queryParam);
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

  // 动态构建 Cascader 选项
  const options: Option[] =
    selectedType === PRICE_TYPE_REAL_TIME
      ? Object.keys(settlementPointData?.data).map((key) => ({
          label: key,
          value: key,
          children: settlementPointData?.data[key].map((child) => ({
            label: child,
            value: child,
          })),
        }))
      : settlementPointData?.data.map((item) => ({
          label: item, // 假设 item 是需要显示的文本
          value: item, // 假设 item 本身就是值
        })) || []; // 如果 settlementPointData 为 undefined，返回空数组

  const onChange: CascaderProps<Option, "value", true>["onChange"] = (value) => {
    const newSelectedNames: { [key: string]: string[] } = {};
    value.forEach((item: any) => {
      if (selectedType === PRICE_TYPE_REAL_TIME) {
        const [key, childValue] = item; // 解析 key 和 value
        if (!newSelectedNames[key]) {
          newSelectedNames[key] = [];
        }
        newSelectedNames[key].push(childValue);
      } else {
        const [key] = item;
        // 对于 T-1 类型，直接将值添加到 newSelectedNames
        if (!newSelectedNames[key]) {
          newSelectedNames[key] = [];
        }
        newSelectedNames[key].push(key);
      }
    });

    setSelectedNames(newSelectedNames); // 更新状态

    // 保存到本地存储
    localStorage.setItem("selectedNames2", JSON.stringify(newSelectedNames));
  };

  const onDateChange = (_date: Dayjs | (Dayjs | null)[] | null, dateString: string | string[]) => {
    if (dateString[0] && dateString[1]) {
      const startDate = dateString[0];
      const endDate = dateString[1];

      setDateRange([
        dayjs(startDate), // 使用 dayjs 解析存储的日期字符串
        dayjs(endDate),
      ]);

      localStorage.setItem("startDate2", startDate);
      localStorage.setItem("endDate2", endDate);
    } else {
      setDateRange([null, null]);

      localStorage.setItem("startDate2", "");
      localStorage.setItem("endDate2", "");
    }
  };

  const onRadioChange = (e: RadioChangeEvent) => {
    const value = e.target.value;
    setSelectedType(value); // 使用新的变量名
    localStorage.setItem("selectedType2", value); // 存储到本地

    // 设置日期为null
    setDateRange([null, null]);
    localStorage.setItem("startDate2", "");
    localStorage.setItem("endDate2", "");

    // 设置所选电力点为空
    const newSelectedNames: { [key: string]: string[] } = {};
    setSelectedNames(newSelectedNames);
    localStorage.setItem("selectedNames2", JSON.stringify(newSelectedNames));
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className={"mr-4"}>
          <Radio.Group onChange={onRadioChange} defaultValue={selectedType}>
            <Radio.Button value={PRICE_TYPE_REAL_TIME}>实时价格</Radio.Button>
            <Radio.Button value={PRICE_TYPE_T1}>T-1价格</Radio.Button>
          </Radio.Group>
        </div>
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
            />
          </Col>

          <Col span={6}>
            <RangePicker
              // className={"text-sm"}
              value={dateRange}
              onChange={onDateChange}
              style={{ width: "100%" }} // 使日期选择器填满
            />
          </Col>

          <Col span={3} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Button
              type="primary"
              danger
              // size="middle"
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
          onClick={() => exportElectricAverageToExcel(tableData)}
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
