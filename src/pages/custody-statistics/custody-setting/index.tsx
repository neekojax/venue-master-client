import { useEffect, useState } from "react";
import { Alert, Input, message, Space, Spin } from "antd";
import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { getShortenedLink } from "@/utils/short-link.ts";
import ActionButton, { ActionButtonMode } from "@/components/action-button";
import { FaAdn, FaFish } from "react-icons/fa6";

import {
  useCustodyInfoDelete,
  useCustodyInfoList,
  useCustodyInfoNew,
  useCustodyInfoUpdate,
} from "@/pages/custody-statistics/hook/hook.ts";
import { CustodyInfoUpdate, CustodyInfoNew } from "@/pages/custody-statistics/type.tsx";
import EditForm from "@/pages/custody-statistics/components/edit-form.tsx";

// 创建一个空的数据对象
const emptyData = {
  id: 0,
  venue_name: "",
  sub_account_name: "",
  observer_link: "",
  energy_ratio: "",
  basic_hosting_fee: "",
};

export default function SettingPage() {
  useAuthRedirect();

  const { data: linksData, error, isLoading: isLoadingFields } = useCustodyInfoList();
  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 新增搜索状态

  const updateMutation = useCustodyInfoUpdate();
  const deleteMutation = useCustodyInfoDelete();
  const newMutation = useCustodyInfoNew();

  useEffect(() => {
    if (linksData && linksData.data) {
      const newData = linksData.data.map(
        (
          item: {
            id: any;
            venue_name: any;
            sub_account_name: any;
            observer_link: any;
            energy_ratio: any;
            basic_hosting_fee: any;
          },
          index: any,
        ) => ({
          key: item.id, // 使用 ID 作为唯一 key
          serialNumber: index + 1,
          venue_name: item.venue_name,
          sub_account_name: item.sub_account_name,
          observer_link: item.observer_link,
          energy_ratio: item.energy_ratio,
          basic_hosting_fee: item.basic_hosting_fee,
        }),
      );
      setTableData(newData); // 设置表格数据源
    }
  }, [linksData]);

  // 表头定义
  useEffect(() => {
    setColumns([
      {
        // title: "序号", // 使用英文标题
        dataIndex: "serialNumber",
        key: "serialNumber",
        width: 40,
        editable: false,
        render: (_, record) => {
          const { observer_link } = record;
          // 根据 observer_link 内容返回不同的图标
          if (observer_link.includes("antpool")) {
            return <FaAdn style={{ color: "green", fontSize: 18 }} />;
          } else if (observer_link.includes("f2pool")) {
            return <FaFish style={{ color: "blue", fontSize: 18 }} />;
          } else {
            return <span>{record.serialNumber}</span>; // 如果没有匹配，则返回序号
          }
        },
      },
      {
        title: "场地",
        dataIndex: "venue_name",
        key: "venue_name",
      },
      {
        title: "子账号",
        dataIndex: "sub_account_name",
        key: "sub_account_name",
      },
      {
        title: "观察者链接",
        dataIndex: "observer_link",
        key: "observer_link",
        width: 300,
        render: (link: string) => (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "blue"}}
            title={link} // 悬停显示完整链接
          >
            {link.length > 40 ? getShortenedLink(link) : link}
          </a>
        ),
      },
      {
        title: "能耗比（J/T）",
        dataIndex: "energy_ratio",
        key: "energy_ratio",
      },
      {
        title: "基础托管费（$/kwh）",
        dataIndex: "basic_hosting_fee",
        key: "basic_hosting_fee",
      },
      {
        title: "操作",
        valueType: "option",
        key: "operation",
      },
    ]);
  }, []);

  // Loading 状态
  if (isLoadingFields) {
    return <Spin tip="加载中..." />;
  }

  // 错误状态
  if (error) {
    return <Alert message="错误" description={error.message} type="error" showIcon />;
  }

  // 搜索处理函数
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (recordId: number) => {
    deleteMutation.mutate(recordId, {
      onSuccess: () => {
        message.success("删除记录成功");
      },
      onError: (error) => {
        message.error(`删除记录失败: ${error.message}`);
      },
    });
  };

  const handleSave = (rowKey: number, data: { [x: string]: string }) => {
    const custodyInfoUpdate: CustodyInfoUpdate = {
      id: rowKey as number, // 假设 rowKey 是 RecordID
      venue_name: data.venue_name,
      sub_account_name: data.sub_account_name,
      observer_link: data.observer_link,
      energy_ratio: data.energy_ratio,
      basic_hosting_fee: data.basic_hosting_fee,
    };

    updateMutation.mutate(custodyInfoUpdate, {
      onSuccess: () => {
        message.success("更新成功");
      },
      onError: (error) => {
        message.error(`更新失败: ${error.message}`);
      },
    });
  };

  // 根据搜索词过滤数据
  const filteredData = tableData.filter((item: { [s: string]: unknown } | ArrayLike<unknown>) => {
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  });

  const handleNewCustodyInfo = async (values: CustodyInfoNew) => {
    newMutation.mutate(values, {
      onSuccess: () => {
        message.success("添加成功");
      },
      onError: (error) => {
        message.error(`添加失败: ${error.message}`);
      },
    });
  };

  // @ts-ignore
  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
      >
        <Space size={24}>
          <ActionButton
            label={"添加基础数据"}
            initialValues={emptyData}
            onSubmit={handleNewCustodyInfo}
            FormComponent={EditForm}
            mode={ActionButtonMode.ADD}
          />
        </Space>
        <Input
          placeholder="请输入搜索字段"
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: 250 }} // 设定宽度
          className="text-sm mr-24"
        />
      </div>

      {isLoadingFields ? (
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
