// ElectricDataComponent.tsx
import { useEffect, useState } from "react";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, CascaderProps, Col, DatePicker, Radio, Row, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { useSettlementPointsList } from "@/pages/electric-data/hook.ts";
import { PRICE_TYPE_REAL_TIME, PRICE_TYPE_T1, SettlementQueryParam } from "@/pages/electric-data/type.tsx";

const { RangePicker } = DatePicker;

const { SHOW_CHILD } = Cascader;

interface Option {
  value: string | number;
  label: string;
  children?: Option[];
}

interface ElectricSelectComponentProps {
  selectedType: string;
  setSelectedType: (type: string) => void;
  handleSearch: (params: SettlementQueryParam) => Promise<void>;
  setTableData: (data: any[]) => void;
  onDownload: () => void;
  storagePrefix: string;
}

const contentStyle: React.CSSProperties = {
  padding: 50,
  background: "rgba(0, 0, 0, 0.05)",
  borderRadius: 4,
};

const content = <div style={contentStyle} />;

const ElectricSelectComponent: React.FC<ElectricSelectComponentProps> = ({
  selectedType,
  setSelectedType,
  handleSearch,
  setTableData,
  onDownload,
  storagePrefix,
}) => {
  const {
    data: settlementPointData,
    error,
    isLoading: isSettlementPointLoading,
  } = useSettlementPointsList(selectedType);

  // 使用状态来存储日期范围
  const [selectedNames, setSelectedNames] = useState<{ [key: string]: string[] }>({});
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // 从本地存储获取日期和选中的名称
  useEffect(() => {
    const storedStartDate = localStorage.getItem(`${storagePrefix}_startDate`);
    const storedEndDate = localStorage.getItem(`${storagePrefix}_endDate`);
    const storedSelectedNames = localStorage.getItem(`${storagePrefix}_selectedNames`);

    if (storedStartDate && storedEndDate) {
      setDateRange([dayjs(storedStartDate), dayjs(storedEndDate)]);
    }
    if (storedSelectedNames) {
      setSelectedNames(JSON.parse(storedSelectedNames));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(selectedNames).length > 0 && dateRange && dateRange[0] && dateRange[1]) {
      handleSearch({
        type: selectedType,
        name: selectedNames,
        start: dateRange ? dateRange[0]?.format("YYYY-MM-DD") || "" : "",
        end: dateRange ? dateRange[1]?.format("YYYY-MM-DD") || "" : "",
      });
    } else {
      setTableData([]);
    }
  }, [selectedNames, dateRange]);

  if (isSettlementPointLoading) return <Spin tip="Loading">{content}</Spin>;
  if (error) return <div>Error loading data</div>;

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

  const onCascaderChange: CascaderProps<Option, "value", true>["onChange"] = (value) => {
    const newSelectedNames: { [key: string]: string[] } = {};
    value.forEach((item: any) => {
      if (selectedType === PRICE_TYPE_REAL_TIME) {
        const [key, childValue] = item;
        if (!newSelectedNames[key]) {
          newSelectedNames[key] = [];
        }
        newSelectedNames[key].push(childValue);
      } else {
        const [key] = item;
        if (!newSelectedNames[key]) {
          newSelectedNames[key] = [];
        }
        newSelectedNames[key].push(key);
      }
    });

    setSelectedNames(newSelectedNames);
    localStorage.setItem(`${storagePrefix}_selectedNames`, JSON.stringify(newSelectedNames));
  };

  const onDateChange = (dates: Dayjs[]) => {
    if (dates[0] && dates[1]) {
      const startDate = dates[0];
      const endDate = dates[1];
      setDateRange([startDate, endDate]);
      localStorage.setItem(`${storagePrefix}_startDate`, startDate.format("YYYY-MM-DD"));
      localStorage.setItem(`${storagePrefix}_endDate`, endDate.format("YYYY-MM-DD"));
    } else {
      setDateRange([null, null]);
      localStorage.setItem(`${storagePrefix}_startDate`, "");
      localStorage.setItem(`${storagePrefix}_endDate`, "");
    }
  };

  const handleRadioChange = (e: any) => {
    setSelectedType(e.target.value);
    setSelectedNames({}); // 重置所选名称
    localStorage.setItem(`${storagePrefix}_selectedType`, e.target.value);
    localStorage.setItem(`${storagePrefix}_selectedNames`, JSON.stringify({}));
  };

  const getCascaderValue = () => {
    // console.log("selectedNames", selectedNames);
    return Object.entries(selectedNames).flatMap(([key, values]) => {
      // 对于实时价格：需要返回 [key, value] 的数组
      if (selectedType === PRICE_TYPE_REAL_TIME) {
        return values.map(value => [key, value]);
      }
      // 对于 T-1 价格，假设只返回 value
      return values.map(value => [value]);
    });
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div className={"mr-4"}>
        <Radio.Group onChange={handleRadioChange} defaultValue={selectedType}>
          <Radio.Button value={PRICE_TYPE_REAL_TIME}>实时价格</Radio.Button>
          <Radio.Button value={PRICE_TYPE_T1}>T-1价格</Radio.Button>
        </Radio.Group>
      </div>

      <Row gutter={16} style={{ width: "80%", flexGrow: 1 }}>
        <Col span={6}>
          <Cascader
            style={{ width: "100%", fontSize: "14px" }}
            options={options}
            onChange={onCascaderChange}
            multiple
            maxTagCount="responsive"
            placeholder="请选择类型（可多选）"
            showCheckedStrategy={SHOW_CHILD}
            value={getCascaderValue()}
          />
        </Col>
        <Col span={6}>
          <RangePicker
            value={dateRange}
            onChange={onDateChange}
            style={{ width: "100%", fontSize: "14px" }}
          />
        </Col>
        <Col span={3}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() =>
              handleSearch({
                type: selectedType,
                name: selectedNames,
                start: dateRange ? dateRange[0]?.format("YYYY-MM-DD") || "" : "",
                end: dateRange ? dateRange[1]?.format("YYYY-MM-DD") || "" : "",
              })
            }
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
        onClick={onDownload}
      >
        导出
      </Button>
    </div>
  );
};

export default ElectricSelectComponent;
