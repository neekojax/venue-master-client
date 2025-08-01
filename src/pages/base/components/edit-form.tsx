import { useEffect, useState } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, type FormInstance, Input, Space } from "antd";
import type { Field, Values } from "../type";

interface EditFormProps {
  initialValues: Values;
  onFormInstanceReady: (instance: FormInstance<Values>) => void;
}

export default function EditForm({ initialValues, onFormInstanceReady }: EditFormProps) {
  const [form] = Form.useForm();
  // const [hasChanged, setHasChanged] = useState(false);
  const [fields, setFields] = useState<Field[]>(initialValues.fields || []);
  const [templateName, setTemplateName] = useState<string>(initialValues.templateName);

  useEffect(() => {
    onFormInstanceReady(form);
  });

  const addField = () => {
    setFields([
      ...fields,
      {
        value: "",
        FieldName: "",
        status: "new",
        ID: 0,
      },
    ]);
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = {
      ID: newFields[index].ID,
      FieldName: newFields[index].FieldName,
      value: value,
      status: "modified",
    }; // 标记为修改
    setFields(newFields);
    form.setFieldsValue({ fields: newFields }); // 仅更新值
  };

  const removeField = (index: number) => {
    const newFields: Field[] = fields.map((field, i) =>
      i === index ? { ...field, status: "deleted" } : field,
    );
    setFields(newFields);
    form.setFieldsValue({ fields: newFields }); // 更新值
  };

  const handleTemplateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTemplateName(newValue);
    form.setFieldsValue({ templateName: newValue }); // 更新表单中的值
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name="form_in_modal"
      initialValues={initialValues}
      preserve={false}
      labelAlign="left"
      onChange={() => {
        // setHasChanged(true);
      }}
      labelCol={{ flex: "40px" }}
      wrapperCol={{ flex: 1 }}
      className="mt-4"
    >
      <Form.Item name="templateID" style={{ display: "none" }} />
      <Form.Item name="templateName" label="模版名称" rules={[{ required: true, message: "请输入模板名称" }]}>
        <Input value={templateName} onChange={(e) => handleTemplateNameChange(e)} />
      </Form.Item>
      <Form.Item name="fields" label="字段" rules={[{ required: false }]}>
        {fields
          .filter((field) => field.status !== "deleted") // 过滤掉状态为 "deleted" 的字段
          .map((field, index) => (
            <Space key={index} style={{ marginBottom: 8 }}>
              <Input
                value={field.value}
                onChange={(e) => updateField(index, e.target.value)}
                placeholder={`字段 ${index + 1}`}
              />
              <Button
                type="text"
                danger
                icon={<MinusCircleOutlined style={{ color: "red" }} />}
                onClick={() => removeField(index)} // 删除字段
              >
                删除
              </Button>
            </Space>
          ))}
        <div style={{ marginTop: 16 }}>
          <Button
            type="primary"
            style={{ backgroundColor: "#40A9FF", borderColor: "#40A9FF" }} // 设置背景色为绿色
            icon={<PlusOutlined style={{ color: "white" }} />}
            onClick={addField}
          >
            添加字段
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}
