import { useEffect, useState } from "react";
import { Alert, Input, message, Space, Spin, Table, Tag, Tooltip } from "antd";
import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { getShortenedLink } from "@/utils/short-link.ts";

import AddLink from "@/pages/nest-menu/components/add-button.tsx";
import { useLinkList } from "@/pages/nest-menu/hook/hook.ts";
import { useVenueRecordDelete, useVenueRecordUpdate } from "@/pages/venue/hook/hook.ts";
import { VenueRecordUpdate } from "@/pages/venue/type.ts";

// interface TableDataType {
//   key: number;
//   serialNumber: number;
//   site_name: string;
//   sub_account: string;
//   antpool_link: string;
//   f2pool_link: string;
// }

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
            style={{ color: "blue", textDecoration: "underline" }}
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
            style={{ color: "blue", textDecoration: "underline" }}
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

  // 定义表格列
  // const columns = [
  //   {
  //     title: "序号",
  //     dataIndex: "serialNumber",
  //     key: "serialNumber",
  //     // 如果需要，可以添加排序功能
  //   },
  //   {
  //     title: "场地名称",
  //     dataIndex: "siteName",
  //     key: "siteName",
  //   },
  //   {
  //     title: "子账号",
  //     dataIndex: "subAccount",
  //     key: "subAccount",
  //   },
  //   {
  //     title: "AntPool链接",
  //     dataIndex: "antpoolLink",
  //     key: "antpoolLink",
  //     render: (link: string) => (
  //       <Tooltip title={link}>
  //         <a
  //           href={link}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //           style={{ color: "blue", textDecoration: "underline" }}
  //         >
  //           {getShortenedLink(link)}
  //         </a>
  //       </Tooltip>
  //     ),
  //   },
  //   {
  //     title: "F2Pool链接",
  //     dataIndex: "f2poolLink",
  //     key: "f2poolLink",
  //     render: (link: string) => (
  //       <Tooltip title={link}>
  //         <a
  //           href={link}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //           style={{ color: "blue", textDecoration: "underline" }}
  //         >
  //           {getShortenedLink(link)}
  //         </a>
  //       </Tooltip>
  //     ),
  //   },
  //   {
  //     title: "操作",
  //     key: "action",
  //     render: (_text: any, record: { key: any }) => (
  //       <>
  //         {/*<EditButton data={record} />*/}
  //         {/*<DeleteButton data={record} />*/}
  //       </>
  //     ),
  //   },
  // ];

  // const deleteMutation = useVenueRecordDelete();
  // const updateMutation = useVenueRecordUpdate();

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
    // const venueRecordUpdate: VenueRecordUpdate = {
    //   RecordID: rowKey as number, // 假设 rowKey 是 RecordID
    //   Fields: Object.keys(data)
    //     .filter((key) => key !== "index" && key !== "key") // 过滤掉 index 和 key
    //     .map((key) => ({
    //       ID: parseInt(key), // 将 key 转换为数字，假设它是字段的 ID
    //       FieldName: "", // 这里假设 key 就是 FieldName
    //       Value: data[key] as string, // 从 data 中获取对应的值
    //     })),
    // };
    //
    // updateMutation.mutate(venueRecordUpdate, {
    //   onSuccess: () => {
    //     message.success("更新记录成功");
    //   },
    //   onError: (error) => {
    //     message.error(`更新记录失败: ${error.message}`);
    //   },
    // });
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
        <Space size={24}>
          {/*<AddLink*/}
          {/*  // templates={templates}*/}
          {/*  // selectedTemplate={selectedTemplate}*/}
          {/*  // fields={fields?.data}*/}
          {/*  data={}*/}
          {/*/>*/}
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
