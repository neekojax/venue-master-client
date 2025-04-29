import { useEffect } from "react";
import { Form, type FormInstance, Input } from "antd";
import type { CustodyInfoNew } from "../type";

interface EditFormProps {
  initialValues: CustodyInfoNew;
  onFormInstanceReady: (instance: FormInstance<CustodyInfoNew>) => void;
}

const formFields = [
  { label: "场地", name: "venue_name" },
  { label: "子账号", name: "sub_account_name" },
  { label: "观察者链接", name: "observer_link" },
  { label: "能耗比", name: "energy_ratio" },
  { label: "基础托管费", name: "basic_hosting_fee" },
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
          <Input placeholder={`输入${field.label}`} />
        </Form.Item>
      ))}
    </Form>
  );
}
