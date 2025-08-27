// import { useLocation } from "react-router-dom";
import { GlobalOutlined } from "@ant-design/icons";
import { Select } from "antd";
import { useSelector } from "@/stores";
import { setPoolType, useSettingsStore } from "@/stores"; // 引入自定义选择器

const { Option } = Select;

export default function PoolSelect() {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const handleChange = (value: string) => {
    setPoolType(value); // 更新语言
    window.location.href = "/";
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
  // const filteredOptions =
  //   location.pathname === "/report/daily/sub-account"
  //     ? allOptions.filter((opt) => ["LN", "ND1", "ND2", "KZ"].includes(opt.value))
  //     : allOptions;

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
      {allOptions.map((opt) => (
        <Option key={opt.value} value={opt.value}>
          {opt.label}
        </Option>
      ))}
    </Select>
  );
}
