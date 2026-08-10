import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { HistoryOutlined, RedoOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  DatePicker,
  Form,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Radio,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";

import {
  useAssetPoolRecordCreate,
  useAssetPoolRecordDelete,
  useAssetPoolRecordList,
  useAssetPoolRecordRebuild,
  useAssetPoolRecordUpdate,
} from "@/pages/mining/hook.ts";
import type { AssetPoolRecord, AssetPoolRecordCreate, AssetPoolRecordUpdate } from "@/pages/mining/type.tsx";

type AssetPoolRecordFormValues = {
  start_time: Dayjs;
  theoretical_hashrate: number;
  hosted_machine: number;
  is_overclocked?: number;
  overclock_hashrate_per_machine?: number;
  leased_power?: number;
  is_cloud_power?: number;
  asset_record_id?: number;
  source_updated_at?: Dayjs;
  base_record_id?: number;
  source_type?: number;
};

const CLOUD_POWER_OPTIONS = [
  { label: "正常", value: 0 },
  { label: "云算力", value: 1 },
  { label: "租赁算力（整条为租赁）", value: 2 },
  { label: "含租赁算力", value: 3 },
  { label: "待撤场", value: 4 },
];

const OVERCLOCK_OPTIONS = [
  { label: "否", value: 0 },
  { label: "是", value: 1 },
];

const SOURCE_TYPE_OPTIONS = [
  { label: "资产同步", value: 1 },
  { label: "手动调整", value: 2 },
];

function renderCloudPowerTag(value: number | undefined) {
  const normalizedValue = Number(value ?? 0);
  const matchedOption = CLOUD_POWER_OPTIONS.find((item) => item.value === normalizedValue);

  const colorMap: Record<number, string> = {
    0: "default",
    1: "blue",
    2: "purple",
    3: "cyan",
    4: "volcano",
  };

  return <Tag color={colorMap[normalizedValue] ?? "default"}>{matchedOption?.label ?? "正常"}</Tag>;
}

function renderOverclockTag(value: number | undefined) {
  const normalizedValue = Number(value ?? 0);
  return <Tag color={normalizedValue === 1 ? "gold" : "default"}>{normalizedValue === 1 ? "是" : "否"}</Tag>;
}

function renderSourceTypeTag(value: number | undefined) {
  const normalizedValue = Number(value ?? 1);
  const matchedOption = SOURCE_TYPE_OPTIONS.find((item) => item.value === normalizedValue);
  return (
    <Tag color={normalizedValue === 2 ? "orange" : "geekblue"}>{matchedOption?.label ?? "资产同步"}</Tag>
  );
}

const AssetPoolRecordHistory: React.FC = () => {
  const params = useParams<{ venueId: string; poolId: string }>();
  const venueId = Number(params.venueId);
  const poolId = String(params.poolId);

  const { data, isLoading, isError, error } = useAssetPoolRecordList(poolId);
  const createMutation = useAssetPoolRecordCreate();
  const updateMutation = useAssetPoolRecordUpdate();
  const deleteMutation = useAssetPoolRecordDelete();
  const rebuildMutation = useAssetPoolRecordRebuild();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AssetPoolRecord | null>(null);
  const [form] = Form.useForm<AssetPoolRecordFormValues>();
  const isCloudPower = Form.useWatch("is_cloud_power", form);
  const isOverclocked = Form.useWatch("is_overclocked", form);

  const records: AssetPoolRecord[] = useMemo(() => {
    const list = Array.isArray(data?.data) ? (data.data as AssetPoolRecord[]) : [];
    return [...list].sort((a, b) => dayjs(b.start_time).valueOf() - dayjs(a.start_time).valueOf());
  }, [data]);

  const openCreate = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
    form.resetFields();
    form.setFieldsValue({
      start_time: dayjs().startOf("day"),
      theoretical_hashrate: 0,
      hosted_machine: 0,
      is_cloud_power: 0,
      leased_power: 0,
      is_overclocked: 0,
      overclock_hashrate_per_machine: 0,
      source_type: 2,
    });
  };

  const openEdit = (record: AssetPoolRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
    form.setFieldsValue({
      start_time: dayjs(record.start_time),
      theoretical_hashrate: record.theoretical_hashrate,
      hosted_machine: record.hosted_machine,
      is_cloud_power: record.is_cloud_power ?? 0,
      leased_power: record.leased_power ?? 0,
      is_overclocked: record.is_overclocked ?? 0,
      overclock_hashrate_per_machine: record.overclock_hashrate_per_machine ?? 0,
      asset_record_id: record.asset_record_id,
      source_updated_at: record.source_updated_at ? dayjs(record.source_updated_at) : undefined,
      base_record_id: record.base_record_id,
      source_type: record.source_type ?? 1,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: AssetPoolRecordCreate = {
        venue_id: venueId,
        pool_id: Number(poolId),
        start_time: dayjs(values.start_time).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        theoretical_hashrate: Number(values.theoretical_hashrate),
        hosted_machine: Number(values.hosted_machine),
        is_cloud_power: Number(values.is_cloud_power ?? 0),
        leased_power: Number(values.leased_power ?? 0),
        is_overclocked: Number(values.is_overclocked ?? 0),
        overclock_hashrate_per_machine: Number(values.overclock_hashrate_per_machine ?? 0),
        asset_record_id: values.asset_record_id == null ? undefined : Number(values.asset_record_id),
        source_updated_at: values.source_updated_at
          ? dayjs(values.source_updated_at).format("YYYY-MM-DD HH:mm:ss")
          : undefined,
        base_record_id: values.base_record_id == null ? undefined : Number(values.base_record_id),
        source_type: Number(values.source_type ?? 2),
      };

      if (editingRecord) {
        await updateMutation.mutateAsync({ ...payload, id: editingRecord.id } as AssetPoolRecordUpdate);
        message.success("历史记录更新成功");
      } else {
        await createMutation.mutateAsync(payload);
        message.success("历史记录创建成功");
      }

      closeModal();
    } catch (e) {
      if ((e as { errorFields?: unknown[] })?.errorFields) {
        return;
      }
      message.error((e as Error).message || "保存失败");
    }
  };

  const handleDelete = async (record: AssetPoolRecord) => {
    try {
      await deleteMutation.mutateAsync(record.id);
      message.success("历史记录删除成功");
    } catch (e) {
      message.error((e as Error).message || "删除失败");
    }
  };

  const handleRebuild = async () => {
    try {
      await rebuildMutation.mutateAsync({
        venue_id: venueId,
        pool_id: Number(poolId),
      });
      message.success("已触发资产接管历史重建");
    } catch (e) {
      message.error((e as Error).message || "重建失败");
    }
  };

  const columns: ColumnsType<AssetPoolRecord> = [
    {
      title: "开始时间",
      dataIndex: "start_time",
      key: "start_time",
      width: 160,
    },
    {
      title: "结束时间",
      dataIndex: "end_time",
      key: "end_time",
      width: 160,
      render: (value: string | undefined) => value || "-",
    },
    {
      title: "理论算力(PH/s)",
      dataIndex: "theoretical_hashrate",
      key: "theoretical_hashrate",
      width: 130,
    },
    {
      title: "托管机器",
      dataIndex: "hosted_machine",
      key: "hosted_machine",
      width: 110,
      align: "right",
    },
    {
      title: "算力类型",
      dataIndex: "is_cloud_power",
      key: "is_cloud_power",
      width: 170,
      render: (value: number | undefined) => renderCloudPowerTag(value),
    },
    {
      title: "租赁算力(P)",
      dataIndex: "leased_power",
      key: "leased_power",
      width: 120,
      align: "right",
      render: (value: number | undefined) => value ?? 0,
    },
    {
      title: "是否变频",
      dataIndex: "is_overclocked",
      key: "is_overclocked",
      width: 100,
      render: (value: number | undefined) => renderOverclockTag(value),
    },
    {
      title: "变频后单机算力(T)",
      dataIndex: "overclock_hashrate_per_machine",
      key: "overclock_hashrate_per_machine",
      width: 150,
      align: "right",
      render: (value: number | undefined) => value ?? 0,
    },
    {
      title: "来源类型",
      dataIndex: "source_type",
      key: "source_type",
      width: 100,
      render: (value: number | undefined) => renderSourceTypeTag(value),
    },
    {
      title: "资产记录ID",
      dataIndex: "asset_record_id",
      key: "asset_record_id",
      width: 120,
      render: (value: number | undefined) => value ?? "-",
    },
    {
      title: "来源更新时间",
      dataIndex: "source_updated_at",
      key: "source_updated_at",
      width: 180,
      render: (value: string | undefined) => value || "-",
    },
    {
      title: "基线记录ID",
      dataIndex: "base_record_id",
      key: "base_record_id",
      width: 120,
      render: (value: number | undefined) => value ?? "-",
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 160,
      render: (_: unknown, record) => (
        <Space size="middle">
          <a onClick={() => openEdit(record)}>修改</a>
          <Popconfirm
            title="确认删除该资产接管历史？"
            onConfirm={() => void handleDelete(record)}
            okText="删除"
            cancelText="取消"
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <HistoryOutlined className="text-sky-600" />
            <span>资产接管算力历史</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            展示资产系统同步和手动调整生成的算力变更历史，按开始日期倒序显示。
          </div>
        </div>
        <Space wrap>
          <Popconfirm
            title="确认按当前资产数据重建该主矿池历史？"
            onConfirm={() => void handleRebuild()}
            okText="重建"
            cancelText="取消"
          >
            <Button icon={<RedoOutlined />} loading={rebuildMutation.isPending}>
              重建历史
            </Button>
          </Popconfirm>
          <Button type="primary" onClick={openCreate}>
            + 新增历史
          </Button>
        </Space>
      </div>

      {isError ? (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message={(error as Error)?.message || "资产接管历史加载失败"}
        />
      ) : null}

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={records}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        scroll={{ x: 1800 }}
      />

      <Modal
        title={editingRecord ? "编辑资产接管历史" : "新增资产接管历史"}
        open={isModalOpen}
        onOk={() => void handleSubmit()}
        onCancel={closeModal}
        confirmLoading={
          createMutation.isPending ||
          updateMutation.isPending ||
          rebuildMutation.isPending ||
          deleteMutation.isPending
        }
        destroyOnClose
        width={820}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="开始日期"
              name="start_time"
              rules={[{ required: true, message: "请选择开始日期" }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              label="来源更新时间"
              name="source_updated_at"
              tooltip="可选，通常用于记录资产系统同步时间"
            >
              <DatePicker className="w-full" showTime />
            </Form.Item>
            <Form.Item
              label="理论算力(PH/s)"
              name="theoretical_hashrate"
              rules={[{ required: true, message: "请输入理论算力" }]}
            >
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item
              label="托管机器"
              name="hosted_machine"
              rules={[{ required: true, message: "请输入托管机器数" }]}
            >
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item
              label="算力类型"
              name="is_cloud_power"
              rules={[{ required: true, message: "请选择算力类型" }]}
              className="md:col-span-2"
            >
              <Radio.Group
                className="w-full"
                onChange={(e) => {
                  if (![2, 3].includes(Number(e.target.value))) {
                    form.setFieldValue("leased_power", 0);
                  }
                }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    {CLOUD_POWER_OPTIONS.slice(0, 3).map((option) => (
                      <Radio key={option.value} value={option.value}>
                        {option.label}
                      </Radio>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    {CLOUD_POWER_OPTIONS.slice(3).map((option) => (
                      <Radio key={option.value} value={option.value}>
                        {option.label}
                      </Radio>
                    ))}
                  </div>
                </div>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="租赁算力(P)" name="leased_power">
              <InputNumber
                className="w-full"
                min={0}
                disabled={![2, 3].includes(Number(isCloudPower ?? 0))}
              />
            </Form.Item>
            <Form.Item
              label="是否变频"
              name="is_overclocked"
              rules={[{ required: true, message: "请选择是否变频" }]}
            >
              <Radio.Group
                options={OVERCLOCK_OPTIONS}
                onChange={(e) => {
                  if (e.target.value !== 1) {
                    form.setFieldValue("overclock_hashrate_per_machine", 0);
                  }
                }}
              />
            </Form.Item>
            <Form.Item label="变频后单机算力(T)" name="overclock_hashrate_per_machine">
              <InputNumber className="w-full" min={0} disabled={Number(isOverclocked ?? 0) !== 1} />
            </Form.Item>
            <Form.Item
              label="来源类型"
              name="source_type"
              rules={[{ required: true, message: "请选择来源类型" }]}
            >
              <Radio.Group options={SOURCE_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item label="资产记录ID" name="asset_record_id">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item label="基线记录ID" name="base_record_id">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AssetPoolRecordHistory;
