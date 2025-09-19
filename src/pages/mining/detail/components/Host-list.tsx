import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Switch,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import {
  useHostRecordCreate,
  useHostRecordDelete,
  useHostRecordList,
  useHostRecordUpdate,
} from "@/pages/mining/hook.ts";
import type { HostRecordCreate, HostRecordUpdate } from "@/pages/mining/type.tsx";

export type HostRecord = {
  id: number; // ID
  venue_id: number; // 场馆ID
  pool_id: number; // 矿池ID
  start_time: string; // 开始时间
  end_time: string; // 结束时间
  hosting_price: number; // 托管单价
  hosting_expiry_date: string; // 托管到期日
  maintenance_price: number; // 运维单价
  power_consumption: number; // 功耗
  is_in_consignment: boolean; // 是否在寄售期
};

const HostList: React.FC = () => {
  const params = useParams<{ venueId: string; poolId: string }>();
  const venueId = params.venueId!;
  const poolId = params.poolId!;

  const { data, isLoading } = useHostRecordList(poolId);
  const createMutation = useHostRecordCreate();
  const updateMutation = useHostRecordUpdate();
  const deleteMutation = useHostRecordDelete();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HostRecord | null>(null);
  const [form] = Form.useForm<HostRecordCreate | HostRecordUpdate>();

  const records: HostRecord[] = useMemo(() => (data?.data ?? []) as HostRecord[], [data]);

  const openCreate = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
    form.resetFields();
    form.setFieldsValue({ venue_id: Number(venueId), pool_id: Number(poolId) } as any);
  };

  const openEdit = (record: HostRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
    form.setFieldsValue({
      id: record.id as any,
      venue_id: record.venue_id,
      pool_id: record.pool_id,
      start_time: dayjs(record.start_time),
      end_time: dayjs(record.end_time),
      hosting_price: record.hosting_price, // 托管单价
      hosting_expiry_date: dayjs(record.hosting_expiry_date), // 托管到期日
      maintenance_price: record.maintenance_price, // 运维单价
      power_consumption: record.power_consumption, // 功耗
      is_in_consignment: record.is_in_consignment, // 是否在寄售期
    } as any);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      // ...values,
      venue_id: Number(venueId),
      pool_id: Number(poolId),
      hosting_price: Number(values.hosting_price),
      maintenance_price: Number(values.maintenance_price),
      power_consumption: Number(values.power_consumption),
      is_in_consignment: values.is_in_consignment,

      hosting_expiry_date:
        typeof values.hosting_expiry_date === "string"
          ? values.hosting_expiry_date
          : dayjs(values.hosting_expiry_date).format("YYYY-MM-DD HH:mm:ss"),

      start_time:
        typeof values.start_time === "string"
          ? values.start_time
          : dayjs(values.start_time).format("YYYY-MM-DD HH:mm:ss"),
      end_time:
        typeof values.end_time === "string"
          ? values.end_time
          : dayjs(values.end_time).format("YYYY-MM-DD HH:mm:ss"),
    } as HostRecordCreate & HostRecordUpdate;

    try {
      if (editingRecord) {
        await updateMutation.mutateAsync({ ...(payload as HostRecordUpdate), id: editingRecord.id });
        message.success("已更新");
      } else {
        await createMutation.mutateAsync(payload as HostRecordCreate);
        message.success("已新增");
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (e) {
      // 已在 hook 中处理 onError
      console.log(e);
    }
  };

  const handleDelete = async (record: HostRecord) => {
    try {
      await deleteMutation.mutateAsync(record.id);
      message.success("已删除");
    } catch (e) {
      // 已在 hook 中处理 onError
      console.log(e);
    }
  };

  const columns: ColumnsType<HostRecord> = [
    { title: "开始时间", dataIndex: "start_time", key: "start_time" },
    { title: "结束时间", dataIndex: "end_time", key: "end_time" },
    { title: "托管价格", dataIndex: "hosting_price", key: "hosting_price" },
    { title: "托管到期日", dataIndex: "hosting_expiry_date", key: "hosting_expiry_date" },
    { title: "运维价格", dataIndex: "maintenance_price", key: "maintenance_price" },
    { title: "功耗", dataIndex: "power_consumption", key: "power_consumption" },
    {
      title: "是否寄售期",
      dataIndex: "is_in_consignment",
      key: "is_in_consignment",
      render: (value: boolean) => (value ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>),
    },
    {
      title: "操作",
      key: "action",
      width: 160,
      render: (_, record) => (
        <div className="flex gap-3">
          <a onClick={() => openEdit(record)}>修改</a>
          <Popconfirm
            title="确认删除该记录？"
            onConfirm={() => handleDelete(record)}
            okText="删除"
            cancelText="取消"
          >
            <a>删除</a>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        {/* <div className="text-lg font-semibold">托管信息</div> */}
        <div></div>
        <Button type="primary" size="small" onClick={openCreate}>
          + 新增记录
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={records}
        pagination={{ pageSize: 20 }}
      />

      {/* <Modal
                title={editingRecord ? "编辑记录" : "新增记录"}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
                destroyOnClose
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Form.Item
                        label="开始时间"
                        name="start_time"
                        rules={[{ required: true, message: "请选择开始时间" }]}
                    >
                        <DatePicker showTime style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item label="结束时间" name="end_time" rules={[{ required: true, message: "请选择结束时间" }]}>
                        <DatePicker showTime style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label="托管单价"
                        name="hosting_price"
                        rules={[{ required: true, message: "请输入托管单价" }]}
                    >
                        <Input type="number" placeholder="请输入托管单价" />
                    </Form.Item>
                    <Form.Item
                        label="运维单价"
                        name="maintenance_price"
                        rules={[{ required: true, message: "请输入运维单价" }]}
                    >
                        <Input type="number" placeholder="请输入运维单价" />
                    </Form.Item>

                    <Form.Item
                        label="功耗"
                        name="power_consumption"
                        rules={[{ required: true, message: "请输入功耗" }]}
                    >
                        <Input type="number" placeholder="请输入功耗" />
                    </Form.Item>

                    <Form.Item
                        label="是否在寄售期"
                        name="is_in_consignment"
                        valuePropName="checked"   // 必须要写，不然 Form 拿不到 boolean
                        rules={[{ required: true, message: "请选择是否在寄售期" }]}
                    >
                        <Switch checkedChildren="是" unCheckedChildren="否" />
                    </Form.Item>是否在寄售期

                    <Form.Item
                        label="托管到期日"
                        name="hosting_expiry_date"
                        rules={[{ required: true, message: "请输入托管到期日" }]}
                    >
                        <DatePicker showTime style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal> */}

      <Modal
        title={editingRecord ? "编辑记录" : "新增记录"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="开始时间"
                name="start_time"
                rules={[{ required: true, message: "请选择开始时间" }]}
              >
                <DatePicker size="middle" showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="结束时间"
                name="end_time"
                rules={[{ required: true, message: "请选择结束时间" }]}
              >
                <DatePicker size="middle" showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="托管单价"
                name="hosting_price"
                rules={[{ required: true, message: "请输入托管单价" }]}
              >
                <Input size="middle" type="number" placeholder="请输入托管单价" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="运维单价"
                name="maintenance_price"
                rules={[{ required: true, message: "请输入运维单价" }]}
              >
                <Input size="middle" type="number" placeholder="请输入运维单价" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="功耗"
                name="power_consumption"
                rules={[{ required: true, message: "请输入功耗" }]}
              >
                <Input size="middle" type="number" placeholder="请输入功耗" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="是否在寄售期"
                name="is_in_consignment"
                valuePropName="checked"
                rules={[{ required: true, message: "请选择是否在寄售期" }]}
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="托管到期日"
                name="hosting_expiry_date"
                rules={[{ required: true, message: "请输入托管到期日" }]}
              >
                <DatePicker size="middle" showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default HostList;
