// import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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

  // 实时读取 organizations 并监听更新（CANGO 的 value 设为 CANG）
  const [orgs, setOrgs] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("organizations") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handlePermissionUpdated = (evt: Event) => {
      const e = evt as CustomEvent<any>;
      const groups = e.detail?.groups;
      if (Array.isArray(groups)) {
        setOrgs(groups.slice().sort((a, b) => a.localeCompare(b)));
      }
    };
    const handleStorage = (evt: StorageEvent) => {
      if (evt.key === "organizations" || evt.key === "groups") {
        try {
          const parsed = JSON.parse(
            localStorage.getItem("organizations") || localStorage.getItem("groups") || "[]",
          );
          if (Array.isArray(parsed)) {
            setOrgs(parsed.slice().sort((a, b) => a.localeCompare(b)));
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("permission_ids_updated", handlePermissionUpdated as EventListener);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("permission_ids_updated", handlePermissionUpdated as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // const fallback = ["CANGO", "NS", "ND1", "ND2", "KZ", "LN"];
  const fallback = [""];
  const list = orgs.length ? orgs : fallback;
  const options = list.map((org) => ({
    value: org === "CANGO" ? "CANG" : org,
    label: org,
  }));

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
      {options.map((opt) => (
        <Option key={opt.value} value={opt.value}>
          {opt.label}
        </Option>
      ))}
    </Select>
  );
}
