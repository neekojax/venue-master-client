// ElectricDataComponent.tsx
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
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
  onDownload: () => void;
  storagePrefix: string;
}

const contentStyle: React.CSSProperties = {
  padding: 50,
  background: "rgba(0, 0, 0, 0.05)",
  borderRadius: 4,
};

const content = <div style={contentStyle} />;

// 使用 forwardRef 和 useImperativeHandle 来暴露 triggerSearch 方法
const ElectricSelectComponent = forwardRef((props: ElectricSelectComponentProps, ref) => {
  const { selectedType, setSelectedType, handleSearch, onDownload, storagePrefix } = props;

  const {
    data: settlementPointData,
    error,
    isLoading: isSettlementPointLoading,
  } = useSettlementPointsList(selectedType);

  // 从 localStorage 中读取 selectedNames，若不存在则初始化为 {}
  const [selectedNames, setSelectedNames] = useState<{ [key: string]: string[] }>(
    JSON.parse(localStorage.getItem(`${storagePrefix}_selectedNames`) || "{}"),
  );

  // 从 localStorage 中读取 dateRange，若不存在则初始化为 [null, null]
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>(
    (() => {
      const storedStartDate = localStorage.getItem(`${storagePrefix}_startDate`);
      const storedEndDate = localStorage.getItem(`${storagePrefix}_endDate`);
      return storedStartDate && storedEndDate ? [dayjs(storedStartDate), dayjs(storedEndDate)] : [null, null];
    })(),
  );


  // 使用 useImperativeHandle 来暴露 triggerSearch 函数
  useImperativeHandle(ref, () => ({
    triggerSearch: () => {
      const params: SettlementQueryParam = {
        type: selectedType,
        name: selectedNames,
        start: dateRange[0]?.format("YYYY-MM-DD") || "",
        end: dateRange[1]?.format("YYYY-MM-DD") || "",
      };
      handleSearch(params);
    },
  }));

  useEffect(() => {
    handleSearch({
      type: selectedType,
      name: selectedNames,
      start: dateRange ? dateRange[0]?.format("YYYY-MM-DD") || "" : "",
      end: dateRange ? dateRange[1]?.format("YYYY-MM-DD") || "" : "",
    });
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
    if (dates && dates[0] && dates[1]) {
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
    return Object.entries(selectedNames).flatMap(([key, values]) => {
      // 对于实时价格：需要返回 [key, value] 的数组
      if (selectedType === PRICE_TYPE_REAL_TIME) {
        return values.map((value) => [key, value]);
      }
      // 对于 T-1 价格，假设只返回 value
      return values.map((value) => [value]);
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
});

export default ElectricSelectComponent;
