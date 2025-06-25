import { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Alert, Input, Space, Spin } from "antd";
import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { getShortenedLink } from "@/utils/short-link.ts";

import { useLinkList } from "@/pages/nest-menu/hook/hook.ts";

export default function LinkPage() {
  useAuthRedirect();

  const { data: linksData, error, isLoading: isLoadingFields } = useLinkList();
  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 新增搜索状态

  useEffect(() => {
    if (linksData && linksData.data) {
      const newData = linksData.data.map(
        (
          item: { id: any; site_name: any; sub_account: any; antpool_link: any; f2pool_link: any },
          index: any,
        ) => ({
          key: item.id, // 使用 ID 作为唯一 key
          serialNumber: index + 1,
          site_name: item.site_name,
          sub_account: item.sub_account,
          antpool_link: item.antpool_link,
          f2pool_link: item.f2pool_link,
        }),
      );
      setTableData(newData); // 设置表格数据源
    }
  }, [linksData]);

  // 表头定义
  useEffect(() => {
    setColumns([
      {
        title: "序号", // 使用英文标题
        dataIndex: "serialNumber",
        key: "serialNumber",
      },
      {
        title: "场地",
        dataIndex: "site_name",
        key: "site_name",
      },
      {
        title: "子账号",
        dataIndex: "sub_account",
        key: "sub_account",
      },
      {
        title: "AntPool链接",
        dataIndex: "antpool_link",
        key: "antpool_link",
        width: 300,
        render: (link: string) => (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#252F4A", textDecoration: "underline" }}
          >
            {link.length > 40 ? getShortenedLink(link) : link}
          </a>
        ),
      },
      {
        title: "F2Pool链接",
        dataIndex: "f2pool_link",
        key: "f2pool_link",
        width: 300,
        render: (link: string) => (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#252F4A", textDecoration: "underline" }}
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

  const handleDelete = (): Promise<void> => {
    return new Promise(() => {});
  };

  const handleSave = (): Promise<void> => {
    return new Promise(() => {});
  };

  // 根据搜索词过滤数据
  const filteredData = tableData.filter((item: { [s: string]: unknown } | ArrayLike<unknown>) => {
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  });

  // @ts-ignore
  // @ts-ignore
  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
      >
        <Space size={24}></Space>
        <Input
          prefix={<SearchOutlined style={{ color: "rgba(0, 0, 0, 0.25)", fontSize: 18 }} />}
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
