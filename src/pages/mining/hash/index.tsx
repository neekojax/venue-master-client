import { useEffect, useState } from "react";
import { FaAdn, FaFish } from "react-icons/fa6";
import { WiDirectionUpRight } from "react-icons/wi";
import { ExportOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, Input, Radio, Row, Spin, Tag, Tooltip } from "antd";
import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";
import { exportHashRateToExcel } from "@/utils/excel";

import { useMiningHashRateList } from "@/pages/mining/hook.ts";

const StoragePrefix = "mining-hash";

export default function MiningHashRatePage() {
  useAuthRedirect();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [poolCategory, setPoolCategoryType] = useState<string>(
    localStorage.getItem(`${StoragePrefix}_poolCategory`) || "主矿池",
  );

  const { data: hashData, isLoading: isLoadingPools } = useMiningHashRateList(poolType, poolCategory);

  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 新增搜索状态

  useEffect(() => {
    if (hashData && hashData.data) {
      const newData = hashData.data.map(
        (
          item: {
            venue_name: any;
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
          venue_name: item.venue_name,
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
        width: 25,
        render: (_: any, record: { serialNumber?: any; link?: any }) => {
          const { link } = record;
          // 根据 observer_link 内容返回不同的图标
          if (link.includes("antpool")) {
            return <FaAdn style={{ color: "green", fontSize: 16 }} />;
          } else if (link.includes("f2pool")) {
            return <FaFish style={{ color: "orange", fontSize: 16 }} />;
          } else {
            return <span>{record.serialNumber}</span>; // 如果没有匹配，则返回序号
          }
        },
      },
      {
        title: "场地",
        dataIndex: "venue_name",
        key: "venue_name",
        width: 200,
        // render: (text: any) => <span style={{ color: "#333" }}>{text}</span>,
        render: (text: string) => {
          const isSpecialVenue = text === "Arct-HF01-J XP-AR-US" || text === "ARCT Technologies-HF02-AR-US";
          return (
            <Tooltip
              title={text}
              placement="top"
              overlayInnerStyle={{ color: "white" }}
              style={{ color: "white" }}
            >
              <div
                style={{
                  width: "100%",
                  overflow: "hidden",
                  color: isSpecialVenue ? "red" : "#333", // 特殊场地字体颜色为红色
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: isSpecialVenue ? "bold" : "normal", // 加粗特殊场地
                }}
              >
                {text}
                {isSpecialVenue && (
                  <Tag color="red" style={{ marginLeft: 2 }}>
                    补充
                  </Tag>
                )}
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: "子账户",
        dataIndex: "pool_name",
        key: "pool_name",
        responsive: ["xs", "sm", "md"], // 适配所有屏幕
        width: "10%",
        // render: (text: any) => <span style={{ color: "#333" }}>{text}</span>,
        render: (text: any) => (
          <Tooltip
            title={text}
            placement="top"
            overlayInnerStyle={{ color: "white" }}
            style={{ color: "white" }}
          >
            <div
              style={{
                width: "100%",
                overflow: "hidden",
                color: "#333",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </div>
          </Tooltip>
        ),
      },
      // {
      //   title: "算力",
      //   className: "border-bottom",
      //   style: {
      //     borderBottom: "1px solid #e0e0e0",
      //   },
      //   children: [
      {
        title: "实时算力",
        dataIndex: "current_hash",
        key: "current_hash",
        // width: 95,
        render: (text: any) => {
          const parts = text.split(" "); // 根据空格分割

          return (
            <span>
              {parts[0]} <span className="text-sm text-gray-500">{parts[1]}</span>
            </span>
          );
        },
      },
      {
        title: "理论算力",
        // width: 95,
        width: "10%",
        dataIndex: "theoretical",
        key: "theoretical",
        render: (text: any) => {
          const parts = text.split(" "); // 根据空格分割
          if (parts[0] == "0.00") {
            return "--";
          }
          return (
            <span>
              {parts[0]} <span className="text-sm text-gray-500">{parts[1]}</span>
            </span>
          );
        },
        sorter: (a: any, b: any) => {
          // 提取 parts[0] 并转换为数字进行比较
          const valueA = parseFloat(a.theoretical.split(" ")[0]);
          const valueB = parseFloat(b.theoretical.split(" ")[0]);

          return valueA - valueB; // 返回值用于排序
        },
      },
      {
        title: "24h算力",
        // width: 95,
        dataIndex: "last_hash",
        key: "last_hash",
        render: (text: any) => {
          const parts = text.split(" "); // 根据空格分割
          return (
            <span>
              {parts[0]} <span className="text-sm text-gray-500">{parts[1]}</span>
            </span>
          );
        },
        sorter: (a: any, b: any) => {
          // 提取 parts[0] 并转换为数字进行比较
          const valueA = parseFloat(a.last_hash.split(" ")[0]);
          const valueB = parseFloat(b.last_hash.split(" ")[0]);

          return valueA - valueB; // 返回值用于排序，升序
        },
        //   },
        // ],
      },

      {
        title: "在线/离线",
        key: "status",
        width: "12%",
        render: (_text: any, record: any) => (
          <span>
            <Tag color="success" v-if={record.online != 0}>
              {record.online}
            </Tag>
            <Tag color="error" v-if={record.offline != "0"}>
              {record.offline}
            </Tag>
          </span>
          // <span>
          //   <span className="text-green-400">{record.online}</span>
          //   <span> / </span>
          //   <span className="text-red-600">{record.offline}</span>
          // </span>
        ),
      },
      {
        title: () => (
          <Tooltip title="昨日算力达成率">
            <span
              style={{
                display: "inline-block",
                maxWidth: 100,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              达成率
            </span>
          </Tooltip>
        ),
        dataIndex: "last_hash_rate_effective",
        key: "last_hash_rate_effective",
        width: "5%",
        render: (text: any) => {
          const value = parseFloat(text.replace("%", "")); // 去掉 '%' 并解析为数字
          return <span style={{ color: value < 90 ? "red" : "green" }}>{text}</span>;
        },
        sorter: (a: any, b: any) => {
          // 将带有 '%' 的字符串转换为数字进行比较
          const valueA = parseFloat(a.last_hash_rate_effective.replace("%", ""));
          const valueB = parseFloat(b.last_hash_rate_effective.replace("%", ""));

          return valueA - valueB; // 返回值用于排序
        },
      },
      {
        title: "结算算力",
        width: "10%",
        dataIndex: "last_settlement_hash",
        key: "last_settlement_hash",
        // width: 120,
        render: (text: any) => {
          const parts = text.split(" "); // 根据空格分割

          return (
            <span>
              {parts[0]} <span className="text-sm text-gray-500">{parts[1]}</span>
            </span>
          );
        },
        sorter: (a: any, b: any) => {
          // 提取 parts[0] 并转换为数字进行比较
          const valueA = parseFloat(a.last_settlement_hash.split(" ")[0]);
          const valueB = parseFloat(b.last_settlement_hash.split(" ")[0]);

          return valueA - valueB; // 返回值用于排序，升序
        },
      },
      {
        title: "结算BTC",
        dataIndex: "last_settlement_profit_btc",
        key: "last_settlement_profit_btc",
        // onCell: (record: any) => ({
        //   let value = Number(record.last_settlement_profit_btc) || 0;
        //   // 计算透明度，范围 0.1 ~ 1（根据实际数据调整 min/max）
        //   const opacity = Math.min(1, Math.max(0.1, value / 0.01)); // 假设最大值为 0.01 BTC

        //   style: {
        //     backgroundColor: `rgba(24, 144, 255, ${opacity})`,
        //     // backgroundColor: '#e6f7ff', // 所有单元格统一设置背景色
        //   },
        // }),
        render: (text: any) => {
          return (
            <span>
              <Tag color="#f50" style={{ padding: 0 }}>
                {text}
              </Tag>
            </span>
          );
        },
      },
      // {
      //   title: "结算FB",
      //   dataIndex: "last_settlement_profit_fb",
      //   key: "last_settlement_profit_fb",
      //   render: (text: any) => (
      //     <Tag color="#2db7f5" v-if={text != 0}>
      //       {text}
      //     </Tag>
      //     // <span>
      //
      //     //   <span style={{ color: "#24ac95" }}>{text}</span>
      //     //   {/* <span style={{ fontSize: "em" }}> FB </span> */}
      //     // </span>
      //   ),
      // },
      {
        title: "结算时间",
        dataIndex: "last_settlement_date",
        key: "last_settlement_date",
        align: "right",

        render: (text: any) => {
          const date = new Date(text);
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          return `${month}-${day}`;
        },
        //   },
        // ],
      },
      {
        title: "刷新时间",
        dataIndex: "update_time",
        key: "update_time",
        width: 80,
        align: "right",
        render: (text: any) => {
          const date = new Date(text);
          // const month = (date.getMonth() + 1).toString().padStart(2, '0');
          // const day = date.getDate().toString().padStart(2, '0');
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          const seconds = date.getSeconds().toString().padStart(2, "0");
          return `${hours}:${minutes}:${seconds}`;
        },
      },
      {
        title: "链接",
        dataIndex: "link",
        key: "link",
        width: 50,

        render: (link: string) => (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#252F4A" }}
            title={link} // 悬停显示完整链接
          >
            <WiDirectionUpRight style={{ marginLeft: 8, fontSize: "32px" }} />
          </a>
        ),
      },
    ]);
  }, []);

  // 搜索处理函数
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Loading 状态
  if (isLoadingPools) {
    return <Spin tip="加载中..." />;
  }

  const handleDelete = (): Promise<void> => {
    return new Promise(() => {});
  };

  const handleSave = (): Promise<void> => {
    return new Promise(() => {});
  };
  const onDownload = () => {
    exportHashRateToExcel(filteredData);
  };

  const handlePoolCategoryChange = (e: any) => {
    setPoolCategoryType(e.target.value);
    localStorage.setItem(`${StoragePrefix}_poolCategory`, e.target.value);
  };

  // 根据搜索词过滤数据
  const filteredData = tableData
    .filter((item: { [s: string]: unknown } | ArrayLike<unknown>) => {
      return Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      );
    })
    .sort((a: any, b: any) => {
      const nameA = a.venue_name.toLowerCase(); // 转为小写进行比较
      const nameB = b.venue_name.toLowerCase();
      if (nameA < nameB) {
        return -1; // a 在 b 前
      }
      if (nameA > nameB) {
        return 1; // a 在 b 后
      }
      return 0; // 相等
    });

  return (
    <div style={{ padding: "20px 0px" }} className="longdataTable">
      {/* <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
      >
        <div className={"flex"}>
          <div className={"mr-4"}>
            <Radio.Group className="filterRadio" onChange={handlePoolCategoryChange} value={poolCategory}>
              <Radio.Button value="主矿池">主矿池</Radio.Button>
              <Radio.Button value="备用矿池">备用矿池</Radio.Button>
            </Radio.Group>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Input
            prefix={<SearchOutlined style={{ color: "rgba(0, 0, 0, 0.25)", fontSize: 18 }} />}
            placeholder="请输入搜索字段"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: 220 }} // 设定宽度
            className="text-sm mr-10"
          />
          <Button
            icon={<ExportOutlined className="exportIcon" />}
            size="middle"
            className={"text-blue-500 exportButton"}
            onClick={onDownload}
          >
            导出
          </Button>
        </div>
      </div> */}
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col xs={24} sm={24} md={12}>
          <Radio.Group className="filterRadio" onChange={handlePoolCategoryChange} value={poolCategory}>
            <Radio.Button value="主矿池">主矿池</Radio.Button>
            <Radio.Button value="备用矿池">备用矿池</Radio.Button>
          </Radio.Group>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "flex-end" }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索"
              value={searchTerm}
              onChange={handleSearch}
              style={{ width: "200px" }}
            />
            <Button icon={<ExportOutlined />} onClick={onDownload}>
              导出
            </Button>
          </div>
        </Col>
      </Row>

      {isLoadingPools ? (
        <Spin style={{ marginTop: 20 }} />
      ) : (
        <EditTable
          tableData={filteredData}
          setTableData={setTableData}
          columns={columns}
          handleDelete={handleDelete}
          handleSave={handleSave}
        />
      )}
    </div>
  );
}
