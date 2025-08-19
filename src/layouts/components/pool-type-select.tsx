// // LanguageSelector.js
// import { GlobalOutlined } from "@ant-design/icons"; // 引入 Ant Design 的图标
// import { Select } from "antd"; // 假设您使用 Ant Design
// import { useSelector } from "@/stores";
// import { setPoolType, useSettingsStore } from "@/stores"; // 引入自定义选择器

// const { Option } = Select;

// const PoolTypeSelector = () => {
//   const { poolType } = useSettingsStore(useSelector(["poolType"]));

//   const handleChange = (value: string) => {
//     setPoolType(value); // 更新语言
//     // localStorage.setItem("poolType", value);
//   };

//   return (
//     <Select
//       value={poolType}
//       // style={{
//       //   width: 120,
//       //   borderRadius: '4px',
//       //   backgroundColor: '#1890ff', // 图二的背景颜色
//       //   color: "white", // 字体颜色
//       //   border: "none",
//       // }}
//       onChange={handleChange}
//       suffixIcon={<GlobalOutlined />} // 添加图标
//       className="custom-select header-custom-select"
//       style={{
//         backgroundColor: "transparent",
//         border: "none",
//         boxShadow: "none",
//         color: "#fff",
//       }}
//       size={"middle"}
//     >
//       <Option value="CANG">CANGO</Option>
//       <Option value="NS">NS</Option>
//       <Option value="ND">ND</Option>
//       <Option value="KZ">KZ</Option>
//       <Option value="LN">LN</Option>
//     </Select>
//   );
// };

// export default PoolTypeSelector;

import { useLocation } from "react-router-dom";
import { GlobalOutlined } from "@ant-design/icons";
import { Select } from "antd";
import { useSelector } from "@/stores";
import { setPoolType, useSettingsStore } from "@/stores"; // 引入自定义选择器

const { Option } = Select;

export default function PoolSelect() {
  const location = useLocation();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const handleChange = (value: string) => {
    setPoolType(value); // 更新语言
    // localStorage.setItem("poolType", value);
  };

  const allOptions = [
    { value: "CANG", label: "CANGO" },
    { value: "NS", label: "NS" },
    { value: "ND1", label: "ND1" },
    { value: "ND2", label: "ND2" },
    { value: "KZ", label: "KZ" },
    { value: "LN", label: "LN" },
  ];

  // 如果当前路径是 /report/daily/sub-account，只保留 LN、ND
  const filteredOptions =
    location.pathname === "/report/daily/sub-account"
      ? allOptions.filter((opt) => ["LN", "ND"].includes(opt.value))
      : allOptions;

  return (
    <Select
      value={poolType}
      onChange={handleChange}
      suffixIcon={<GlobalOutlined />}
      className="custom-select header-custom-select"
      style={{
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
        color: "#fff",
      }}
      size="middle"
    >
      {filteredOptions.map((opt) => (
        <Option key={opt.value} value={opt.value}>
          {opt.label}
        </Option>
      ))}
    </Select>
  );
}
