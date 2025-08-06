import React, { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Select, Space, Table } from "antd";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import { useVenueList, useVenueNew, useVenueUpdate } from "@/pages/venue/hook/hook.ts";
import { VenueInfoParam } from "@/pages/venue/type.tsx";

const { TextArea } = Input;
const { Option } = Select;

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
}

const VenueManagement: React.FC = () => {
  useAuthRedirect();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const { data } = useVenueList(poolType);
  // const [data] = useState<any>();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [form] = Form.useForm();

  const newMutation = useVenueNew();
  const updateMutation = useVenueUpdate();

  const [pageSize, setPageSize] = useState(20); // 新增状态管理页大小

  // 当获取到数据时更新 venues
  useEffect(() => {
    if (data) {
      console.log(data);
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
      result = result.filter(
        (item) =>
          item.venue_name.includes(searchText) ||
          item.venue_code?.includes(searchText) ||
          item.address?.includes(searchText),
      );
    }
    if (countryFilter) {
      result = result.filter((item) => item.country === countryFilter);
    }
    setFilteredVenues(result);
  }, [searchText, countryFilter, venues]);

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
        console.log(text, record.id);
        return index + 1;
      },
    },
    {
      title: "场地名称",
      dataIndex: "venue_name",
      sorter: (a: Venue, b: Venue) => a.venue_name.localeCompare(b.venue_name),
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6 filter-form">
        <div className="flex space-x-4">
          <Button
            type="primary"
            size="middle"
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
            size="middle"
            placeholder="搜索场地名称、代码或地址"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64"
          />
          <Select
            size="middle"
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
          onShowSizeChange: (size) => {
            setPageSize(size); // 更新 pageSize 状态
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
    </div>
  );
};

export default VenueManagement;
