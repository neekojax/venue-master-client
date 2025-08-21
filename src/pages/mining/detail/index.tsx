import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, DatePicker, Form, Input, message, Modal, Popconfirm, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import {
  usePoolRecordCreate,
  usePoolRecordDelete,
  usePoolRecordList,
  usePoolRecordUpdate,
} from "@/pages/mining/hook.ts";
import type { PoolRecordCreate, PoolRecordUpdate } from "@/pages/mining/type.tsx";

type PoolRecord = {
  id: number;
  venue_id: number;
  pool_id: number;
  start_time: string;
  end_time: string;
  theoretical_hashrate: number;
  hosted_machine: number;
};

const MiningDetail: React.FC = () => {
  const params = useParams<{ venueId: string; poolId: string }>();
  const venueId = params.venueId!;
  const poolId = params.poolId!;

  const { data, isLoading } = usePoolRecordList(poolId);
  const createMutation = usePoolRecordCreate();
  const updateMutation = usePoolRecordUpdate();
  const deleteMutation = usePoolRecordDelete();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PoolRecord | null>(null);
  const [form] = Form.useForm<PoolRecordCreate | PoolRecordUpdate>();

  const records: PoolRecord[] = useMemo(() => (data?.data ?? []) as PoolRecord[], [data]);

  const openCreate = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
    form.resetFields();
    form.setFieldsValue({ venue_id: Number(venueId), pool_id: Number(poolId) } as any);
  };

  const openEdit = (record: PoolRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
    form.setFieldsValue({
      id: record.id as any,
      venue_id: record.venue_id,
      pool_id: record.pool_id,
      start_time: dayjs(record.start_time),
      end_time: dayjs(record.end_time),
      theoretical_hashrate: record.theoretical_hashrate,
      hosted_machine: record.hosted_machine,
    } as any);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      // ...values,
      venue_id: Number(venueId),
      pool_id: Number(poolId),
      hosted_machine: Number(values.hosted_machine),
      theoretical_hashrate: Number(values.theoretical_hashrate),
      start_time:
        typeof values.start_time === "string"
          ? values.start_time
          : dayjs(values.start_time).format("YYYY-MM-DD HH:mm:ss"),
      end_time:
        typeof values.end_time === "string"
          ? values.end_time
          : dayjs(values.end_time).format("YYYY-MM-DD HH:mm:ss"),
    } as PoolRecordCreate & PoolRecordUpdate;

    try {
      if (editingRecord) {
        await updateMutation.mutateAsync({ ...(payload as PoolRecordUpdate), id: editingRecord.id });
        message.success("已更新");
      } else {
        await createMutation.mutateAsync(payload as PoolRecordCreate);
        message.success("已新增");
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (e) {
      // 已在 hook 中处理 onError
      console.log(e);
    }
  };

  const handleDelete = async (record: PoolRecord) => {
    try {
      await deleteMutation.mutateAsync(record.id);
      message.success("已删除");
    } catch (e) {
      // 已在 hook 中处理 onError
      console.log(e);
    }
  };

  const columns: ColumnsType<PoolRecord> = [
    { title: "开始时间", dataIndex: "start_time", key: "start_time" },
    { title: "结束时间", dataIndex: "end_time", key: "end_time" },
    { title: "理论算力", dataIndex: "theoretical_hashrate", key: "theoretical_hashrate" },
    { title: "托管机器", dataIndex: "hosted_machine", key: "hosted_machine", align: "right" },
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
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-lg font-semibold">
          操作记录（venueId: {venueId}, poolId: {poolId}）
        </div>
        <Button type="primary" onClick={openCreate}>
          新增记录
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={records}
        pagination={{ pageSize: 20 }}
      />

      <Modal
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
            label="理论算力"
            name="theoretical_hashrate"
            rules={[{ required: true, message: "请输入理论算力" }]}
          >
            <Input type="number" placeholder="请输入理论算力" />
          </Form.Item>
          <Form.Item
            label="托管机器"
            name="hosted_machine"
            rules={[{ required: true, message: "请输入托管机器" }]}
          >
            <Input type="number" placeholder="请输入托管机器" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MiningDetail;
