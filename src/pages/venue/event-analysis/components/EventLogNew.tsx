import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileTextOutlined,
  FilterOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Drawer,
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
import { EventLogParam } from "../../type";
import { useSelector, useSettingsStore } from "@/stores"; // 根据实际路径调整
import { exportEventLogsToExcel } from "@/utils/excel";

import "@/styles/compact-form.css";

import { fetchEventLogForExport, fetchEventOperationLogs } from "@/pages/venue/api.tsx";
// import { getTimeDifference } from "@/utils/date";
import UploadExcel from "@/pages/venue/components/UploadExcel";
import {
  useDeleteUpdate,
  useEventLogWithFilter,
  useEventNew,
  useEventUpdate,
  useVenueList,
} from "@/pages/venue/hook/hook.ts";
// import { EventLogParam } from "@/pages/venue/type.tsx"; // 未使用，移除以避免告警

dayjs.extend(isBetween); // 使用插件
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

interface EventLog {
  id: number;
  venue_id: number;
  venue_name: string; // 直接在 EventLog 中使用 venue_name
  log_date: string;
  pool_id: number;
  pool_name: string;
  is_sleep: boolean; // 0 未休眠 1 已休眠
  start_time: string;
  end_time: string;
  log_type: string;
  impact_count: number;
  event_reason: string;
  resolution_measures: string;
  collection: number;
  created_at: string; // 这里使用 created_at 而不是 update_at
  updated_at: string; // 新增 updated_at 字段
}

