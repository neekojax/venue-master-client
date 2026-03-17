import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DeleteOutlined,
  EditOutlined,
  ImportOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Select, Space, Table } from "antd";
import ExcelUpload from "@/components/excel-upload";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import { uploadVenueExcel } from "@/pages/venue/api.tsx";
import { useVenueList, useVenueNew, useVenueUpdate } from "@/pages/venue/hook/hook.ts";
import { VenueInfoParam } from "@/pages/venue/type.tsx";

const { TextArea } = Input;
const { Option } = Select;

interface Pool {
  pool_id: number;
  pool_type: string;
  pool_name: string;
  status: number; // 活跃
}
interface Venue {
  id: number;
  venue_type: string;
  venue_name: string;
  venue_code: string | null;
  country: string | null;
  address: string | null;
  agent_key: string | null;
  hosted_machine: number;
  miner_type: string | null;
  pools: Pool[];
}

const VenueManagement: React.FC = () => {
  useAuthRedirect();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const { data } = useVenueList(poolType);
  const [excelUploadModalVisible, setExcelUploadModalVisible] = useState(false);
  // const [data] = useState<any>();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [poolStatusFilter, setPoolStatusFilter] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [form] = Form.useForm();

  const newMutation = useVenueNew();
  const updateMutation = useVenueUpdate();

  const [pageSize, setPageSize] = useState(20); // 新增状态管理页大小

  // 当获取到数据时更新 venues 和 filteredVenues
  useEffect(() => {
    if (data) {
      // console.log(data);
      if (Array.isArray(data.data)) {
        const formattedData = data.data.map((item: any) => ({
          id: item.id,
          venue_type: item.venue_type,
          venue_name: item.venue_name,
          venue_code: item.venue_code,
          country: item.country,
          address: item.address,
          agent_key: item.agent_key,
          hosted_machine: item.hosted_machine,
          miner_type: item.miner_type,
          pools: item.pools || [], // 补充池数据，默认空数组
        }));
        setVenues(formattedData);
        setFilteredVenues(formattedData);
      } else {
        message.error(`获取场地数据失败: ${data.data.message}`);
      }
    }
  }, [data]);

  // 搜索和过滤
  useEffect(() => {
    let result = venues;
    if (searchText) {
      const q = (searchText || "").toLowerCase();
      result = result.filter((item) => {
        const name = String(item.venue_name || "").toLowerCase();
        const code = String(item.venue_code || "").toLowerCase();
        const addr = String(item.address || "").toLowerCase();
        return name.includes(q) || code.includes(q) || addr.includes(q);
      });
    }
    if (countryFilter) {
      result = result.filter((item) => item.country === countryFilter);
    }
    if (poolStatusFilter !== null) {
      result = result.filter(
        (item) => Array.isArray(item.pools) && item.pools.some((p) => Number(p?.status) === poolStatusFilter),
      );
    }
    setFilteredVenues(result);
  }, [searchText, countryFilter, poolStatusFilter, venues]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCountryFilter = (value: string) => {
    setCountryFilter(value || null);
  };

  const handleAdd = () => {
    setCurrentVenue(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Venue) => {
    setCurrentVenue(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个场地吗？",
      onOk: () => {
        setVenues(venues.filter((item) => item.id !== id));
        message.success("删除成功");
      },
    });
  };

  // const handleBatchDelete = () => {
  //   if (selectedRowKeys.length === 0) {
  //     message.warning("请至少选择一项");
  //     return;
  //   }

  //   Modal.confirm({
  //     title: "确认批量删除",
  //     content: `确定要删除选中的 ${selectedRowKeys.length} 个场地吗？`,
  //     onOk: () => {
  //       setVenues(venues.filter((item) => !selectedRowKeys.includes(item.id)));
  //       setSelectedRowKeys([]);
  //       message.success("批量删除成功");
  //     },
  //   });
  // };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (currentVenue) {
        // 编辑
        const hostedMachineValue = Number(values.hosted_machine);
        if (isNaN(hostedMachineValue)) {
          message.error("hosted_machine 不是有效的数字");
          return; // 或者抛出错误，阻止继续执行
        }
        values.hosted_machine = hostedMachineValue;
        updateMutation.mutate(values, {
          onSuccess: () => {
            message.success("更新成功");
          },
          onError: (error) => {
            message.error(`更新失败: ${error.message}`);
          },
        });
      } else {
        // 新增
        const venueUpdate: VenueInfoParam = {
          id: 0,
          venue_name: values.venue_name,
          venue_code: values.venue_code,
          country: values.country,
          address: values.address,
          agent_key: values.agent_key,
          hosted_machine: Number(values.hosted_machine),
          miner_type: values.miner_type,
        };

        newMutation.mutate(
          { poolType, data: venueUpdate },
          {
            onSuccess: () => {
              message.success("创建成功");
            },
            onError: (error) => {
              message.error(`创建失败: ${error.message}`);
            },
          },
        );
      }
      setIsModalVisible(false);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };
  // 表格列定义
  const columns = [
    {
      title: "序号",
      dataIndex: "id",
      width: 60,
      render(text: string, record: any, index: number) {
        if (record.id == -1) {
          console.log(text, record.id);
        }
        return index + 1;
      },
    },
    {
      title: "场地名称",
      dataIndex: "venue_name",
      render: (text: string, record: { id?: any }) => {
        return (
          <Link to={`/venue/detail/${record.id}`} className="text-blue-500 hover:underline">
            {text}
          </Link>
        );
      },
      sorter: (a: Venue, b: Venue) => a.venue_name.localeCompare(b.venue_name),
    },
    {
      title: "矿池",
      dataIndex: "pools",
      width: 200,
      render: (pools: Pool[]) => {
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Array.isArray(pools) &&
              pools.map((pool, idx) => {
                const s = Number(pool?.status ?? -1);
                const color = s === 1 ? "green" : s === 0 ? "red" : s === 2 ? "orange" : "#666";
                const text = s === 1 ? "活跃" : s === 0 ? "关机" : s === 2 ? "已撤场" : "未知";
                return (
                  <span key={`${pool.pool_id}-${idx}`} style={{ whiteSpace: "nowrap" }}>
                    <span style={{ color: "#333" }}>{pool.pool_name}</span>
                    <span style={{ color, marginLeft: 4 }}>（{text}）</span>
                  </span>
                );
              })}
          </div>
        );
      },
    },
    {
      title: "场地代码",
      dataIndex: "venue_code",
      sorter: (a: Venue, b: Venue) => (a.venue_code || "").localeCompare(b.venue_code || ""),
    },
    {
      title: "所在国家",
      dataIndex: "country",
      sorter: (a: Venue, b: Venue) => (a.country || "").localeCompare(b.country || ""),
    },
    {
      title: "托管机器",
      dataIndex: "hosted_machine",
      width: 100,
    },
    {
      title: "机型",
      dataIndex: "miner_type",
      width: 100,
    },
    {
      title: "场地键值",
      dataIndex: "agent_key",
      width: 300,
    },
    {
      title: "详细地址",
      dataIndex: "address",
      width: 200,
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_: any, record: Venue) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  // 获取国家列表
  const countries = Array.from(
    new Set(venues.map((item) => (item?.country ? item.country : null)).filter(Boolean)),
  );
  const showExcelUploadModal = () => {
    setExcelUploadModalVisible(true);
  };

  const hideExcelUploadModal = () => {
    setExcelUploadModalVisible(false);
  };
  // Excel上传处理函数
  const handleExcelUpload = async (file: File) => {
    // try {
    const result = await uploadVenueExcel(file);

    // 如果有成功导入的数据，刷新页面
    if (result.success && result.data?.success_count > 0) {
      setTimeout(() => {
        window.location.reload();
      }, 2000); // 延迟2秒刷新，让用户看到结果
    }

    return result;
    // } catch (error: any) {
    //   // 不在这里显示错误消息，让Excel组件处理
    //   throw error;
    // }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6 filter-form">
        <div className="flex space-x-4">
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="!rounded-button whitespace-nowrap"
          >
            新增场地
          </Button>
          {/* <Button
            size="middle"
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            style={{ fontSize: 12 }}
            className="!rounded-button whitespace-nowrap"
          >
            批量删除
          </Button> */}
        </div>
        <div className="flex space-x-4">
          <Input
            size="small"
            placeholder="搜索场地名称、代码或地址"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64"
          />
          <Select
            size="small"
            placeholder="按国家筛选"
            allowClear
            onChange={handleCountryFilter}
            className="w-40"
          >
            {countries?.map((country) => (
              <Option key={country} value={country}>
                {country}
              </Option>
            ))}
          </Select>
          <Select
            size="small"
            placeholder="按状态筛选"
            allowClear
            value={poolStatusFilter as any}
            onChange={(v) => setPoolStatusFilter(v ?? null)}
            className="w-32"
          >
            <Option value={1}>
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "green",
                  marginRight: 6,
                }}
              />
              活跃
            </Option>
            <Option value={0}>
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "red",
                  marginRight: 6,
                }}
              />
              关机
            </Option>
            <Option value={2}>
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#9CA3AF",
                  marginRight: 6,
                }}
              />
              已撤场
            </Option>
          </Select>

          <Button
            type="primary"
            size="small"
            // ghost
            icon={<ImportOutlined />}
            style={{ marginRight: "15px" }}
            onClick={showExcelUploadModal}
          >
            导入功耗
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredVenues}
        rowKey="id"
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: pageSize, // 使用动态 pageSize
          showSizeChanger: true,
          onShowSizeChange: (current, size) => {
            console.log("onShowSizeChange", current, size);
            setPageSize(size); // 更新 pageSize 状态（注意：第2个参数才是 pageSize）
          },
          onChange: (_page, size) => {
            // 兼容某些版本只触发 onChange 的情况
            console.log("onChange", _page, size);
            if (size && size !== pageSize) setPageSize(size);
          },
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={currentVenue ? "编辑场地" : "新增场地"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        footer={[
          <Button key="back" onClick={handleModalCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk}>
            确定
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" initialValues={currentVenue || undefined}>
          <Form.Item
            name="venue_name"
            label="场地名称"
            rules={[{ required: true, message: "请输入场地名称" }]}
          >
            <Input placeholder="请输入场地名称" />
          </Form.Item>
          <Form.Item name="venue_code" label="场地代码">
            <Input placeholder="请输入场地代码" />
          </Form.Item>
          <Form.Item
            name="country"
            label="所在国家"
            rules={[
              { required: true, message: "请输入国家" },
              { whitespace: true, message: "国家不能为空" },
            ]}
          >
            <Input placeholder="请输入国家" />
          </Form.Item>
          <Form.Item name="hosted_machine" label="托管机器">
            <Input type="number" placeholder="托管机器" />
          </Form.Item>
          <Form.Item name="miner_type" label="托管机型">
            <Input placeholder="托管机型" />
          </Form.Item>
          <Form.Item name="agent_key" label="场地键值">
            <Input placeholder="agent_key" />
          </Form.Item>
          <Form.Item name="address" label="详细地址">
            <TextArea rows={3} placeholder="请输入详细地址" />
          </Form.Item>
          {/* 添加 ID 字段 */}
          <Form.Item name="id" label="场地ID" style={{ display: "none" }}>
            <Input type="hidden" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Excel上传Modal */}
      <Modal
        title="Excel文件导入"
        open={excelUploadModalVisible}
        onCancel={hideExcelUploadModal}
        footer={null}
        width={600}
      >
        <ExcelUpload
          onUpload={handleExcelUpload}
          accept=".xlsx,.xls"
          maxSize={10}
          title="点击或拖拽Excel文件到此区域上传"
          description="支持.xlsx和.xls格式，文件大小不超过10MB"
        />
      </Modal>
    </div>
  );
};

export default VenueManagement;
