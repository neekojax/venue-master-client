// LanguageSelector.js
import { GlobalOutlined } from "@ant-design/icons"; // 引入 Ant Design 的图标
import { Select } from "antd"; // 假设您使用 Ant Design
import { useSelector } from "@/stores";
import { setPoolType, useSettingsStore } from "@/stores"; // 引入自定义选择器

const { Option } = Select;

const PoolTypeSelector = () => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const handleChange = (value: string) => {
    setPoolType(value); // 更新语言
  };

  return (
    <Select
      value={poolType}
      // style={{
      //   width: 120,
      //   borderRadius: '4px',
      //   backgroundColor: '#1890ff', // 图二的背景颜色
      //   color: "white", // 字体颜色
      //   border: "none",
      // }}
      onChange={handleChange}
      suffixIcon={<GlobalOutlined />} // 添加图标
      className="custom-select"
      style={{
        backgroundColor: "transparent",
        border: "none",
        boxShadow: 'none',
      }}
      size={"middle"}
    >
      <Option value="NS">NS</Option>
      <Option value="CANG">CANGO</Option>
    </Select>
  );
};

export default PoolTypeSelector;
