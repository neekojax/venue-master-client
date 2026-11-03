import { useCallback, useEffect, useRef, useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  type AuthzEndpoint,
  type BinaryStatus,
  createEndpoint,
  deleteEndpoint,
  fetchEndpoints,
  type PublicMode,
  updateEndpoint,
} from "./api";
import { cleanParams, FilterBar, pageSize, StatusSelect, StatusTag } from "./common";
import { useAuthzPage } from "./context";

const methodColors: Record<string, string> = {
  GET: "blue",
  POST: "green",
  PUT: "orange",
  PATCH: "gold",
  DELETE: "red",
};

export default function EndpointsTab() {
  const { canManage, options, permissions, publishSuccess } = useAuthzPage();
  const [messageApi, contextHolder] = message.useMessage();
  const [rows, setRows] = useState<AuthzEndpoint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [queryKeyword, setQueryKeyword] = useState("");
  const [method, setMethod] = useState("");
  const [resolver, setResolver] = useState("");
  const [publicMode, setPublicMode] = useState<PublicMode | "">("");
  const [status, setStatus] = useState<BinaryStatus | "">("");
  const [editing, setEditing] = useState<AuthzEndpoint | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const listRequestId = useRef(0);
  const selectedMode = Form.useWatch("public_mode", form);

  const resolvers = options.domain_resolvers.filter((value) => !value.startsWith("pending_"));

  const load = useCallback(async () => {
    const requestId = ++listRequestId.current;
    setLoading(true);
    try {
      const data = await fetchEndpoints(
        cleanParams({
          page,
          page_size: pageSize,
          keyword: queryKeyword,
          method,
          domain_resolver: resolver,
          public_mode: publicMode,
          status,
        }),
      );
      if (requestId !== listRequestId.current) return;
      setRows(data.list || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      if (requestId === listRequestId.current) messageApi.error(error.message || "加载 API 映射失败");
    } finally {
      if (requestId === listRequestId.current) setLoading(false);
    }
  }, [messageApi, method, page, publicMode, queryKeyword, resolver, status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (keyword.trim() !== queryKeyword) {
        setPage(1);
        setQueryKeyword(keyword.trim());
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword, queryKeyword]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      method: "GET",
      public_mode: "protected",
      domain_resolver: resolvers[0] || "none",
      status: 1,
    });
    setModalOpen(true);
  };
  const openEdit = (row: AuthzEndpoint) => {
    setEditing(row);
    form.setFieldsValue(row);
    setModalOpen(true);
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        method: String(values.method).toUpperCase(),
        path_pattern: values.path_pattern,
        permission_key: values.public_mode === "public" ? values.permission_key || "" : values.permission_key,
        domain_resolver: values.domain_resolver,
        public_mode: values.public_mode,
        status: values.status,
      };
      setSaving(true);
      const result = editing ? await updateEndpoint(editing.id, payload) : await createEndpoint(payload);
      setModalOpen(false);
      publishSuccess(result.policy_version);
      await load();
    } catch (error: any) {
      if (error?.errorFields) return;
      messageApi.error(error.message || "保存 API 映射失败");
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<AuthzEndpoint> = [
    {
      title: "方法",
      dataIndex: "method",
      width: 85,
      render: (value) => <Tag color={methodColors[value] || "default"}>{value}</Tag>,
    },
    {
      title: "Path Pattern",
      dataIndex: "path_pattern",
      width: 300,
      render: (value) => (
        <Typography.Text copyable className="authz-code">
          {value}
        </Typography.Text>
      ),
    },
    {
      title: "Permission Key",
      dataIndex: "permission_key",
      width: 220,
      render: (value) => (value ? <Tag color="blue">{value}</Tag> : "—"),
    },
    { title: "组织解析器", dataIndex: "domain_resolver", width: 150 },
    {
      title: "保护模式",
      dataIndex: "public_mode",
      width: 120,
      render: (value) => (
        <Tag color={value === "public" ? "green" : value.startsWith("hmac") ? "purple" : "gold"}>{value}</Tag>
      ),
    },
    { title: "状态", dataIndex: "status", width: 80, render: (value) => <StatusTag value={value} /> },
    {
      title: "操作",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, row) => {
        const systemMapping = row.path_pattern === "/authz" || row.path_pattern.startsWith("/authz/");
        return (
          <Space size={4}>
            {systemMapping && <Tag color="red">内置映射</Tag>}
            {canManage && !systemMapping && (
              <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(row)}>
                编辑
              </Button>
            )}
            {canManage && !systemMapping && (
              <Popconfirm
                title="确认禁用该 API 映射？"
                description="禁用后对应业务接口在 new-only 模式下会因未登记而被拒绝。"
                okButtonProps={{ danger: true }}
                onConfirm={async () => {
                  try {
                    const result = await deleteEndpoint(row.id);
                    publishSuccess(result.policy_version);
                    await load();
                  } catch (error: any) {
                    messageApi.error(error.message || "禁用映射失败");
                  }
                }}
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  禁用
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      {contextHolder}
      <FilterBar
        keyword={keyword}
        setKeyword={setKeyword}
        showSearchButton={false}
        onSearch={() => {
          setPage(1);
          setQueryKeyword(keyword.trim());
        }}
        onRefresh={() => void load()}
        placeholder="路径或 Permission Key"
        extra={
          canManage && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建映射
            </Button>
          )
        }
      >
        <Select
          value={method}
          onChange={setMethod}
          style={{ width: 110 }}
          options={[
            { label: "全部方法", value: "" },
            ...["GET", "POST", "PUT", "PATCH", "DELETE"].map((value) => ({ label: value, value })),
          ]}
        />
        <Select
          value={resolver}
          onChange={setResolver}
          style={{ width: 150 }}
          options={[
            { label: "全部解析器", value: "" },
            ...resolvers.map((value) => ({ label: value, value })),
          ]}
        />
        <Select
          value={publicMode}
          onChange={setPublicMode}
          style={{ width: 145 }}
          options={[
            { label: "全部模式", value: "" },
            ...options.public_modes.map((value) => ({ label: value, value })),
          ]}
        />
        <StatusSelect value={status} onChange={setStatus} />
      </FilterBar>
      <Table
        className="authz-table"
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={rows}
        loading={loading}
        scroll={{ x: 1150 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: false,
          showTotal: (value) => `共 ${value} 条`,
          onChange: setPage,
        }}
      />
      <Modal
        title={editing ? "编辑 API 映射" : "新建 API 映射"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void save()}
        confirmLoading={saving}
        width={620}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Space align="start">
            <Form.Item name="method" label="HTTP Method" rules={[{ required: true }]}>
              <Select
                style={{ width: 130 }}
                options={["GET", "POST", "PUT", "PATCH", "DELETE"].map((value) => ({ label: value, value }))}
              />
            </Form.Item>
            <Form.Item
              name="path_pattern"
              label="Path Pattern"
              rules={[{ required: true }, { pattern: /^\//, message: "路径必须以 / 开头" }]}
            >
              <Input style={{ width: 400 }} placeholder="/devices/:id" />
            </Form.Item>
          </Space>
          <Form.Item name="public_mode" label="保护模式" rules={[{ required: true }]}>
            <Select options={options.public_modes.map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item
            name="permission_key"
            label="Permission Key"
            rules={[{ required: selectedMode !== "public", message: "非公开接口必须选择权限" }]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={permissions.map((item) => ({
                label: `${item.permission_key} · ${item.name}`,
                value: item.permission_key,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="domain_resolver"
            label="组织解析器"
            extra="pending_ 开头的迁移保护解析器不会出现在列表中。"
            rules={[{ required: true }]}
          >
            <Select options={resolvers.map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "启用", value: 1 },
                { label: "禁用", value: 0 },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
