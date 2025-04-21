import { Alert, Spin, Table, Tag } from "antd";

import AddVenueTemplateButton from "@/pages/base/components/add-button.tsx";
import DeleteButton from "@/pages/base/components/delete-button.tsx";
import EditButton from "@/pages/base/components/edit-button.tsx";
import { useVenueTemplates } from "@/pages/base/hook/hook.ts";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";

export default function BasePage() {
  useAuthRedirect();

  const { data, error, isLoading } = useVenueTemplates();

  // Loading 状态
  if (isLoading) {
    return <Spin tip="加载中..." />;
  }

  // 错误状态
  if (error) {
    return <Alert message="错误" description={error.message} type="error" showIcon />;
  }

  // 创建一个空的数据对象
  const emptyData = {
    key: 0, // 空的 ID
    serialNumber: 0, // 空的序号
    templateName: "", // 空的模板名称
    fields: [], // 空的字段信息
  };

  // 处理表格数据
  const tableData = (Array.isArray(data.data) ? data.data : []).map(
    (item: { ID: any; TemplateName: any; FieldInfo: any }, index: number) => {
      return {
        key: item.ID, // 使用项目的 ID 作为唯一 key
        serialNumber: index + 1, // 序号，从 1 开始
        templateName: item.TemplateName, // 模板名称
        fields: item.FieldInfo, // 提取字段名称并转为逗号分隔的字符串
      };
    },
  );

  // 定义表格列
  const columns = [
    {
      title: "序号",
      dataIndex: "serialNumber",
      key: "serialNumber",
      // 如果需要，可以添加排序功能
    },
    {
      title: "模板名称",
      dataIndex: "templateName",
      key: "templateName",
    },
    {
      title: "字段",
      key: "fields",
      render: (_text: any, record: { fields: any }) => (
        <>
          {record.fields.length > 0 ? (
            record.fields.map((field, index) => (
              <Tag key={index} color="blue" style={{ marginRight: 4 }}>
                {field.FieldName}
              </Tag>
            ))
          ) : (
            <span>无字段</span>
          )}
        </>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_text: any, record: { key: any }) => (
        <>
          <EditButton data={record} />
          <DeleteButton data={record} />
        </>
      ),
    },
  ];

  return (
    <div>
      <AddVenueTemplateButton data={emptyData} />

      <Table
        dataSource={tableData}
        columns={columns}
        rowKey="key"
        pagination={{
          position: ["bottomCenter"], // 将分页器放在底部居中
          showSizeChanger: true, // 显示大小选择器
          pageSizeOptions: ["10", "20", "50"], // 自定义页大小选项
        }}
        className="mt-4"
      />
    </div>
  );
}
