// import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalOutlined } from "@ant-design/icons";
import { Select } from "antd";
import { ROUTE_PATHS } from "@/constants/common";
import { useSelector } from "@/stores";
import { setPoolType, useSettingsStore } from "@/stores"; // 引入自定义选择器

const { Option } = Select;

export default function PoolSelect() {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const navigate = useNavigate();

  const handleChange = (value: string) => {
    setPoolType(value); // 更新语言
    navigate(ROUTE_PATHS.landing);
  };

  // 实时读取 organizations 并监听更新（CANGO 的 value 设为 CANG）
  const [orgs, setOrgs] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(
        localStorage.getItem("organizations") || localStorage.getItem("groups") || "[]",
      );
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handlePermissionUpdated = (evt: Event) => {
      const e = evt as CustomEvent<any>;
      const groups = e.detail?.groups;
      // console.log("groups", groups);
      if (Array.isArray(groups)) {
        setOrgs(groups); // 不做排序，保持后端返回的原顺序
      }
    };
    const handleStorage = (evt: StorageEvent) => {
      if (evt.key === "organizations" || evt.key === "groups") {
        try {
          const parsed = JSON.parse(
            localStorage.getItem("organizations") || localStorage.getItem("groups") || "[]",
          );
          if (Array.isArray(parsed)) {
            setOrgs(parsed); // 不做排序，保持缓存中的原顺序
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
  // const fallback = [];
  const list = orgs.length ? orgs : [];
  const options = list.map((org) => ({
    value: org === "CANGO" ? "CANG" : org,
    label: org,
  }));

  // 监听 options 和 poolType，如果当前 poolType 不在选项列表中，则默认选中第一个并更新全局状态
  useEffect(() => {
    if (options.length > 0) {
      // console.log("options", options);
      // console.log("poolType", poolType);
      const isValid = options.some((opt) => opt.value === poolType);
      if (!isValid) {
        setPoolType(options[0].value);
      }
    }
  }, [orgs, poolType]);

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
