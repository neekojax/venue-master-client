import { useEffect, useState } from "react";
import { FaAdn, FaFish } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { ExportOutlined, LineChartOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, Input, Radio, Row, Spin, Switch, Table, Tag, Tooltip } from "antd";
// import EditTable from "@/components/edit-table";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ROUTE_PATHS } from "@/constants/common";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";
import { exportHashRateToExcel } from "@/utils/excel";

import "./VenueTabs.css";

import { t } from "@/locales";
import ResizableHeaderCell from "@/pages/custody-statistics/statistics/components/ResizableHeaderCell";
import { useMiningHashRateList } from "@/pages/mining/hook.ts";

const StoragePrefix = "mining-hash";

export default function MiningHashRatePage() {
  useAuthRedirect();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [poolCategory, setPoolCategoryType] = useState<string>(() => {
    // 矿池类别是与后端约定的数据值，必须保持中文，不随界面语言切换
    const saved = localStorage.getItem(`${StoragePrefix}_poolCategory`);
    return saved === "主矿池" || saved === "备用矿池" ? saved : "主矿池";
  });

  const { data: hashData, isLoading: isLoadingPools } = useMiningHashRateList(poolType, poolCategory);

  const [columns, setColumns] = useState<any>([]);
  const [venueNameColumnWidth, setVenueNameColumnWidth] = useState<number>(() => {
    const storedWidth = localStorage.getItem("mining-hash-venue-name-column-width");
    return storedWidth ? Number(storedWidth) || 160 : 160;
  });

  const [showCollectionOnly, setShowCollectionOnly] = useState(() => {
    // 初始化时从 localStorage 取值
    return localStorage.getItem("showCollectionOnly") === "true";
  });

  // 当值变化时写入 localStorage
  useEffect(() => {
    localStorage.setItem("showCollectionOnly", String(showCollectionOnly));
  }, [showCollectionOnly]);

  const [tableData, setTableData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 新增搜索状态

  useEffect(() => {
    if (hashData && hashData.data) {
      const newData = hashData.data.map(
        (
          item: {
            id: any;
            pool_id?: any;
            poolId?: any;
            "Pool ID"?: any;
            venue_id: any;
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
            collection: any;
          },
          index: any,
        ) => {
          const resolvedPoolId = item.pool_id ?? item.poolId ?? item["Pool ID"] ?? item.id;

          return {
            key: resolvedPoolId ?? `${item.venue_id}-${item.pool_name}-${index}`,
            pool_id: resolvedPoolId,
            venue_id: item.venue_id,
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
            collection: item.collection,
          };
        },
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
        title: t("场地"),
        dataIndex: "venue_name",
        key: "venue_name",
        width: venueNameColumnWidth,
        onHeaderCell: () =>
          ({
            width: venueNameColumnWidth,
            onColumnResize: (nextWidth: number) => {
              setVenueNameColumnWidth(nextWidth);
              localStorage.setItem("mining-hash-venue-name-column-width", String(nextWidth));
            },
          }) as any,
        // render: (text: any) => <span style={{ color: "#333" }}>{text}</span>,
        render: (text: string, record: { venue_id?: any; collection?: any }) => {
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
                  width: "90%",
                  display: "flex", // ✅ 改成 flex 布局
                  alignItems: "center",
                  overflow: "hidden",
                  color: isSpecialVenue ? "red" : "#333",
                  fontWeight: isSpecialVenue ? "bold" : "normal",
                }}
              >
                {/* 场地名 + 跳转 */}
                <Link
                  to={`/venue/detail/${record.venue_id}`}
                  className="text-blue-500 hover:underline"
                  style={{
                    flex: 1, // ✅ 占满剩余空间
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {text}
                </Link>

                {/* 收藏按钮 */}
                <FavoriteButton
                  venueId={record.venue_id}
                  defaultFavorite={record.collection}
                  onChange={(newCollection: 0 | 1) => {
                    setTableData((prev: any) =>
                      prev.map((item: any) =>
                        item.venue_id === record.venue_id ? { ...item, collection: newCollection } : item,
                      ),
                    );
                  }}
                />

                {/* 特殊场地标记 */}
                {isSpecialVenue && (
                  <Tag color="red" style={{ marginLeft: 4 }}>
                    {t("补充")}
                  </Tag>
                )}
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: t("子账户"),
        dataIndex: "pool_name",
        key: "pool_name",
        responsive: ["xs", "sm", "md"], // 适配所有屏幕
        width: "100px",
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
      {
        title: t("实时算力"),
        dataIndex: "current_hash",
        key: "current_hash",
        align: "right",
        render: (text: any) => {
          const parts = String(text ?? "--")
            .trim()
            .split(/\s+/); // 根据空格分割

          return (
            <span className="inline-flex items-baseline justify-end gap-1 whitespace-nowrap tabular-nums">
              {parts[0]}{" "}
              <span className="inline-block w-10 text-left text-xs text-gray-400">
                {parts.slice(1).join(" ")}
              </span>
            </span>
          );
        },
      },
      {
        title: t("理论算力"),
        dataIndex: "theoretical",
        key: "theoretical",
        align: "right",
        render: (text: any) => {
          const parts = String(text ?? "--")
            .trim()
            .split(/\s+/); // 根据空格分割
          if (parts[0] == "0.00") {
            return "--";
          }
          return (
            <span className="inline-flex items-baseline justify-end gap-1 whitespace-nowrap tabular-nums">
              {parts[0]}{" "}
              <span className="inline-block w-10 text-left text-xs text-gray-400">
                {parts.slice(1).join(" ")}
              </span>
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
      // {
      //   title: "24h算力",
      //   // width: 95,
      //   dataIndex: "last_hash",
      //   key: "last_hash",
      //   render: (text: any) => {
      //     const parts = text.split(" "); // 根据空格分割
      //     return (
      //       <span>
      //         {parts[0]} <span className="text-sm text-gray-500">{parts[1]}</span>
      //       </span>
      //     );
      //   },
      //   sorter: (a: any, b: any) => {
      //     // 提取 parts[0] 并转换为数字进行比较
      //     const valueA = parseFloat(a.last_hash.split(" ")[0]);
      //     const valueB = parseFloat(b.last_hash.split(" ")[0]);

      //     return valueA - valueB; // 返回值用于排序，升序
      //   },
      //   //   },
      //   // ],
      // },
      {
        title: t("在线/离线"),
        key: "status",
        render: (_text: any, record: any) => (
          <span className="inline-grid grid-cols-2 gap-2 whitespace-nowrap tabular-nums">
            <Tag color="success" className="!m-0 min-w-[52px] text-center">
              {record.online ?? "--"}
            </Tag>
            <Tag color="error" className="!m-0 min-w-[52px] text-center">
              {record.offline ?? "--"}
            </Tag>
          </span>
        ),
      },
      {
        title: () => (
          <Tooltip title={t("昨日算力达成率")}>
            <span
              style={{
                display: "inline-block",
                maxWidth: 100,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {t("达成率")}
            </span>
          </Tooltip>
        ),
        dataIndex: "last_hash_rate_effective",
        key: "last_hash_rate_effective",
        render: (text: any) => {
          const value = parseFloat(String(text ?? ""));
          if (!Number.isFinite(value)) return "--";
          return (
            <span className="tabular-nums whitespace-nowrap" style={{ color: value < 90 ? "red" : "green" }}>
              {value.toFixed(2)}%
            </span>
          );
        },
        sorter: (a: any, b: any) => {
          // 将带有 '%' 的字符串转换为数字进行比较
          const valueA = parseFloat(a.last_hash_rate_effective.replace("%", ""));
          const valueB = parseFloat(b.last_hash_rate_effective.replace("%", ""));

          return valueA - valueB; // 返回值用于排序
        },
      },
      {
        title: t("刷新时间"),
        dataIndex: "update_time",
        key: "update_time",
        render: (text: any) => {
          const date = new Date(text);
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          const seconds = date.getSeconds().toString().padStart(2, "0");
          return `${hours}:${minutes}:${seconds}`;
        },
      },
      {
        title: t("链接"),
        dataIndex: "link",
        key: "link",
        width: 50,
        align: "right",

        render: (link: string) => (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1677FF" }}
            title={link} // 悬停显示完整链接
          >
            <ExportOutlined style={{ marginLeft: 8, fontSize: 16 }} />
          </a>
        ),
      },
      {
        title: t("历史状态"),
        key: "recentStatus",
        width: 90,
        render: (_text: any, record: { pool_id?: any; pool_name?: any; venue_name?: any }) => (
          <Tooltip title={t("查看历史状态")}>
            <Link
              to={ROUTE_PATHS.recentSubAccountStatus(poolType, record.pool_id)}
              state={{ poolName: record.pool_name, venueName: record.venue_name }}
              style={{ color: "#2563eb", display: "inline-flex", alignItems: "center" }}
            >
              <LineChartOutlined style={{ marginRight: 4 }} />
              {t("历史")}
            </Link>
          </Tooltip>
        ),
      },
    ]);
  }, [poolType, venueNameColumnWidth]);

  // 搜索处理函数
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Loading 状态
  if (isLoadingPools) {
    return <Spin tip={t("加载中...")} />;
  }

  const onDownload = () => {
    exportHashRateToExcel(filteredData);
  };

  const handlePoolCategoryChange = (e: any) => {
    setPoolCategoryType(e.target.value);
    localStorage.setItem(`${StoragePrefix}_poolCategory`, e.target.value);
  };

  // 根据搜索词过滤数据
  const filteredData = tableData
    .filter((item: { [key: string]: any }) => {
      // 1️⃣ 搜索词过滤
      const matchesSearch = Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      );

      // 2️⃣ 收藏过滤
      const matchesCollection = !showCollectionOnly || item.collection === 1;

      return matchesSearch && matchesCollection;
    })
    .sort((a: any, b: any) => {
      const nameA = a.venue_name.toLowerCase();
      const nameB = b.venue_name.toLowerCase();
      return nameA.localeCompare(nameB);
    });

  return (
    <div>
      <div
        style={{ background: "#fff", color: "grey", borderRadius: "0.5rem", padding: "20px 0px" }}
        className="longdataTable"
      >
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} sm={24} md={12}>
            <span style={{ marginBottom: 16, marginLeft: "10px", marginRight: "15px", color: "#000" }}>
              <Switch
                size="small"
                checked={showCollectionOnly}
                onChange={(checked) => setShowCollectionOnly(checked)}
              />{" "}
              {t("我的自选")}
            </span>

            <Radio.Group
              size="small"
              onChange={handlePoolCategoryChange}
              value={poolCategory}
              style={{ marginLeft: "10px", fontSize: "13px" }}
            >
              <Radio.Button value="主矿池" style={{ fontSize: "12px" }}>
                {t("主矿池")}
              </Radio.Button>
              <Radio.Button value="备用矿池" style={{ fontSize: "12px" }}>
                {t("备用矿池")}
              </Radio.Button>
            </Radio.Group>
          </Col>

          <Col xs={24} sm={24} md={12} style={{ textAlign: "right" }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder={t("搜索")}
              size="middle"
              value={searchTerm}
              onChange={handleSearch}
              style={{ width: "250px", marginRight: "20px" }}
            />

            <Button size="middle" icon={<ExportOutlined />} onClick={onDownload}>
              {t("导出")}
            </Button>
          </Col>
        </Row>

        {isLoadingPools ? (
          <Spin style={{ width: "100%", textAlign: "center", marginTop: "50%" }} />
        ) : (
          <Table
            className="[&_.ant-table-tbody>tr>td.ant-table-cell]:!py-2"
            components={{ header: { cell: ResizableHeaderCell } }}
            pagination={{
              position: ["bottomCenter"],
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "30", "50"],
              defaultPageSize: 10,
              showTotal: (total) => t("共 {{total}} 条", { total: total }),
              total: filteredData?.length,
              onChange: () => {
                const tableBody = document.querySelector(".ant-table-body");
                if (tableBody) {
                  tableBody.scrollTop = 0;
                }
              },
            }}
            rowKey={(record: any) => record.key}
            columns={columns}
            dataSource={filteredData}
            scroll={{ x: "max-content" }}
            style={{ marginTop: "15px", width: "100%" }}
          />
          // <EditTable
          //   tableData={filteredData}
          //   setTableData={setTableData}
          //   columns={columns}
          //   handleDelete={handleDelete}
          //   handleSave={handleSave}
          // />
        )}
      </div>
    </div>
  );
}
