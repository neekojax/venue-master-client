import { useEffect, useState } from "react";
import { Form, type FormInstance, Input } from "antd";
import type { Field, Values } from "../type";

interface EditFormProps {
  initialValues: Values;
  onFormInstanceReady: (instance: FormInstance<Values>) => void;
}

export default function EditForm({ initialValues, onFormInstanceReady }: EditFormProps) {
  const [form] = Form.useForm();
  const [fields, setFields] = useState<Field[]>(initialValues.fields || []);

  useEffect(() => {
    onFormInstanceReady(form);
  }, [form, onFormInstanceReady]);

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = { ID: newFields[index].ID, FieldName: newFields[index].FieldName, Value: value }; // 标记为修改
    setFields(newFields);
    form.setFieldsValue({ fields: newFields }); // 仅更新值
  };

  return (
    <Form
      layout="horizontal"
      form={form}
      name="form_in_modal"
      initialValues={initialValues}
      preserve={false}
      labelAlign="left"
      labelCol={{ flex: "40px" }}
      wrapperCol={{ flex: 10 }}
      className="mt-4"
    >
      <Form.Item
        name="templateName"
        label="模版名称"
        labelCol={{ span: 6 }} // 设置标签宽度
        wrapperCol={{ span: 13 }} // 设置输入框宽度
      >
        <Input value={initialValues.templateName} disabled />
      </Form.Item>
      <Form.Item name="fields" label={null} rules={[{ required: true }]}>
        {initialValues.fields.map((field, index) => (
          <Form.Item
            key={field.ID}
            label={field.FieldName}
            name={field.FieldName}
            rules={[{ required: true, message: `请输入 ${field.FieldName} 的值` }]}
            labelCol={{ span: 6 }} // 设置标签宽度
            wrapperCol={{ span: 13 }} // 设置输入框宽度
            style={{ marginBottom: 15 }}
          >
            <Input
              placeholder={`输入 ${field.FieldName}`}
              onChange={(e) => updateField(index, e.target.value)}
            />
          </Form.Item>
        ))}
      </Form.Item>
    </Form>
  );
}
