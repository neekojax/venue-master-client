import { useEffect } from "react";
import { Form, type FormInstance, Input } from "antd";
import type { CustodyInfoNew } from "../type";

import { t } from "@/locales";

interface EditFormProps {
  initialValues: CustodyInfoNew;
  onFormInstanceReady: (instance: FormInstance<CustodyInfoNew>) => void;
}

const formFields = [
  { label: t("场地"), name: "venue_name" },
  { label: t("子账号"), name: "sub_account_name" },
  { label: t("观察者链接"), name: "observer_link" },
  { label: t("能耗比"), name: "energy_ratio" },
  { label: t("基础托管费"), name: "basic_hosting_fee" },
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
          rules={[{ required: true, message: t("请输入{{label}}", { label: field.label }) }]}
        >
          <Input placeholder={t("输入{{label}}", { label: field.label })} />
        </Form.Item>
      ))}
    </Form>
  );
}
