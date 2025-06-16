import { useEffect, useState } from "react";
import { FaAdn, FaFish } from "react-icons/fa6";
import { WiDirectionUpRight } from "react-icons/wi";
import { Input, message, Radio, Space, Spin } from "antd";
import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useMiningHashRateList } from "@/pages/mining/hook.ts";
import { useSelector, useSettingsStore } from "@/stores";

const emptyData = {
  name: "",
  pool_type: "",
  pool_category: "",
  theoretical_hashrate: 0,
  link: "",
};

const StoragePrefix = "mining-hash";

export default function MiningHashRatePage() {
  useAuthRedirect();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [poolCategory, setPoolCategoryType] = useState<string>(
    localStorage.getItem(`${StoragePrefix}_poolCategory`) || "主矿池",
  );

  const { data: hashData, error, isLoading: isLoadingPools } = useMiningHashRateList(poolType, poolCategory);

  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);

  useEffect(() => {
    if (hashData && hashData.data) {
      const newData = hashData.data.map(
        (
          item: {
            pool_name: any;
            current_hash: any;
            online: any;
            offline: any;
            last_hash: any;
            last_settlement_hash: any;
            theoretical: any;
            last_hash_rate_effective: any;
            last_settlement_profit_btc: any;
            last_settlement_profit_fb: any;
            last_settlement_date: any;
            update_time: any;
            link: any;
          },
          index: any,
        ) => ({
          serialNumber: index + 1,
          pool_name: item.pool_name,
          current_hash: item.current_hash,
          online: item.online,
          offline: item.offline,
          last_hash: item.last_hash,
          last_settlement_hash: item.last_settlement_hash,
          theoretical: item.theoretical,
          last_hash_rate_effective: item.last_hash_rate_effective,
          last_settlement_profit_btc: item.last_settlement_profit_btc,
          last_settlement_profit_fb: item.last_settlement_profit_fb,
          last_settlement_date: item.last_settlement_date,
          update_time: item.update_time,
          link: item.link,
        }),
      );
      setTableData(newData); // 设置表格数据源
    } else {
      setTableData([]);
    }
  }, [hashData]);

  // 表头定义
  useEffect(() => {
    setColumns([
      {
        // title: "序号", // 使用英文标题
        dataIndex: "serialNumber",
        key: "serialNumber",
        width: 40,
        render: (_, record) => {
          const { link } = record;
          // 根据 observer_link 内容返回不同的图标
          if (link.includes("antpool")) {
            return <FaAdn style={{ color: "green", fontSize: 18 }} />;
          } else if (link.includes("f2pool")) {
            return <FaFish style={{ color: "blue", fontSize: 18 }} />;
          } else {
            return <span>{record.serialNumber}</span>; // 如果没有匹配，则返回序号
          }
        },
      },
      {
        title: "场地",
        dataIndex: "pool_name",
        key: "pool_name",
        width: 230,
        render: (text: any) => <span style={{ color: "#1a4fc9" }}>{text}</span>,
      },
      {
        title: "实时算力",
        dataIndex: "current_hash",
        key: "current_hash",
        render: (text: any) => {
          const parts = text.split(" "); // 根据空格分割
          return (
            <span>
              {parts[0]} <span style={{ color: "#888" }}>{parts[1]}</span>
            </span>
          );
        },
      },
      {
        title: "在线 / 离线",
        key: "status",
        width: 100,
        render: (text: any, record: any) => (
          <span>
            <span className="text-green-400">{record.online}</span>
            <span style={{ color: "#888" }}> / </span>
            <span className="text-red-600">{record.offline}</span>
          </span>
        ),
      },
      {
        title: "24小时算力",
        dataIndex: "last_hash",
        key: "last_hash",
        render: (text: any) => {
          const parts = text.split(" "); // 根据空格分割
          return (
            <span>
              {parts[0]} <span style={{ color: "#888" }}>{parts[1]}</span>
            </span>
          );
        },
      },
      {
        title: "上次结算算力",
        dataIndex: "last_settlement_hash",
        key: "last_settlement_hash",
        render: (text: any) => {
          const parts = text.split(" "); // 根据空格分割
          return (
            <span>
              {parts[0]} <span style={{ color: "#888" }}>{parts[1]}</span>
            </span>
          );
        },
      },
      {
        title: "理论算力",
        dataIndex: "theoretical",
        key: "theoretical",
        render: (text: any) => {
          const parts = text.split(" "); // 根据空格分割
          return (
            <span>
              {parts[0]} <span style={{ color: "#888" }}>{parts[1]}</span>
            </span>
          );
        },
      },
      {
        title: "算力达成率",
        dataIndex: "last_hash_rate_effective",
        key: "last_hash_rate_effective",
        width: 100,
        render: (text: any) => {
          const value = parseFloat(text.replace('%', '')); // 去掉 '%' 并解析为数字
          return <span style={{ color: value < 90 ? "red" : "black" }}>{text}</span>;
        },
      },
      {
        title: "上次结算收益",
        dataIndex: "last_settlement_profit_btc",
        key: "last_settlement_profit_btc",
        render: (text: any) => (
          <span>
            <span style={{ color: "#24ac95" }}>{text}</span>
            <span style={{ fontSize: "em", color: "#888" }}> BTC </span>
          </span>
        ),
      },
      {
        title: "上次结算收益",
        dataIndex: "last_settlement_profit_fb",
        key: "last_settlement_profit_fb",
        render: (text: any) => (
          <span>
            <span style={{ color: "#24ac95" }}>{text}</span>
            <span style={{ fontSize: "em", color: "#888" }}> FB </span>
          </span>
        ),
      },
      {
        title: "上次结算时间",
        dataIndex: "last_settlement_date",
        key: "last_settlement_date",
      },
      {
        title: "刷新时间",
        dataIndex: "update_time",
        key: "update_time",
        width: 160,
      },
      {
        title: "链接",
        dataIndex: "link",
        key: "link",
        width: 80,
        render: (link: string) => (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "blue" }}
            title={link} // 悬停显示完整链接
          >
            <WiDirectionUpRight style={{ marginLeft: 8, fontSize: "32px" }} />
          </a>
        ),
      },
    ]);
  }, []);

  // Loading 状态
  if (isLoadingPools) {
    return <Spin tip="加载中..." />;
  }

  const handleDelete = () => {};

  const handleSave = () => {};

  const handlePoolCategoryChange = (e: any) => {
    setPoolCategoryType(e.target.value);
    localStorage.setItem(`${StoragePrefix}_poolCategory`, e.target.value);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
      >
        <div className={"flex"}>
          <div className={"mr-4"}>
            <Radio.Group onChange={handlePoolCategoryChange} value={poolCategory}>
              <Radio.Button value="主矿池">主矿池</Radio.Button>
              <Radio.Button value="备用矿池">备用矿池</Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </div>

      {isLoadingPools ? (
        <Spin style={{ marginTop: 20 }} />
      ) : (
        <EditTable
          tableData={tableData}
          setTableData={setTableData}
          columns={columns}
          handleDelete={handleDelete}
          handleSave={handleSave}
        />
      )}
    </div>
  );
}
