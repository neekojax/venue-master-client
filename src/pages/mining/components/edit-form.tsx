import { useEffect } from "react";
import { Form, type FormInstance, Input, Select } from "antd";
import type { MiningPool } from "../type.tsx";

const { Option } = Select;

interface EditFormProps {
  initialValues: MiningPool;
  onFormInstanceReady: (instance: FormInstance<MiningPool>) => void;
}

const formFields = [
  { label: "账户", name: "pool_name", component: Input },
  {
    label: "场地主体",
    name: "pool_type",
    component: Select,
    options: [
      { value: "NS", label: "NS" },
      { value: "CANG", label: "CANG" },
    ],
  },
  {
    label: "场地类型",
    name: "pool_category",
    component: Select,
    options: [
      { value: "主矿池", label: "主矿池" },
      { value: "备用矿池", label: "备用矿池" },
    ],
  },
  {
    label: "所属国家",
    name: "country",
    component: Input,
  },
  {
    label: "理论算力",
    name: "theoretical_hashrate",
    component: Input,
  },
  { label: "链接", name: "link", component: Input },
];

export default function EditForm({ initialValues, onFormInstanceReady }: EditFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    onFormInstanceReady(form);
  }, [form, onFormInstanceReady]);

  return (
    <Form
      layout="horizontal"
      form={form}
      name="form_in_modal"
      initialValues={initialValues}
      preserve={false}
      labelAlign="left"
      labelCol={{ flex: "100px" }}
      wrapperCol={{ flex: 10 }}
      className="mt-4"
    >
      {formFields.map((field) => (
        <Form.Item
          key={field.name}
          label={field.label}
          name={field.name}
          rules={[{ required: true, message: `请输入${field.label}` }]}
        >
          {field.component === Select ? (
            <Select placeholder={`请选择 ${field.label}`}>
              {field.options?.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          ) : (
            <Input
              placeholder={`请输入${field.label}`}
              type={field.name === "theoretical_hashrate" ? "number" : "text"} // 设置为数字输入框
            />
          )}
        </Form.Item>
      ))}
    </Form>
  );
}
