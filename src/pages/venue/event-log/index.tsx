// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useState } from "react";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, DatePicker, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
interface LogData {
  id: number;
  location: string;
  date: string;
  timeSlot: string;
  eventType: string;
  affectedMachines: number;
  cause: string;
  solution: string;
  recorder: string;
  recordTime: string;
}
const { RangePicker } = DatePicker;
const { RangePicker: TimeRangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const App: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const locations = ["生产车间A", "生产车间B", "组装车间", "包装车间", "仓储区域"];
  const eventTypes = ["设备故障", "系统异常", "人员事故", "质量问题", "其他"];
  const timeSlots = ["早班", "中班", "晚班"];
  const mockData: LogData[] = Array(15)
    .fill(null)
    .map((_, index) => ({
      id: index + 1,
      location: locations[Math.floor(Math.random() * locations.length)],
      date: dayjs()
        .subtract(Math.floor(Math.random() * 30), "day")
        .format("YYYY-MM-DD"),
      timeRange: [
        dayjs().format("HH:mm"),
        dayjs()
          .add(Math.floor(Math.random() * 5), "hour")
          .format("HH:mm"),
      ],
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      affectedMachines: Math.floor(Math.random() * 10) + 1,
      cause: "设备运行参数异常导致生产线暂停",
      solution: "重新校准设备参数，更换损耗部件，恢复正常运行",
      recorder: ["张明远", "李思琪", "王浩宇", "陈雨婷", "刘德华"][Math.floor(Math.random() * 5)],
      recordTime: dayjs()
        .subtract(Math.floor(Math.random() * 24), "hour")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));
  const columns: ColumnsType<LogData> = [
    {
      title: "场地",
      dataIndex: "location",
      width: 120,
      filters: locations.map((loc) => ({ text: loc, value: loc })),
      onFilter: (value, record) => record.location === value,
    },
    {
      title: "日期",
      dataIndex: "date",
      width: 120,
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "时间范围",
      dataIndex: "timeRange",
      width: 180,
      render: (timeRange: [string, string]) => `${timeRange[0]} - ${timeRange[1]}`,
    },
    {
      title: "事件类型",
      dataIndex: "eventType",
      width: 120,
      render: (text) => {
        const colors = {
          设备故障: "red",
          系统异常: "orange",
          人员事故: "purple",
          质量问题: "blue",
          其他: "default",
        };
        return <Tag color={colors[text as keyof typeof colors]}>{text}</Tag>;
      },
    },
    {
      title: "影响台数",
      dataIndex: "affectedMachines",
      width: 100,
      sorter: (a, b) => a.affectedMachines - b.affectedMachines,
    },
    {
      title: "事件原因",
      dataIndex: "cause",
      width: 200,
      ellipsis: true,
    },
    {
      title: "解决措施",
      dataIndex: "solution",
      width: 200,
      ellipsis: true,
    },
    {
      title: "记录人",
      dataIndex: "recorder",
      width: 100,
    },
    {
      title: "记录时间",
      dataIndex: "recordTime",
      width: 160,
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="!rounded-button"
          />
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" icon={<DeleteOutlined />} className="!rounded-button" />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };
  const handleEdit = (record: LogData) => {
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };
  const handleDelete = (id: number) => {
    message.success("删除成功");
  };
  const handleOk = () => {
    form.validateFields().then((values) => {
      console.log(values);
      setIsModalVisible(false);
      message.success("保存成功");
    });
  };
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  return (
    <div className="bg-gray-50 p-6">
      <div className="mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-[auto_1fr] gap-6 mb-6">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
              className="!rounded-button"
            >
              新增日志
            </Button>
            <div className="flex items-center justify-end gap-4">
              <Input
                placeholder="搜索日志内容"
                prefix={<SearchOutlined />}
                size="large"
                className="max-w-xs !rounded-lg"
              />
              <RangePicker size="large" className="!rounded-lg" placeholder={["开始日期", "结束日期"]} />
              <Select
                mode="multiple"
                placeholder="选择场地"
                style={{ width: 200 }}
                size="large"
                className="!rounded-lg"
                maxTagCount={2}
              >
                {locations.map((loc) => (
                  <Option key={loc} value={loc}>
                    {loc}
                  </Option>
                ))}
              </Select>
              <Select
                mode="multiple"
                placeholder="事件类型"
                style={{ width: 200 }}
                size="large"
                className="!rounded-lg"
                maxTagCount={2}
              >
                {eventTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <Space>
              {selectedRowKeys.length > 0 && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => message.success("批量删除成功")}
                  className="!rounded-button"
                >
                  批量删除
                </Button>
              )}
              <Button
                icon={<DownloadOutlined />}
                onClick={() => {
                  const headers = [
                    "场地",
                    "日期",
                    "时间范围",
                    "事件类型",
                    "影响台数",
                    "事件原因",
                    "解决措施",
                    "记录人",
                    "记录时间",
                  ];
                  const data = mockData.map((item) => [
                    item.location,
                    item.date,
                    `${item.timeRange[0]} - ${item.timeRange[1]}`,
                    item.eventType,
                    item.affectedMachines,
                    item.cause,
                    item.solution,
                    item.recorder,
                    item.recordTime,
                  ]);
                  const csvContent = [headers, ...data].map((row) => row.join(",")).join("\n");
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `事件日志_${dayjs().format("YYYY-MM-DD")}.csv`;
                  link.click();
                  message.success("导出成功");
                }}
                className="!rounded-button"
              >
                导出日志
              </Button>
            </Space>
          </div>
        </div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={mockData}
          scroll={{ x: 1300 }}
          rowKey="id"
          pagination={{
            total: mockData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          className="px-6"
        />
      </div>
      <Modal
        title={form.getFieldValue("id") ? "编辑日志" : "新增日志"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="pt-4">
          <div className="grid grid-cols-2 gap-x-6">
            <Form.Item name="location" label="场地" rules={[{ required: true, message: "请选择场地" }]}>
              <Select placeholder="请选择场地">
                {locations.map((loc) => (
                  <Option key={loc} value={loc}>
                    {loc}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="date" label="日期" rules={[{ required: true, message: "请选择日期" }]}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              name="timeRange"
              label="时间范围"
              rules={[{ required: true, message: "请选择时间范围" }]}
            >
              <TimeRangePicker
                format="HH:mm"
                picker="time"
                className="w-full"
                placeholder={["开始时间", "结束时间"]}
              />
            </Form.Item>
            <Form.Item
              name="eventType"
              label="事件类型"
              rules={[{ required: true, message: "请选择事件类型" }]}
            >
              <Select placeholder="请选择事件类型">
                {eventTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="affectedMachines"
              label="影响台数"
              rules={[{ required: true, message: "请输入影响台数" }]}
            >
              <Input type="number" placeholder="请输入影响台数" />
            </Form.Item>
          </div>
          <Form.Item name="cause" label="事件原因" rules={[{ required: true, message: "请输入事件原因" }]}>
            <TextArea rows={4} placeholder="请输入事件原因" />
          </Form.Item>
          <Form.Item name="solution" label="解决措施" rules={[{ required: true, message: "请输入解决措施" }]}>
            <TextArea rows={4} placeholder="请输入解决措施" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default App;
