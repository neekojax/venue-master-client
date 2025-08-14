import { useEffect } from "react";
import { Form, type FormInstance, Input, Select } from "antd";
import type { MiningPool } from "../type.tsx";
import { useSelector, useSettingsStore } from "@/stores";

import { useVenueList } from "@/pages/venue/hook/hook.ts";

const { Option } = Select;

interface EditFormProps {
  initialValues: MiningPool;
  onFormInstanceReady: (instance: FormInstance<MiningPool>) => void;
}

//
const formFields = [
  { label: "场地", name: "venue_id", component: Select },
  { label: "子账户", name: "pool_name", component: Input },
  { label: "场地主体", name: "pool_type", component: Input },
  // {
  //   label: "场地主体",
  //   name: "pool_type",
  //   component: Select,
  //   options: [
  //     { value: "CANG", label: "CANG" },
  //     { value: "NS", label: "NS" },
  //     { value: "ND", label: "ND" },
  //     { value: "KZ", label: "KZ" },
  //   ],
  // },
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
  {
    label: "能耗比",
    name: "energy_ratio",
    component: Input,
  },
  {
    label: "基础托管费",
    name: "basic_hosting_fee",
    component: Input,
  },
  { label: "主链接", name: "master_link", component: Input },
  { label: "备用链接", name: "backup_link", component: Input },
];

export default function EditForm({ initialValues, onFormInstanceReady }: EditFormProps) {
  const [form] = Form.useForm();
  const showNDPoolType = useSettingsStore((state) => state.poolType);
  useEffect(() => {
    form.setFieldsValue({ pool_type: showNDPoolType });
    // if (showNDPoolType == "CANG") {
    //   form.setFieldsValue({ pool_type: 'CANGO' });
    // }
  }, [showNDPoolType]);

  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const { data: venueList } = useVenueList(poolType);

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
          {field.component === Select && field.name === "venue_id" ? (
            // 使用 venueList 渲染场地选择
            <Select placeholder={`请选择 ${field.label}`}>
              {venueList?.data?.map((venue: { id: number; venue_name: string }) => (
                <Option key={venue.id} value={venue.id}>
                  {" "}
                  {/* 使用 venue.id 和 venue.venue_name */}
                  {venue.venue_name}
                </Option>
              ))}
            </Select>
          ) : (
            // : field.component === Select ? (
            //   <Select placeholder={`请选择 ${field.label}`}>
            //     {field.options?.map((option) => (
            //       <Option key={option.value} value={option.value}>
            //         {option.label}
            //       </Option>
            //     ))}
            //   </Select>
            // )
            <Input
              placeholder={`请输入${field.label}`}
              disabled={field.name === "pool_type"}
              // value={field.value}
              type={
                field.name === "theoretical_hashrate" ||
                field.name === "energy_ratio" ||
                field.name === "basic_hosting_fee"
                  ? "number"
                  : "text"
              }
            />
          )}
        </Form.Item>
      ))}
    </Form>
  );
}
