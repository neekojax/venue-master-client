import { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Input, message, Space, Spin } from "antd";
import ActionButton, { ActionButtonMode } from "@/components/action-button";
import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";

import EditForm from "@/pages/venue/components/edit-form.tsx";
import TemplateSelect from "@/pages/venue/components/select.tsx";
import {
  useVenueRecord,
  useVenueRecordDelete,
  useVenueRecordNew,
  useVenueRecordUpdate,
  useVenueTemplateFields,
  useVenueTemplateList,
} from "@/pages/venue/hook/hook.ts";
import { type Values, type VenueRecordNew, VenueRecordUpdate } from "@/pages/venue/venue-order/type.ts";

export default function VenuePage() {
  useAuthRedirect();

  const { data: templates, isLoading: isLoadingTemplates } = useVenueTemplateList();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null); // 选择模板的状态为 number 或 null
  const { data: fields, isLoading: isLoadingFields } = useVenueTemplateFields(selectedTemplate);
  const { data: fieldsData } = useVenueRecord(selectedTemplate);
  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 新增搜索状态

  useEffect(() => {
    // 默认选择第一个模板
    const savedTemplateId = localStorage.getItem("selectedTemplate");
    if (savedTemplateId) {
      const parsedId = Number(savedTemplateId);
      const templateExists = templates?.data.some((template: { ID: any }) => template.ID === parsedId);
      if (templateExists) {
        setSelectedTemplate(parsedId); // 设置已保存的模板 ID
      } else {
        // 如果 savedTemplateId 不在 templates 中，选择第一个模板
        if (templates?.data.length > 0) {
          // @ts-ignore
          setSelectedTemplate(templates.data[0].ID);
          // @ts-ignore
          localStorage.setItem("selectedTemplate", templates.data[0].ID.toString()); // 保存到 localStorage
        }
      }

      setSelectedTemplate(Number(savedTemplateId)); // 设置已保存的模板 ID
    } else if (templates?.data.length > 0 && !selectedTemplate) {
      // @ts-ignore
      setSelectedTemplate(templates.data[0].ID);
      // @ts-ignore
      localStorage.setItem("selectedTemplate", templates.data[0].ID.toString()); // 保存到 localStorage
    }
  }, [templates]);

  useEffect(() => {
    // 设置表头
    if (fields && fields.data && fields.data.length > 0) {
      const cols = fields.data.map((field: any) => ({
        title: field.FieldName,
        dataIndex: field.ID,
        key: field.ID,
      }));
      cols.push({
        title: "操作",
        valueType: "option",
        key: "operation", // 为操作列提供一个唯一的 key
      });
      setColumns(cols);
    }
  }, [fields]);

  useEffect(() => {
    // 如果获取了 fieldsData 数据
    if (fieldsData && fieldsData.data) {
      const newData = Object.keys(fieldsData.data).reduce(
        (acc, key) => {
          const items = fieldsData.data[key]; // 获取每个模版 ID 对应的字段数组
          // 更新 rowData 的定义
          const rowData: Record<number, any> & { key: number } = { key: Number(key) }; // 创建一行的数据对象，并添加索引签名

          items.forEach((item: { field_id: number; field_name: string; field_value: string }) => {
            rowData[item.field_id] = item.field_value; // 将 field_id 和 field_value 放入行数据中
          });

          acc.push(rowData); // 将行数据添加到累加器
          return acc;
        },
        [] as Array<Record<number, any> & { key: number }>,
      ); // 设定累加器的类型

      setTableData(newData); // 设置表格数据源
    }
  }, [fieldsData]);

  const handleTemplateChange = (templateId: number) => {
    setSelectedTemplate(templateId);
    localStorage.setItem("selectedTemplate", templateId.toString()); // 更新 localStorage
  };

  // 搜索处理函数
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const deleteMutation = useVenueRecordDelete();
  const updateMutation = useVenueRecordUpdate();
  const newMutation = useVenueRecordNew();

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
    const venueRecordUpdate: VenueRecordUpdate = {
      RecordID: rowKey as number, // 假设 rowKey 是 RecordID
      Fields: Object.keys(data)
        .filter((key) => key !== "index" && key !== "key") // 过滤掉 index 和 key
        .map((key) => ({
          ID: parseInt(key), // 将 key 转换为数字，假设它是字段的 ID
          FieldName: "", // 这里假设 key 就是 FieldName
          Value: data[key] as string, // 从 data 中获取对应的值
        })),
    };
    return new Promise(() => {
      updateMutation.mutate(venueRecordUpdate, {
        onSuccess: () => {
          message.success("更新记录成功");
        },
        onError: (error) => {
          message.error(`更新记录失败: ${error.message}`);
        },
      });
    });
  };

  // 根据搜索词过滤数据
  const filteredData = tableData.filter((item: { [s: string]: unknown } | ArrayLike<unknown>) => {
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  });

  const transformDataToValues = (templates: any, selectedTemplate: any, fields: any): Values => {
    const templateNames = templates
      .filter((template: any) => template.ID === selectedTemplate)
      .map((template: any) => template.TemplateName);
    const templateName = templateNames.length > 0 ? templateNames[0] : null; // 获取第一个模板名称或 null
    return {
      templateName: templateName || "",
      fields: fields?.map((field: any) => ({
        ID: field.ID,
        FieldName: field.FieldName || "", // 提供默认值
        Value: "",
      })),
    };
  };

  const handleSubmit = async (values: Values) => {
    const newVenueRecord: VenueRecordNew = {
      templateID: selectedTemplate ? selectedTemplate : 0,
      fields: values.fields,
    };
    newMutation.mutate(newVenueRecord, {
      onSuccess: () => {
        message.success("添加成功");
        // setOpen(false);
      },
      onError: (error) => {
        message.error(`添加失败: ${error.message}`);
      },
    });
  };

  // @ts-ignore
  return (
    <div style={{ padding: "20px" }}>
      {isLoadingTemplates ? (
        <Spin />
      ) : (
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
        >
          <Space size={24}>
            <TemplateSelect
              templates={templates?.data}
              selectedTemplate={selectedTemplate}
              onTemplateChange={handleTemplateChange}
            />

            <ActionButton
              label={"添加数据"}
              initialValues={transformDataToValues(
                templates?.data || [],
                selectedTemplate,
                fields?.data || [],
              )}
              onSubmit={handleSubmit}
              FormComponent={EditForm}
              mode={ActionButtonMode.ADD}
            />
          </Space>
          <Input
            prefix={<SearchOutlined style={{ color: "rgba(0, 0, 0, 0.25)" }} size={18} />}
            placeholder="请输入搜索字段"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: 250 }} // 设定宽度
            className="text-sm mr-24"
          />
        </div>
      )}

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
