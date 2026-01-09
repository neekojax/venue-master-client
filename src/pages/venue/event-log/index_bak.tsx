import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  // Switch
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween"; // 引入 isBetween 插件
import { useSelector, useSettingsStore } from "@/stores"; // 根据实际路径调整
import { getTimeDifference } from "@/utils/date";

import UploadExcel from "@/pages/venue/components/UploadExcel";
import {
  useDeleteUpdate,
  useEventList,
  useEventNew,
  useEventUpdate,
  useVenueList,
} from "@/pages/venue/hook/hook.ts";
import { EventLogParam } from "@/pages/venue/type.tsx"; // 根据实际路径调整

dayjs.extend(isBetween); // 使用插件
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

interface EventLog {
  id: number;
  venue_id: number;
  venue_name: string; // 直接在 EventLog 中使用 venue_name
  log_date: string;
  start_time: string;
  end_time: string;
  log_type: string;
  impact_count: number;
  event_reason: string;
  resolution_measures: string;
  collection: number;
  created_at: string; // 这里使用 created_at 而不是 update_at
}

const App: React.FC = () => {
  // const [showCollectionOnly, setShowCollectionOnly] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const { data, isLoading } = useEventList(poolType);
  const { data: venueList } = useVenueList(poolType);
  const newMutation = useEventNew();
  const updateMutation = useEventUpdate();
  const deleteMutation = useDeleteUpdate();
  const [selectedDurationType, setSelectedDurationType] = useState<string[]>([]);
  // 新增筛选状态
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  // 防抖后的搜索文本
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");

  // 搜索防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300); // 300ms延迟

    return () => {
      clearTimeout(timer);
    };
  }, [searchText]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  // 添加分页大小状态
  const [pageSize, setPageSize] = useState<number>(10);

  // 数据转换
  const logData: EventLog[] =
    data?.data?.map((item: any, index: any) => ({
      key: index + 1,
      id: item.id,
      venue_id: item.venue_id,
      venue_name: item.venue_info.venue_name,
      log_date: item.log_date,
      start_time: item.start_time,
      end_time: item.end_time,
      log_type: item.log_type,
      impact_count: item.impact_count,
      impact_power_loss: item.impact_power_loss,
      event_reason: item.event_reason,
      resolution_measures: item.resolution_measures,
      created_at: item.created_at,
      collection: item.collection,
    })) || [];

  // 过滤后的数据
  const filteredData = logData.filter((log) => {
    const matchesLocation = selectedLocation.length ? selectedLocation.includes(log.venue_name) : true;
    const matchesEventType = selectedEventType.length ? selectedEventType.includes(log.log_type) : true;
    // 改进搜索逻辑：使用防抖后的搜索文本，不区分大小写，并搜索更多字段
    const searchTextLower = debouncedSearchText.toLowerCase();
    const matchesSearchText =
      debouncedSearchText === "" ||
      [log.venue_name, log.event_reason, log.resolution_measures, log.log_type].some(
        (field) => field && field.toLowerCase().includes(searchTextLower),
      );

    const isValidDateRange = Array.isArray(dateRange) && dateRange.length === 2;
    const matchesDateRange =
      isValidDateRange && dateRange[0] && dateRange[1]
        ? dayjs(log.log_date).isBetween(dateRange[0], dateRange[1], null, "[]")
        : true;

    const hasDuration = log.start_time && log.end_time;
    const matchesDuration =
      selectedDurationType.length === 0 ||
      selectedDurationType.some((type) => {
        return type === "valid" ? hasDuration : !hasDuration;
      });
    // 2️⃣ 收藏过滤

    // const matchesCollection = !showCollectionOnly || log.collection === 1;
    return matchesLocation && matchesEventType && matchesSearchText && matchesDateRange && matchesDuration;
  });

  const columns: ColumnsType<EventLog> = [
    {
      title: "序号",
      dataIndex: "key",
      width: "70px",
      rowScope: "row",
      render(text: string, record: any, index: number) {
        if (index === -1) {
          console.log(text, record.key);
        }
        return index + 1;
      },
    },
    {
      title: "场地",
      dataIndex: "venue_name",
      // width: 120,
      // filters: venueList?.data?.map((venue) => ({ text: venue.venue_name, value: venue.venue_name })),
      // onFilter: (value, record) => record.venue_name === value,
      width: 200,
      render: (text: string, record: { venue_id?: any }) => {
        const isSpecialVenue = text === "Arct-HF01-J XP-AR-US"; // 判断是否为特殊场地
        return (
          <Tooltip
            title={text}
            placement="top"
            overlayInnerStyle={{ color: "white" }}
            style={{ color: "white" }}
          >
            <div
              style={{
                width: "100%",
                overflow: "hidden",
                color: isSpecialVenue ? "red" : "#333", // 特殊场地字体颜色为红色
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: isSpecialVenue ? "bold" : "normal", // 加粗特殊场地
              }}
            >
              <Link to={`/venue/detail/${record.venue_id}`} className="text-blue-500 hover:underline">
                {text}
              </Link>
              {isSpecialVenue && (
                <Tag color="red" style={{ marginLeft: 2 }}>
                  补充
                </Tag>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "影响时长",
      dataIndex: "log_date",
      width: 120,
      render: (_: string, record: any) => {
        // if (text === "---valid---") {
        //   console.log(text);
        // }
        if (record.start_time && record.end_time) {
          // return getTimeDifference(record.start_time, record.end_time);
          const duration = getTimeDifference(record.start_time, record.end_time);
          if (duration != "---") {
            return duration;
          }
          return (
            <Tag color="red">
              <SyncOutlined spin style={{ marginRight: 4 }} /> 影响中
            </Tag>
          );
        }
        return (
          <Tag color="red">
            <SyncOutlined spin style={{ marginRight: 4 }} /> 影响中
          </Tag>
        );
        // return dayjs(text).format("YYYY-MM-DD HH:mm");
      },
      sorter: (a, b) => {
        const durationA =
          a.start_time && a.end_time ? dayjs(a.end_time).diff(dayjs(a.start_time), "second") : 0;

        const durationB =
          b.start_time && b.end_time ? dayjs(b.end_time).diff(dayjs(b.start_time), "second") : 0;

        return durationA - durationB;
      },
    },
    {
      title: "时间范围",
      dataIndex: "start_time",
      width: 280,
      render: (_text, record) => `${record.start_time} - ${record.end_time}`,
      sorter: (a, b) => dayjs(a.log_date).unix() - dayjs(b.log_date).unix(),
      defaultSortOrder: "descend", // 👈 默认按影响时长从大到小排序
    },
    {
      title: "事件类型",
      dataIndex: "log_type",
      width: 120,
      filters: [
        { text: "电力", value: "电力" },
        { text: "高温", value: "高温" },
        { text: "极端天气", value: "极端天气" },
        { text: "日常维护", value: "日常维护" },
        { text: "设备故障", value: "设备故障" },
        { text: "网络", value: "网络" },
        { text: "限电", value: "限电" },
      ],
      onFilter: () => {
        return true;
      },
      // onFilter: (value, record) => {
      //   console.log(value);
      //   return record.log_type === value
      // },
      render: (text) => {
        const colors = {
          限电: "red",
          设备故障: "orange",
          电力: "cyan", // 为电力指定颜色
          高温: "blue", // 为高温指定颜色
          极端天气: "magenta", // 为极端天气指定颜色
          日常维护: "green", // 为日常维护指定颜色
          网络: "geekblue", // 为网络指定颜色
          其他: "default",
        };
        return <Tag color={colors[text as keyof typeof colors]}>{text}</Tag>;
      },
    },
    {
      title: "影响台数",
      dataIndex: "impact_count",
      width: 105,
      sorter: (a, b) => a.impact_count - b.impact_count,
    },
    {
      title: "影响算力",
      dataIndex: "impact_power_loss",
      width: 120,
      // sorter: (a, b) => a.impact_count - b.impact_count,
      render: (text) => {
        if (text) {
          return `${text} T`;
        }
      },
    },
    {
      title: "事件原因",
      dataIndex: "event_reason",
      width: 250,
      ellipsis: true,
      render: (text) => {
        return (
          <Tooltip
            title={text}
            placement="top"
            overlayInnerStyle={{ color: "white" }}
            style={{ color: "white" }}
          >
            <div
              style={{
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "解决措施",
      dataIndex: "resolution_measures",
      width: 200,
      ellipsis: true,
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

  useEffect(() => {
    if (isLoading) {
      // message.loading("加载中...");
    }
    // console.log(selectedEventType);
  }, [isLoading, selectedEventType]);

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };
  const handleEdit = (record: EventLog) => {
    form.setFieldsValue({
      ...record,
      // log_date: dayjs(record.log_date),
      // start_time: dayjs(record.start_time),
      log_date: record.log_date ? dayjs(record.log_date) : undefined,
      start_time: record.start_time ? dayjs(record.start_time) : undefined, //dayjs(record.start_time),
      end_time: record.end_time ? dayjs(record.end_time) : undefined, // 如果为 null/undefined，就不传入初始值
      // end_time: dayjs(record.end_time),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        message.success("删除成功");
      },
      onError: (error) => {
        message.error(`删除失败: ${error.message}`);
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const eventUpdate: EventLogParam = {
        id: values.id,
        venue_id: values.venue_id,
        log_date: dayjs(values.log_date).format("YYYY-MM-DD"),
        start_time: dayjs(values.start_time).format("YYYY-MM-DD HH:mm"),
        end_time: dayjs(values.end_time).format("YYYY-MM-DD HH:mm"),
        log_type: values.log_type,
        impact_count: parseInt(values.impact_count, 10),
        impact_power_loss: Number(values.impact_power_loss), //数字，包含整数和小数
        event_reason: values.event_reason,
        resolution_measures: values.resolution_measures,

        is_sleep: values.is_sleep || false,
        pool_id: values.pool_type || undefined,
      };

      if (values.id !== undefined) {
        updateMutation.mutate(eventUpdate, {
          onSuccess: () => {
            message.success("更新成功");
          },
          onError: (error) => {
            message.error(`更新失败: ${error.message}`);
          },
        });
      } else {
        newMutation.mutate(
          { poolType, data: eventUpdate },
          {
            onSuccess: () => {
              message.success("添加成功");
            },
            onError: (error) => {
              message.error(`添加失败: ${error.message}`);
            },
          },
        );
      }
      setIsModalVisible(false);
    });
  };

  return (
    <div className="">
      <div className="mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-[auto_1fr] gap-6 mb-6 filter-form">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="middle"
              className="!rounded-button"
            >
              新增事件
            </Button>
            <div className="flex items-center justify-end gap-4">
              <Input
                placeholder="搜索场地、事件类型或内容"
                prefix={<SearchOutlined />}
                size="middle"
                // className="max-w-xs !rounded-lg"
                value={searchText}
                style={{ width: 180 }}
                onChange={(e) => setSearchText(e.target.value)} // 更新搜索文本
                allowClear // 添加清除按钮
              />
              <RangePicker
                size="middle"
                // className="!rounded-lg"
                placeholder={["开始日期", "结束日期"]}
                value={dateRange}
                style={{ width: 220 }}
                onChange={(dates) => {
                  // 类型转换，确保类型兼容
                  const rangeValue = dates as [dayjs.Dayjs | null, dayjs.Dayjs | null];
                  setDateRange(rangeValue);
                }} // 更新日期范围
              />
              <Select
                mode="multiple"
                maxTagCount="responsive"
                maxTagTextLength={4} // 可选：限制每个标签显示文字长度
                size="middle"
                placeholder="选择场地"
                value={selectedLocation}
                onChange={setSelectedLocation}
                style={{ width: 120 }}
                // className="!rounded-lg"
              >
                {venueList?.data?.map((venue: any) => (
                  <Option key={venue.id} value={venue.venue_name}>
                    {venue.venue_name}
                  </Option>
                ))}
              </Select>
              <Select
                mode="multiple"
                placeholder="选择影响时长类型"
                value={selectedDurationType}
                onChange={setSelectedDurationType}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="valid">已结束事件</Option>
                <Option value="empty">未结束事件</Option>
              </Select>
              {/* <Select
                mode="multiple"
                maxTagCount="responsive"
                maxTagTextLength={4} // 可选：限制每个标签显示文字长度
                placeholder="选择事件类型"
                value={selectedEventType}
                onChange={setSelectedEventType}
                style={{ width: 150 }}
                // maxTagTextLength={4} // 可选：限制每个标签显示文字长度
                size="middle"
              // className="!rounded-lg"
              >
                {["电力", "高温", "极端天气", "日常维护", "设备故障", "网络", "限电"].map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select> */}

              {/* <Select
                placeholder="选择影响时长类型"
                value={selectedDurationType}
                onChange={setSelectedDurationType}
                style={{ width: 100 }}
                size="middle"
                allowClear
              >
                <Option value="valid">已结束事件</Option>
                <Option value="empty">未结束事件</Option>
              </Select> */}
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
              <UploadExcel />
              <Button
                icon={<DownloadOutlined />}
                size="middle"
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
                  const data = filteredData.map((item) => [
                    item.venue_name,
                    item.log_date,
                    `${item.start_time} - ${item.end_time}`,
                    item.log_type,
                    item.impact_count,
                    item.event_reason,
                    item.resolution_measures,
                    item.created_at,
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
                导出事件
              </Button>
            </Space>
          </div>
        </div>

        <div
          style={{ background: "#fff", color: "grey", borderRadius: "0.5rem", padding: "20px 0px" }}
          className="longdataTable"
        >
          {/* <div style={{ marginBottom: 16, marginRight: '10px', color: '#000', textAlign: 'right' }}>
            <Switch
              size="small"
              checked={showCollectionOnly}
              onChange={setShowCollectionOnly}
            />
            {" "}
            我的自选
          </div> */}
          <Table
            // rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredData} // 使用过滤后的数据
            scroll={{ x: 1300 }}
            rowKey="id"
            loading={isLoading}
            // onChange={handleTableChange}
            onChange={(_: any, filters: any) => {
              console.log("Table >>选中的事件类型：", filters.log_type); // 是数组
              setSelectedEventType(filters.log_type || []); // 设置选中的事件类型数组
            }}
            pagination={{
              total: filteredData.length,
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "30", "50"],
              onChange: (page, size) => {
                // 页码或页面大小变化时都会触发此回调
                setPageSize(size);
                console.log(page, size);
                const tableBody = document.querySelector(".ant-table-body");
                if (tableBody) {
                  tableBody.scrollTop = 0;
                }
              },
              // showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            // className="px-6"
          />
        </div>
      </div>
      <Modal
        title={form.getFieldValue("id") ? "编辑事件" : "新增事件"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="pt-4">
          <div className="grid grid-cols-2 gap-x-6">
            {/* 隐藏的 ID 字段 */}
            <Form.Item name="id" style={{ display: "none" }}>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="venue_id" label="场地" rules={[{ required: true, message: "请选择场地" }]}>
              <Select placeholder="请选择场地" allowClear style={{ width: "100%", fontSize: "12px" }}>
                {venueList?.data?.map((venue: any) => (
                  <Option key={venue.id} value={venue.id} style={{ fontSize: "12px" }}>
                    {venue.venue_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="log_date" label="日期" rules={[{ required: true, message: "请选择日期" }]}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              name="start_time"
              label="开始时间"
              rules={[{ required: true, message: "请选择开始时间" }]}
            >
              <DatePicker showTime className="w-full" />
            </Form.Item>
            <Form.Item
              name="end_time"
              label="结束时间"
              rules={[{ required: true, message: "请选择结束时间" }]}
            >
              <DatePicker showTime className="w-full" />
            </Form.Item>
            <Form.Item
              name="log_type"
              label="事件类型"
              rules={[{ required: true, message: "请选择事件类型" }]}
            >
              <Select placeholder="请选择事件类型">
                {["电力", "高温", "极端天气", "日常维护", "设备故障", "限电"].map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="impact_count"
              label="影响台数"
              style={{ fontSize: "12px" }}
              rules={[{ required: true, message: "请输入影响台数" }]}
            >
              <Input type="number" placeholder="请输入影响台数" style={{ fontSize: "12px" }} />
            </Form.Item>
            <Form.Item
              name="impact_power_loss"
              label="影响算力"
              style={{ fontSize: "12px" }}
              rules={[{ required: true, message: "请输入影响算力" }]}
            >
              <Input type="number" placeholder="请输入影响算力" style={{ fontSize: "12px" }} />
            </Form.Item>
          </div>
          <Form.Item
            name="event_reason"
            label="事件原因"
            style={{ fontSize: "12px" }}
            rules={[{ required: true, message: "请输入事件原因" }]}
          >
            <TextArea rows={4} placeholder="请输入事件原因" style={{ fontSize: "12px" }} />
          </Form.Item>
          <Form.Item
            name="resolution_measures"
            label="解决措施"
            style={{ fontSize: "12px" }}
            rules={[{ required: true, message: "请输入解决措施" }]}
          >
            <TextArea rows={4} placeholder="请输入解决措施" style={{ fontSize: "12px" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default App;
