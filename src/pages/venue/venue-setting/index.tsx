import React, { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message, Modal, Select, Space, Table } from "antd";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import { useVenueList, useVenueNew, useVenueUpdate } from "@/pages/venue/hook/hook.ts";
import { useMiningPoolNew, useMiningPoolUpdate } from "@/pages/mining/hook.ts";
import { MiningPoolUpdate } from "@/pages/mining/type.tsx";
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
}

const VenueManagement: React.FC = () => {
  useAuthRedirect();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const { data, isLoading } = useVenueList(poolType);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [form] = Form.useForm();

  const newMutation = useVenueNew();
  const updateMutation = useVenueUpdate();

  // 当获取到数据时更新 venues
  useEffect(() => {
    if (data) {
      if (data.success && Array.isArray(data.data)) {
        const formattedData = data.data.map((item: any) => ({
          id: item.id,
          venue_name: item.venue_name,
          venue_code: item.venue_code,
          country: item.country,
          address: item.address,
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

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请至少选择一项");
      return;
    }

    Modal.confirm({
      title: "确认批量删除",
      content: `确定要删除选中的 ${selectedRowKeys.length} 个场地吗？`,
      onOk: () => {
        setVenues(venues.filter((item) => !selectedRowKeys.includes(item.id)));
        setSelectedRowKeys([]);
        message.success("批量删除成功");
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (currentVenue) {
        // 编辑
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
      title: "选择",
      dataIndex: "id",
      width: 60,
      render: (id: number) => (
        <Checkbox
          checked={selectedRowKeys.includes(id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRowKeys([...selectedRowKeys, id]);
            } else {
              setSelectedRowKeys(selectedRowKeys.filter((k) => k !== id));
            }
          }}
        />
      ),
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
      title: "详细地址",
      dataIndex: "address",
      width: 300,
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="!rounded-button whitespace-nowrap"
          >
            新增场地
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            className="!rounded-button whitespace-nowrap"
          >
            批量删除
          </Button>
        </div>
        <div className="flex space-x-4">
          <Input
            placeholder="搜索场地名称、代码或地址"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64"
          />
          <Select placeholder="按国家筛选" allowClear onChange={handleCountryFilter} className="w-40">
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
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
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