const App: React.FC = () => {
  // const [showCollectionOnly, setShowCollectionOnly] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  // 模态框内子账户联动（按场地ID）
  const [modalPoolOptions, setModalPoolOptions] = useState<{ value: number; label: string }[]>([]);
  const selectedVenueId = Form.useWatch("venue_id", form);
  // // 参数对象（在依赖声明之后构建）
  // const params: EventLogParam = useMemo(() => ({
  //   page: currentPage,
  //   pageSize,
  //   startDate,
  //   endDate,
  //   venueIds,
  //   eventStatus: selectedEventType.join(","),
  //   eventTypes: selectedDurationType.join(","),
  // }), [currentPage, pageSize, startDate, endDate, venueIds, selectedEventType, selectedDurationType]);

  // 聚合分页：每次拉 2000 条，循环至总量
  // const { data, isLoading } = useAllEventPages(poolType, 1000);

  const { data: venueList } = useVenueList(poolType);
  const newMutation = useEventNew();
  const updateMutation = useEventUpdate();
  const deleteMutation = useDeleteUpdate();
  const [selectedDurationType, setSelectedDurationType] = useState<string[]>([]);
  // 新增筛选状态
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [showSiteFilter, setShowSiteFilter] = useState(false);
  const [filters, setFilters] = useState<{ siteName: string }>({ siteName: "" });
  const powerSites = useMemo(
    () => Array.from(new Set((venueList?.data || []).map((v: any) => v.venue_name))),
    [venueList],
  );
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const [selectedEventType, setSelectedEventType] = useState<string[]>([]);
  // const [searchText, setSearchText] = useState("");
  // 防抖后的搜索文本
  // const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  // 子账户联动：选中场地后展示其子账户
  // const [subAccountOptions, setSubAccountOptions] = useState<
  //   { value: number; label: string; venue_id: number }[]
  // >([]);
  // const [selectedSubAccounts, setSelectedSubAccounts] = useState<number[]>([]);
  // 导出按钮加载状态
  const [exporting, setExporting] = useState(false);

  // 搜索防抖处理
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setDebouncedSearchText(searchText);
  //   }, 300); // 300ms延迟

  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [searchText]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  // 添加分页大小状态
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // const [total, setTotal] = useState<number>(0);
  // 监听模态框中选择的场地ID，联动加载其 pools 列表
  useEffect(() => {
    const loadVenuePools = async () => {
      try {
        if (!selectedVenueId) {
          setModalPoolOptions([]);
          // 清空已选择的子账户
          form.setFieldsValue({ pool_id: undefined });
          return;
        }
        const venue = (venueList?.data || []).find((v: any) => v.id === Number(selectedVenueId));
        // console.log("venue", venue);
        const subs = Array.isArray(venue?.pools) ? venue.pools : [];
        // console.log("subs", subs);
        const opts = subs
          .filter((s: any) => typeof s.pool_id === "number" && s.pool_name)
          .map((s: any) => ({ value: s.pool_id, label: s.pool_name }));
        setModalPoolOptions(opts);
        // 默认选中第一项
        form.setFieldsValue({ pool_id: opts.length ? opts[0].value : undefined });
      } catch (err) {
        console.error("加载场地 pools 失败", err);
        setModalPoolOptions([]);
      }
    };
    loadVenuePools();
  }, [selectedVenueId, poolType]);

  // 参数对象（在依赖声明之后构建）
  const startDate = dateRange && dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined;
  const endDate = dateRange && dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined;
  // 将场地 ID 转为逗号分隔的字符串（后端期望格式）
  let venueIds: string | undefined = undefined;
  if (selectedLocation.length && Array.isArray(venueList?.data)) {
    const ids = selectedLocation
      .map((name) => (venueList!.data as any[]).find((v: any) => v.venue_name === name)?.id)
      .filter((id): id is number => typeof id === "number");
    venueIds = ids.join(",");
  }
  const eventTypes = selectedEventType;
  const eventStatus = selectedDurationType;
  const params = {
    page: currentPage,
    pageSize,
    startDate,
    endDate,
    venueIds,
    eventStatus: eventStatus.join(","),
    eventTypes: eventTypes.join(","),
  };

  // 在依赖声明之后再调用数据查询 hook，避免在声明前使用变量
  const { data, isLoading, refetch } = useEventLogWithFilter(poolType, params);

  // 数据转换
  const logData: EventLog[] =
    (data?.data?.data || [])?.map((item: any, index: any) => ({
      key: index + 1,
      id: item.id,
      venue_id: item.venue_id,
      pool_id: item.pool_id,
      pool_name: item.pool_info.pool_name,
      is_sleep: item.is_sleep, // 0 未休眠 1 已休眠
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
      updated_at: item.updated_at, // 新增 updated_at 字段
      collection: item.collection,
    })) || [];
  const total = data?.data?.total || 0;
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
      width: 200,
      render: (_: any, record: EventLog) => {
        const isSpecialVenue = record.venue_name === "Arct-HF01-J XP-AR-US"; // 判断是否为特殊场地
        return (
          <Tooltip
            title={record.venue_name}
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
                {record.venue_name}
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
      title: "子账户",
      dataIndex: "pool_name",
      width: 150,
      render: (_: any, record: EventLog) => {
        return (
          <Tooltip
            title={record.pool_name}
            placement="top"
            overlayInnerStyle={{ color: "white" }}
            style={{ color: "white" }}
          >
            {record.pool_name}
          </Tooltip>
        );
      },
    },
    {
      title: "影响时长(小时)",
      dataIndex: "log_date",
      width: 140,
      render: (_: string, record: any) => {
        if (record.start_time && record.end_time) {
          const duration = (dayjs(record.end_time).diff(dayjs(record.start_time), "minute") / 60).toFixed(2);
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
      // sorter: (a, b) => {
      //   const durationA =
      //     a.start_time && a.end_time ? dayjs(a.end_time).diff(dayjs(a.start_time), "second") : 0;
      //   const durationB =
      //     b.start_time && b.end_time ? dayjs(b.end_time).diff(dayjs(b.start_time), "second") : 0;
      //   return durationA - durationB;
      // },
    },
    {
      title: "时间范围",
      dataIndex: "start_time",
      width: 280,
      render: (_text, record) => `${record.start_time} - ${record.end_time}`,
      // sorter: (a, b) => dayjs(a.log_date).unix() - dayjs(b.log_date).unix(),
      // defaultSortOrder: "descend", // 👈 默认按影响时长从大到小排序
    },
    {
      title: "事件类型",
      dataIndex: "log_type",
      width: 120,
      render: (text) => {
        const colors = {
          限电: "red",
          设备故障: "orange",
          电力: "cyan", // 为电力指定颜色
          高温: "blue", // 为高温指定颜色
          极端天气: "magenta", // 为极端天气指定颜色
          日常维护: "green", // 为日常维护指定颜色
          网络: "geekblue", // 为网络指定颜色
          低功耗: "purple", // 为低功耗指定颜色
          其他: "default",
        };
        return <Tag color={colors[text as keyof typeof colors]}>{text}</Tag>;
      },
    },
    {
      title: "影响台数",
      dataIndex: "impact_count",
      width: 105,
      // sorter: (a, b) => a.impact_count - b.impact_count,
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
      title: "是否休眠",
      dataIndex: "is_sleep",
      width: 120,
      // sorter: (a, b) => a.impact_count - b.impact_count,
      render: (text) => {
        if (text === 1) {
          return <Tag color="orange">已休眠</Tag>;
        }
        return <Tag color="green">未休眠</Tag>;
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
      title: "创建时间",
      dataIndex: "created_at",
      width: 200,
      render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
      // sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      // defaultSortOrder: "descend", // 👈 默认按创建时间从新到旧排序
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      width: 200,
      render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
      // sorter: (a, b) => dayjs(a.updated_at).unix() - dayjs(b.updated_at).unix(),
      // defaultSortOrder: "descend", // 👈 默认按更新时间从新到旧排序
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="!rounded-button"
          />
          <Tooltip title="操作日志" style={{ display: "none" }}>
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={() => handleOpenOperationLogs(record)}
              className="!rounded-button"
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="!rounded-button" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: EventLog) => {
    form.setFieldsValue({
      ...record,
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
        end_time: values.end_time ? dayjs(values.end_time).format("YYYY-MM-DD HH:mm") : "", // 如果为 null/undefined，就不传入初始值
        log_type: values.log_type,
        impact_count: parseInt(values.impact_count, 10),
        impact_power_loss: Number(values.impact_power_loss), //数字，包含整数和小数
        event_reason: values.event_reason,
        resolution_measures: values.resolution_measures,
        is_sleep: values.is_sleep,
        pool_id: values.pool_id,
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

  // 操作日志抽屉
  const [opDrawerOpen, setOpDrawerOpen] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [opLogs, setOpLogs] = useState<any[]>([]);
  const [opEventId, setOpEventId] = useState<number | null>(null);

  const handleOpenOperationLogs = async (record: EventLog) => {
    setOpEventId(record.id);
    setOpDrawerOpen(true);
    setOpLoading(true);
    try {
      const res: any = await fetchEventOperationLogs(record.id);
      // console.log("res", res);
      const rows = Array.isArray(res?.data.list)
        ? res.data.list
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
      setOpLogs(rows || []);
    } catch (e: any) {
      message.error("获取操作日志失败");
      setOpLogs([]);
    } finally {
      setOpLoading(false);
    }
  };

  const opColumns = React.useMemo(() => {
    const cols: ColumnsType<any> = [
      { title: "用户", dataIndex: "username", key: "username", width: 120, ellipsis: true },

      { title: "状态", dataIndex: "response_status", key: "response_status", width: 100, ellipsis: true },
      { title: "操作类型", dataIndex: "operation_type", key: "operation_type", width: 140, ellipsis: true },
      {
        title: "描述",
        dataIndex: "operation_desc",
        key: "operation_desc",
        width: 120,
        ellipsis: { showTitle: false },
        render: (text: any) => (
          <Tooltip placement="topLeft" title={String(text ?? "")}>
            <span
              style={{
                display: "inline-block",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                verticalAlign: "middle",
              }}
            >
              {text ?? "-"}
            </span>
          </Tooltip>
        ),
      },
      { title: "IP", dataIndex: "ip", key: "ip", width: 130, ellipsis: true },
      {
        title: "时间",
        dataIndex: "created_at",
        key: "created_at",
        width: 180,
        render: (text: any) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"),
      },
    ];
    return cols;
  }, [opLogs]);

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
              <div className="relative">
                <Button
                  size="middle"
                  icon={<FilterOutlined />}
                  className="!rounded-button whitespace-nowrap"
                  onClick={() => setShowSiteFilter(!showSiteFilter)}
                >
                  场地筛选
                </Button>
                {showSiteFilter && (
                  <div className="site-filter-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10 border border-gray-200 p-4">
                    <div className="font-medium text-gray-900 mb-3">选择场地</div>
                    <Input
                      size="middle"
                      placeholder="搜索场地..."
                      className="mb-3"
                      value={filters.siteName}
                      onChange={(e) => {
                        handleFilterChange("siteName", e.target.value);
                      }}
                    />
                    <div className="max-h-60 overflow-y-auto">
                      {powerSites
                        .filter((site: any) => site.toLowerCase().includes(filters.siteName.toLowerCase()))
                        .map((site: any, index: number) => (
                          <div key={index} className="flex items-center py-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              id={`site-${index}`}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              checked={selectedLocation.includes(site)}
                              onChange={(e) => {
                                setSelectedLocation((prev: string[]) => {
                                  const set = new Set(prev);
                                  if (e.target.checked) {
                                    set.add(site);
                                  } else {
                                    set.delete(site);
                                  }
                                  return Array.from(set);
                                });
                              }}
                            />
                            <label
                              htmlFor={`site-${index}`}
                              className="ml-2 text-gray-700 cursor-pointer flex-grow"
                            >
                              {site}
                            </label>
                          </div>
                        ))}
                    </div>
                    <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
                      <Button size="small" onClick={() => setShowSiteFilter(false)}>
                        取消
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                          setShowSiteFilter(false);
                        }}
                      >
                        应用
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <RangePicker
                size="middle"
                // className="!rounded-lg"
                placeholder={["开始日期", "结束日期"]}
                value={dateRange}
                style={{ width: 220 }}
                onChange={(dates) => {
                  // 类型转换，确保类型兼容
                  setCurrentPage(1);
                  const rangeValue = dates as [dayjs.Dayjs | null, dayjs.Dayjs | null];
                  setDateRange(rangeValue);
                }} // 更新日期范围
              />

              <Select
                mode="multiple"
                size="middle"
                placeholder="选择事件状态"
                value={selectedDurationType}
                onChange={(vals) => {
                  setCurrentPage(1);
                  setSelectedDurationType(vals);
                }}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="finished">已结束事件</Option>
                <Option value="unfinished">未结束事件</Option>
              </Select>

              <Select
                mode="multiple"
                maxTagCount="responsive"
                maxTagTextLength={4} // 可选：限制每个标签显示文字长度
                placeholder="选择事件类型"
                value={selectedEventType}
                onChange={(vals) => {
                  setCurrentPage(1);
                  setSelectedEventType(vals);
                }}
                style={{ width: 150 }}
                // maxTagTextLength={4} // 可选：限制每个标签显示文字长度
                size="middle"
              >
                {["电力", "高温", "极端天气", "日常维护", "设备故障", "网络", "限电", "低功耗", "其他"].map(
                  (type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ),
                )}
              </Select>

              <Button
                icon={<SyncOutlined />}
                size="middle"
                loading={isLoading}
                onClick={() => {
                  refetch();
                }}
              >
                刷新
              </Button>

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
                loading={exporting}
                disabled={exporting}
                onClick={async () => {
                  if (exporting) return;
                  setExporting(true);
                  try {
                    const exportParams = {
                      startDate,
                      endDate,
                      venueIds,
                      eventStatus:
                        (Array.isArray(eventStatus) ? eventStatus.join(",") : eventStatus) || undefined,
                      eventTypes:
                        (Array.isArray(eventTypes) ? eventTypes.join(",") : eventTypes) || undefined,
                      // poolIds: selectedSubAccounts.length ? selectedSubAccounts.join(",") : undefined,
                    };
                    const res = await fetchEventLogForExport(poolType, exportParams);
                    const rows = res?.data?.data ?? res?.data ?? [];
                    exportEventLogsToExcel(rows, "事件日志", `事件日志_${dayjs().format("YYYY-MM-DD")}.xlsx`);
                    message.success("导出成功");
                  } catch (e) {
                    console.error(e);
                    message.error("导出失败，请稍后重试");
                  } finally {
                    setExporting(false);
                  }
                }}
                className="!rounded-button"
              >
                导出全部事件
              </Button>
              <Button
                icon={<DownloadOutlined />}
                size="middle"
                onClick={() => {
                  try {
                    if (!logData.length) {
                      message.warning("当前页没有数据可导出");
                      return;
                    }
                    const exportRows = (logData || []).map((item: any) => ({
                      venue_info: { venue_name: item.venue_name },
                      pool_info: { pool_name: item.pool_name },
                      is_sleep: Number(item.is_sleep),
                      log_type: item.log_type,
                      start_time: item.start_time,
                      end_time: item.end_time ?? null,
                      impact_count: item.impact_count,
                      event_reason: item.event_reason,
                      resolution_measures: item.resolution_measures,
                      created_at: item.created_at,
                      updated_at: item.updated_at,
                    }));
                    exportEventLogsToExcel(
                      exportRows,
                      "当前页事件",
                      `事件日志_当前页_${dayjs().format("YYYY-MM-DD")}.xlsx`,
                    );
                    message.success("当前页导出成功");
                  } catch (e) {
                    console.error(e);
                    message.error("导出失败，请稍后重试");
                  }
                }}
                className="!rounded-button"
              >
                导出当前页
              </Button>
            </Space>
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            color: "grey",
            borderRadius: "0.5rem",
            padding: "20px 0px",
            position: "relative",
          }}
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
            dataSource={logData || []} // 使用过滤后的数据
            scroll={{ x: 1300 }}
            rowKey="id"
            loading={isLoading}
            pagination={{
              total: total,
              pageSize: pageSize,
              current: currentPage,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "30", "50", "100", "200"],
              onChange: (page, size) => {
                // 页码或页面大小变化时都会触发此回调
                setPageSize(size);
                setCurrentPage(page);
                console.log(page, size);
                const tableBody = document.querySelector(".ant-table-body");
                if (tableBody) {
                  tableBody.scrollTop = 0;
                }
              },
              // showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </div>
      </div>
      <Drawer
        title={`操作日志${opEventId ? ` #${opEventId}` : ""}`}
        placement="right"
        width={720}
        onClose={() => setOpDrawerOpen(false)}
        open={opDrawerOpen}
        destroyOnClose
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: 16 }}>
          <Table
            loading={opLoading}
            columns={opColumns as any}
            dataSource={(opLogs || []).map((r: any, idx: number) => ({ key: idx, ...r }))}
            pagination={false}
            sticky
            scroll={{ y: "60vh" }}
            size="small"
          />
        </div>
      </Drawer>
      <Modal
        title={form.getFieldValue("id") ? "编辑事件" : "新增事件"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="pt-2 compact-form" initialValues={{ is_sleep: 0 }}>
          <div className="grid grid-cols-2 gap-x-6">
            {/* 隐藏的 ID 字段 */}
            <Form.Item name="id" style={{ display: "none" }}>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="venue_id" label="场地" rules={[{ required: true, message: "请选择场地" }]}>
              <Select
                placeholder="请选择场地"
                size="middle"
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const label = String(option?.children ?? "").toLowerCase();
                  const val = String((option as any)?.value ?? "").toLowerCase();
                  const query = input.toLowerCase().trim();
                  return label.includes(query) || val.includes(query);
                }}
                filterSort={(optionA, optionB) => {
                  const labelA = String(optionA?.children ?? "");
                  const labelB = String(optionB?.children ?? "");
                  return labelA.localeCompare(labelB, "zh");
                }}
                style={{ width: "100%", fontSize: "12px" }}
              >
                {venueList?.data?.map((venue: any) => (
                  <Option key={venue.id} value={venue.id} style={{ fontSize: "12px" }}>
                    {venue.venue_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="pool_id" label="子账户" rules={[{ required: true, message: "请选择子账户" }]}>
              <Select
                placeholder="请选择子账户"
                size="middle"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {modalPoolOptions.map((p) => (
                  <Option key={p.value} value={p.value} style={{ fontSize: "12px" }}>
                    {p.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* <Form.Item name="log_date" label="日期" rules={[{ required: true, message: "请选择日期" }]}>
              <DatePicker className="w-full" />
            </Form.Item> */}
            <Form.Item
              name="start_time"
              label="开始时间"
              rules={[{ required: true, message: "请选择开始时间" }]}
            >
              <DatePicker size="middle" showTime className="w-full" />
            </Form.Item>
            <Form.Item
              name="log_type"
              label="事件类型"
              rules={[{ required: true, message: "请选择事件类型" }]}
            >
              <Select size="middle" placeholder="请选择事件类型">
                {["电力", "高温", "极端天气", "日常维护", "设备故障", "网络", "限电", "低功耗", "其他"].map(
                  (type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ),
                )}
              </Select>
            </Form.Item>
            <Form.Item
              name="end_time"
              label="结束时间"
              rules={[{ required: false, message: "请选择结束时间" }]}
            >
              <DatePicker size="middle" showTime className="w-full" />
            </Form.Item>
            <Form.Item
              name="impact_count"
              label="影响台数"
              style={{ fontSize: "12px" }}
              rules={[{ required: true, message: "请输入影响台数" }]}
            >
              <Input size="middle" type="number" placeholder="请输入影响台数" style={{ fontSize: "12px" }} />
            </Form.Item>
            <Form.Item
              name="impact_power_loss"
              label="影响算力"
              style={{ fontSize: "12px" }}
              rules={[{ required: false, message: "请输入影响算力" }]}
            >
              <Input size="middle" type="number" placeholder="请输入影响算力" style={{ fontSize: "12px" }} />
            </Form.Item>
            <Form.Item name="is_sleep" label="是否休眠" rules={[{ required: true }]}>
              <Select size="middle" placeholder="请选择是否休眠">
                <Option value={0}>不休眠</Option>
                <Option value={1}>已休眠</Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            name="event_reason"
            label="事件原因"
            style={{ fontSize: "12px" }}
            rules={[{ required: false, message: "请输入事件原因" }]}
          >
            <TextArea size="middle" rows={2} placeholder="请输入事件原因" style={{ fontSize: "12px" }} />
          </Form.Item>
          <Form.Item
            name="resolution_measures"
            label="解决措施"
            style={{ fontSize: "12px" }}
            rules={[{ required: false, message: "请输入解决措施" }]}
          >
            <TextArea size="middle" rows={2} placeholder="请输入解决措施" style={{ fontSize: "12px" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default App;
