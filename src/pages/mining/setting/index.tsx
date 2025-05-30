import { useEffect, useState } from "react";
import { FaAdn, FaFish } from "react-icons/fa6";
import { Input, message, Radio, Space, Spin } from "antd";
import ActionButton, { ActionButtonMode } from "@/components/action-button";
import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { getShortenedLink } from "@/utils/short-link.ts";

import { PRICE_TYPE_REAL_TIME, PRICE_TYPE_T1 } from "@/pages/electric-data/type.tsx";
import EditForm from "@/pages/mining/components/edit-form.tsx";
import { useMiningPoolList, useMiningPoolNew, useMiningPoolUpdate } from "@/pages/mining/hook.ts";
import { MiningPool } from "@/pages/mining/type.tsx";

const emptyData = {
  name: "",
  pool_type: "",
  pool_category: "",
  theoretical_hashrate: 0,
  link: "",
};

const StoragePrefix = "mining-setting";

export default function MiningSettingPage() {
  useAuthRedirect();

  const [poolType, setPoolType] = useState<string>(localStorage.getItem(`${StoragePrefix}_poolType`) || "NS");
  const [poolCategory, setPoolCategoryType] = useState<string>(
    localStorage.getItem(`${StoragePrefix}_poolCategory`) || "主矿池",
  );

  const { data: poolsData, error, isLoading: isLoadingPools } = useMiningPoolList(poolType, poolCategory);

  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);

  const newMutation = useMiningPoolNew();
  const updateMutation = useMiningPoolUpdate();

  const [isLoadingNewPool, setIsLoadingNewPool] = useState(false);

  useEffect(() => {
    if (poolsData && poolsData.data) {
      const newData = poolsData.data.map(
        (
          item: {
            id: any;
            pool_name: any;
            pool_type: any;
            pool_category: any;
            theoretical_hashrate: any;
            link: any;
          },
          index: any,
        ) => ({
          serialNumber: index + 1,
          key: item.id, // 使用 ID 作为唯一 key
          pool_name: item.pool_name,
          pool_type: item.pool_type,
          pool_category: item.pool_category,
          theoretical_hashrate: item.theoretical_hashrate,
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
        title: "账户",
        dataIndex: "pool_name",
        key: "pool_name",
        render: (text: any) => <span style={{ color: "#1a4fc9" }}>{text}</span>,
      },
      {
        title: "主体类型",
        dataIndex: "pool_type",
        key: "pool_type",
      },
      {
        title: "场地类型",
        dataIndex: "pool_category",
        key: "pool_category",
      },
      {
        title: "理论算力",
        dataIndex: "theoretical_hashrate",
        key: "theoretical_hashrate",
      },
      {
        title: "链接",
        dataIndex: "link",
        key: "link",
        width: 300,
        render: (link: string) => (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "blue" }}
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

  const handleDelete = (recordId: number) => {
    // deleteMutation.mutate(recordId, {
    //   onSuccess: () => {
    //     message.success("删除记录成功");
    //   },
    //   onError: (error) => {
    //     message.error(`删除记录失败: ${error.message}`);
    //   },
    // });
  };

  const handleSave = (rowKey: number, data: { [x: string]: string }) => {
    const miningPoolUpdate: MiningPool = {
      id: rowKey as number, // 假设 rowKey 是 RecordID
      pool_name: data.pool_name,
      pool_type: data.pool_type,
      pool_category: data.pool_category,
      theoretical_hashrate: data.theoretical_hashrate,
      link: data.link,
    };

    updateMutation.mutate(miningPoolUpdate, {
      onSuccess: () => {
        message.success("更新成功");
      },
      onError: (error) => {
        message.error(`更新失败: ${error.message}`);
      },
    });
  };

  const handlePoolTypeChange = (e: any) => {
    setPoolType(e.target.value);
    localStorage.setItem(`${StoragePrefix}_poolType`, e.target.value);
  };

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
            <Radio.Group onChange={handlePoolTypeChange} value={poolType}>
              <Radio.Button value="NS">NS</Radio.Button>
              <Radio.Button value="CANG">CANG</Radio.Button>
            </Radio.Group>
          </div>
          <div className={"mr-4"}>
            <Radio.Group onChange={handlePoolCategoryChange} value={poolCategory}>
              <Radio.Button value="主矿池">主矿池</Radio.Button>
              <Radio.Button value="备用矿池">备用矿池</Radio.Button>
            </Radio.Group>
          </div>
        </div>
        <ActionButton
          label={"添加矿池"}
          initialValues={emptyData}
          onSubmit={handleNewMiningPool}
          FormComponent={EditForm}
          mode={ActionButtonMode.ADD}
        />
      </div>

      {/* 覆盖在 EditTable 上方的 Spin */}
      {isLoadingNewPool && (
        <Spin
          tip="正在添加矿池..."
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
