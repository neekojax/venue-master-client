import { useEffect, useState } from "react";
import { FaAdn, FaFish } from "react-icons/fa6";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Input, message, Radio, Spin } from "antd";
import ActionButton, { ActionButtonMode } from "@/components/action-button";
import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";
import { exportMiningPoolListToExcel } from "@/utils/excel.ts";
import { getShortenedLink } from "@/utils/short-link.ts";

import EditForm from "@/pages/mining/components/edit-form.tsx";
import {
  useMiningPoolDelete,
  useMiningPoolList,
  useMiningPoolNew,
  useMiningPoolUpdate,
} from "@/pages/mining/hook.ts";
import { MiningPool, MiningPoolUpdate } from "@/pages/mining/type.tsx";

const emptyData = {
  name: "",
  pool_type: "",
  country: "",
  // pool_category: "",
  theoretical_hashrate: 0,
  energy_ratio: 0,
  basic_hosting_fee: 0,
  master_link: "",
  backup_link: "",
};

const StoragePrefix = "mining-setting";

export default function MiningSettingPage() {
  useAuthRedirect();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [poolCategory, setPoolCategoryType] = useState<string>(
    localStorage.getItem(`${StoragePrefix}_poolCategory`) || "主矿池",
  );

  const { data: poolsData, isLoading: isLoadingPools } = useMiningPoolList(poolType, poolCategory);

  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);

  const newMutation = useMiningPoolNew();
  const updateMutation = useMiningPoolUpdate();
  const deleteMutation = useMiningPoolDelete();

  const [isLoadingNewPool, setIsLoadingNewPool] = useState(false);

  const [searchTerm, setSearchTerm] = useState(""); // 新增搜索状态;

  useEffect(() => {
    if (poolsData && poolsData.data) {
      const newData = poolsData.data.map(
        (
          item: {
            id: any;
            pool_name: any;
            pool_type: any;
            country: any;
            pool_category: any;
            theoretical_hashrate: any;
            energy_ratio: any;
            basic_hosting_fee: any;
            link: any;
          },
          index: any,
        ) => ({
          serialNumber: index + 1,
          key: item.id, // 使用 ID 作为唯一 key
          pool_name: item.pool_name,
          pool_type: item.pool_type,
          country: item.country,
          pool_category: item.pool_category,
          theoretical_hashrate: item.theoretical_hashrate,
          energy_ratio: item.energy_ratio,
          basic_hosting_fee: item.basic_hosting_fee,
          link: item.link,
        }),
      );
      setTableData(newData); // 设置表格数据源
    }
  }, [poolsData]);

  // 表头定义
  useEffect(() => {
    setColumns([
      {
        // title: "序号", // 使用英文标题
        dataIndex: "serialNumber",
        key: "serialNumber",
        width: 40,
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
        title: "账户",
        dataIndex: "pool_name",
        key: "pool_name",
        width: 200,
        render: (text: any) => <span style={{ color: "#333" }}>{text}</span>,
      },
      {
        title: "主体类型",
        dataIndex: "pool_type",
        key: "pool_type",
        width: 75,
      },
      {
        title: "场地类型",
        dataIndex: "pool_category",
        key: "pool_category",
        width: 75,
      },
      {
        title: "所属国家",
        dataIndex: "country",
        key: "country",
        width: 75,
      },
      {
        title: "理论算力(PH/s)",
        dataIndex: "theoretical_hashrate",
        key: "theoretical_hashrate",
        width: 140,
        sorter: (a: any, b: any) => {
          // 直接比较数值
          return a.theoretical_hashrate - b.theoretical_hashrate; // 返回值用于升序排序
        },
      },
      {
        title: "能耗比(J/T)",
        dataIndex: "energy_ratio",
        key: "energy_ratio",
        width: 120,
      },
      {
        title: "基础托管费($/kwh)",
        dataIndex: "basic_hosting_fee",
        key: "basic_hosting_fee",
        width: 150,
      },
      {
        title: "链接",
        dataIndex: "link",
        key: "link",
        width: 200,
        render: (link: string) => (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1E90FF" }}
            title={link} // 悬停显示完整链接
          >
            {link.length > 40 ? getShortenedLink(link) : link}
          </a>
        ),
      },
      {
        title: "操作",
        valueType: "option",
        key: "operation",
      },
    ]);
  }, []);

  // Loading 状态
  if (isLoadingPools) {
    return <Spin tip="加载中..." />;
  }

  const handleNewMiningPool = async (values: MiningPool) => {
    setIsLoadingNewPool(true); // 开始加载
    newMutation.mutate(values, {
      onSuccess: () => {
        message.success("添加成功");
        setIsLoadingNewPool(false); // 请求成功，停止加载
      },
      onError: (error) => {
        message.error(`添加失败: ${error.message}`);
        setIsLoadingNewPool(false); // 请求成功，停止加载
      },
    });
  };

  const handleDelete = (recordId: number): Promise<void> => {
    return new Promise(() => {
      deleteMutation.mutate(recordId, {
        onSuccess: () => {
          message.success("删除记录成功");
        },
        onError: (error) => {
          message.error(`删除记录失败: ${error.message}`);
        },
      });
    });
  };

  const handleSave = (rowKey: number, data: { [x: string]: string }): Promise<void> => {
    const miningPoolUpdate: MiningPoolUpdate = {
      id: rowKey as number, // 假设 rowKey 是 RecordID
      pool_name: data.pool_name,
      pool_type: data.pool_type,
      country: data.country,
      pool_category: data.pool_category,
      theoretical_hashrate: String(data.theoretical_hashrate),
      energy_ratio: String(data.energy_ratio),
      basic_hosting_fee: String(data.basic_hosting_fee),
      link: data.link,
    };

    return new Promise(() => {
      updateMutation.mutate(miningPoolUpdate, {
        onSuccess: () => {
          message.success("更新成功");
        },
        onError: (error) => {
          message.error(`更新失败: ${error.message}`);
        },
      });
    });
  };

  const handlePoolCategoryChange = (e: any) => {
    setPoolCategoryType(e.target.value);
    localStorage.setItem(`${StoragePrefix}_poolCategory`, e.target.value);
  };

  const onDownload = () => {
    // @ts-ignore
    exportMiningPoolListToExcel(filteredData);
  };

  // 搜索处理函数
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 根据搜索词过滤数据
  const filteredData = tableData.filter((item: { [s: string]: unknown } | ArrayLike<unknown>) => {
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  });

  // @ts-ignore
  return (
    <div style={{ padding: "20px" }}>
      <div
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
        <div>
          <Input
            placeholder="请输入搜索字段"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: 250 }} // 设定宽度
            className="text-sm mr-10"
          />
          <ActionButton
            label={"添加矿池"}
            // @ts-ignore
            initialValues={emptyData}
            onSubmit={handleNewMiningPool}
            FormComponent={EditForm}
            mode={ActionButtonMode.ADD}
          />
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
      </div>

      {/* 覆盖在 EditTable 上方的 Spin */}
      {isLoadingNewPool && (
        <Spin
          tip="正在添加矿池..."
          size="large"
          style={{
            position: "absolute", // 绝对定位
            top: "30%", // 垂直居中
            left: "50%", // 水平居中
            transform: "translate(-50%, -50%)", // 使用 transform 进行中心对齐
            zIndex: 1000, // 确保在最上层
          }}
        />
      )}

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
