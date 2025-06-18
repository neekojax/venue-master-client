import { Alert, message, Spin, Table, Tag } from "antd";
import { ActionButton, ActionButtonMode } from "@/components/action-button";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";

import DeleteButton from "@/pages/base/components/delete-button.tsx";
import EditForm from "@/pages/base/components/edit-form.tsx";
import {
  useSubmitVenueTemplateChange,
  useSubmitVenueTemplateNew,
  useVenueTemplates,
} from "@/pages/base/hook/hook.ts";
import type { TemplateDataChange, TemplateDataNew, Values } from "@/pages/base/type.ts";

export default function BasePage() {
  useAuthRedirect();

  const { data, error, isLoading } = useVenueTemplates();
  const newTemplateMutation = useSubmitVenueTemplateNew();
  const changeTemplateMutation = useSubmitVenueTemplateChange();

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

  const transformDataToValues = (data: any): Values => {
    return {
      templateID: data.key,
      templateName: data.templateName || "",
      fields: data.fields.map((field: any) => ({
        ID: field.ID,
        value: field.FieldName || "", // 提供默认值
        status: "default", // 提供默认值
      })),
    };
  };

  const handleAddTemplate = async (values: Values) => {
    const templateDataNew: TemplateDataNew = {
      ID: 0,
      templateName: values.templateName,
      fields: values.fields,
    };
    newTemplateMutation.mutate(templateDataNew, {
      onSuccess: () => {
        message.success("模版已成功新增");
      },
      onError: (error) => {
        message.error(`新增失败: ${error.message}`);
      },
    });
  };

  const handleEditTemplate = async (values: Values) => {
    const templateDataChange: TemplateDataChange = {
      ID: values.templateID,
      templateNameBefore: values.templateName,
      templateNameAfter: values.templateName,
      fields: values.fields.map((field) => {
        // 检查 ID，若为 0 则更新 status 为 "new"
        if (field.ID === 0) {
          return { ...field, status: "new" };
        }
        return field; // 否则保持不变
      }),
    };
    changeTemplateMutation.mutate(templateDataChange, {
      onSuccess: () => {
        message.success("模版已成功更新");
      },
      onError: (error) => {
        message.error(`更新失败: ${error.message}`);
      },
    });
  };

  // 处理表格数据
  // @ts-ignore
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
            // @ts-ignore
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
          {/*<EditButton data={record} />*/}
          <ActionButton
            label={""}
            initialValues={transformDataToValues(record)}
            onSubmit={handleEditTemplate}
            FormComponent={EditForm}
            mode={ActionButtonMode.EDIT} // 使用 AddButtonMode.EDIT 进行编辑操作
          />
          <DeleteButton data={record} />
        </>
      ),
    },
  ];

  return (
    <div>
      <ActionButton
        label={"添加模版"}
        // @ts-ignore
        initialValues={emptyData}
        onSubmit={handleAddTemplate}
        FormComponent={EditForm}
        mode={ActionButtonMode.ADD} // 使用 AddButtonMode.EDIT 进行编辑操作
      />

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
