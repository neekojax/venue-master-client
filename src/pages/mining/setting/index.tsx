import { useEffect, useState } from "react";
import { FaAdn, FaFish } from "react-icons/fa6";
import { DeleteOutlined, ExportOutlined, FormOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Spin,
  Tooltip,
} from "antd";
import ActionButton, { ActionButtonMode } from "@/components/action-button";
import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";
import { exportMiningPoolListToExcel } from "@/utils/excel.ts";
import { getShortenedLink } from "@/utils/short-link.ts";

const { Option } = Select;
import EditForm from "@/pages/mining/components/edit-form.tsx";
import {
  useMiningPoolDelete,
  useMiningPoolList,
  useMiningPoolNew,
  useMiningPoolUpdate,
} from "@/pages/mining/hook.ts";
import { MiningPool, MiningPoolUpdate } from "@/pages/mining/type.tsx";
import { useVenueList } from "@/pages/venue/hook/hook.ts";

const emptyData = {
  name: "",
  pool_type: "",
  country: "",
  status: 0, // 状态：0 暂停，1 活跃
  // pool_category: "",
  theoretical_hashrate: 0,
  energy_ratio: 0,
  basic_hosting_fee: 0,
  master_link: "",
  backup_link: "",
};

const StoragePrefix = "mining-setting";

export default function MiningSettingPage() {
  useAuthRedirect();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [poolCategory, setPoolCategoryType] = useState<string>(
    localStorage.getItem(`${StoragePrefix}_poolCategory`) || "主矿池",
  );

  const { data: poolsData, isLoading: isLoadingPools } = useMiningPoolList(poolType, poolCategory);

  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);

  const newMutation = useMiningPoolNew();
  const updateMutation = useMiningPoolUpdate();
  const deleteMutation = useMiningPoolDelete();

  const [isLoadingNewPool, setIsLoadingNewPool] = useState(false);

  const [searchTerm, setSearchTerm] = useState(""); // 新增搜索状态;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<MiningPoolUpdate | null>(null);
  const [editableKey, setEditableRowKey] = useState<number>(0);

  const { data: venueList } = useVenueList(poolType);

  const [form] = Form.useForm();

  const showModal = (record: any) => {
    setCurrentRow(record);
    setEditableRowKey(record.key);
    // form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  type FieldType = {
    key?: number;
    id?: number;
    venue_id: number;
    pool_name?: string;
    pool_type?: string;
    status?: number;
    country?: string;
    pool_category?: string;
    theoretical_hashrate?: number;
    energy_ratio?: number;
    basic_hosting_fee?: number;

    link?: string;
  };

  const handleOk = () => {
    form.validateFields().then((values: MiningPoolUpdate) => {
      if (currentRow) {
        const updatedData: MiningPoolUpdate = {
          ...values,
          id: currentRow.id,
        };
        handleSave(editableKey, updatedData);
        setIsModalOpen(false);
        form.resetFields();
      }
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  // @ts-ignore
  const StatusColumn = ({ status }) => {
    let statusText = "";
    let statusStyle = {};

    if (status === 1) {
      statusText = "活跃";
      statusStyle = { color: "green" }; // 活跃状态，绿色
    } else if (status === 0) {
      statusText = "暂停";
      statusStyle = { color: "red" }; // 暂停状态，红色
    }

    return <span style={statusStyle}>{statusText}</span>;
  };

  useEffect(() => {
    if (poolsData && poolsData.data) {
      const newData = poolsData.data.map(
        (
          item: {
            id: any;
            venue_name: any;
            venue_id: any;
            pool_name: any;
            country: any;
            status: any;
            pool_category: any;
            theoretical_hashrate: any;
            energy_ratio: any;
            basic_hosting_fee: any;
            link: any;
          },
          index: any,
        ) => ({
          serialNumber: index + 1,
          key: item.id, // 使用 ID 作为唯一 key
          // @ts-ignore
          venue_id: item.venue_info.id,
          // @ts-ignore
          venue_name: item.venue_info.venue_name,
          pool_name: item.pool_name,
          country: item.country,
          status: item.status,
          pool_category: item.pool_category,
          theoretical_hashrate: item.theoretical_hashrate,
          energy_ratio: item.energy_ratio,
          basic_hosting_fee: item.basic_hosting_fee,
          link: item.link,
        }),
      );
      setTableData(newData); // 设置表格数据源
    }
    if (isModalOpen) {
      //console.log("56565", currentRow?.id);
      form.setFieldsValue(currentRow); // 设置表单初始值
    }
  }, [poolsData, currentRow, editableKey]);

  // 表头定义
  useEffect(() => {
    setColumns([
      {
        // title: "序号", // 使用英文标题
        dataIndex: "serialNumber",
        key: "serialNumber",
        width: 40,
        render: (_: any, record: { serialNumber?: any; link?: any }) => {
          const { link } = record;
          // 根据 observer_link 内容返回不同的图标
          if (link.includes("antpool")) {
            return <FaAdn style={{ color: "green", fontSize: 16 }} />;
          } else if (link.includes("f2pool")) {
            return <FaFish style={{ color: "orange", fontSize: 16 }} />;
          } else {
            return <span>{record.serialNumber}</span>; // 如果没有匹配，则返回序号
          }
        },
      },
      {
        title: "场地",
        dataIndex: "venue_name",
        key: "venue_name",
        width: 100,
        // render: (text: any) => <span style={{ color: "#333" }}>{text}</span>,
        render: (text: any) => (
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
                color: "#333",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </div>
          </Tooltip>
        ),
      },
      {
        title: "子账户",
        dataIndex: "pool_name",
        key: "pool_name",
        width: 200,
        // render: (text: any) => <span style={{ color: "#333" }}>{text}</span>,
        render: (text: any) => (
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
                color: "#333",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </div>
          </Tooltip>
        ),
      },
      {
        title: "场地类型",
        dataIndex: "pool_category",
        key: "pool_category",
        width: 75,
      },
      {
        title: "所属国家",
        dataIndex: "country",
        key: "country",
        width: 75,
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 75,
        sorter: (a: any) => {
          // 直接比较数值
          return a.status; // 返回值用于升序排序
        },
        render: (_text: any, record: { status: unknown }) => <StatusColumn status={record.status} />,
      },
      {
        title: "理论算力(PH/s)",
        dataIndex: "theoretical_hashrate",
        key: "theoretical_hashrate",
        width: 140,
        sorter: (a: any, b: any) => {
          // 直接比较数值
          return a.theoretical_hashrate - b.theoretical_hashrate; // 返回值用于升序排序
        },
      },
      {
        title: "能耗比(J/T)",
        dataIndex: "energy_ratio",
        key: "energy_ratio",
        width: 120,
      },
      {
        title: "基础托管费($/kwh)",
        dataIndex: "basic_hosting_fee",
        key: "basic_hosting_fee",
        width: 150,
      },
      {
        title: "链接",
        dataIndex: "link",
        key: "link",
        width: 200,
        render: (link: string) => (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1E90FF", fontSize: 12 }}
            title={link} // 悬停显示完整链接
          >
            {link.length > 40 ? getShortenedLink(link) : link}
          </a>
        ),
      },
      {
        title: "操作",
        valueType: "option1",
        key: "operation",
        width: 100,
        render: (_text: any, record: any) => (
          <>
            <a key={`edit-${record.key}`} onClick={() => showModal(record)} style={{ marginRight: "7px" }}>
              <FormOutlined />
            </a>
            <Popconfirm
              title="确认删除此记录吗？"
              onConfirm={() => handleDelete(record.key)} // 调用 onDelete
              okText="是"
              cancelText="否"
            >
              <a key={`delete-${record.key}`}>
                {/* 删除 */}
                <DeleteOutlined style={{ color: "red" }} />
              </a>
            </Popconfirm>
          </>
        ),
        // render: (record: { key: number }, action: { startEditable: (arg0: any) => void }) => [
        //   <a key={`edit-${record.key}`} onClick={() => showModal(record.key, record)}>
        //     {/* // <a key={`edit-${record.key}`} onClick={() => showModal(record.key)}> */}
        //     {/* 编辑 */}
        //     <FormOutlined />
        //   </a>,
        //   <Popconfirm
        //     title="确认删除此记录吗？"
        //     onConfirm={() => handleDelete(record.key)} // 调用 onDelete
        //     okText="是"
        //     cancelText="否"
        //   >
        //     <a key={`delete-${record.key}`}>
        //       {/* 删除 */}
        //       <DeleteOutlined style={{ color: "red" }} />
        //     </a>
        //   </Popconfirm>,
        // ],
      },
    ]);
  }, []);

  // Loading 状态
  if (isLoadingPools) {
    return <Spin tip="加载中..." />;
  }

  const handleNewMiningPool = async (values: MiningPool) => {
    setIsLoadingNewPool(true); // 开始加载
    newMutation.mutate(values, {
      onSuccess: () => {
        message.success("添加成功");
        setIsLoadingNewPool(false); // 请求成功，停止加载
      },
      onError: (error) => {
        message.error(`添加失败: ${error.message}`);
        setIsLoadingNewPool(false); // 请求成功，停止加载
      },
    });
  };

  const handleDelete = (recordId: number): Promise<void> => {
    return new Promise(() => {
      deleteMutation.mutate(recordId, {
        onSuccess: () => {
          message.success("删除记录成功");
        },
        onError: (error) => {
          message.error(`删除记录失败: ${error.message}`);
        },
      });
    });
  };

  const handleSave = (rowKey: number, data: { [x: string]: any }): Promise<void> => {
    const miningPoolUpdate: MiningPoolUpdate = {
      id: rowKey as number, // 假设 rowKey 是 RecordID
      venue_id: data.venue_id,
      pool_name: data.pool_name,
      pool_type: poolType,
      country: data.country,
      status: data.status,
      pool_category: data.pool_category,
      theoretical_hashrate: String(data.theoretical_hashrate),
      energy_ratio: String(data.energy_ratio),
      basic_hosting_fee: String(data.basic_hosting_fee),
      link: data.link,
    };

    return new Promise(() => {
      updateMutation.mutate(miningPoolUpdate, {
        onSuccess: () => {
          message.success("更新成功");
        },
        onError: (error) => {
          message.error(`更新失败: ${error.message}`);
        },
      });
    });
  };

  const handlePoolCategoryChange = (e: any) => {
    setPoolCategoryType(e.target.value);
    localStorage.setItem(`${StoragePrefix}_poolCategory`, e.target.value);
  };

  const onDownload = () => {
    // @ts-ignore
    exportMiningPoolListToExcel(filteredData);
  };

  // 搜索处理函数
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 根据搜索词过滤数据
  const filteredData = tableData.filter((item: { [s: string]: unknown } | ArrayLike<unknown>) => {
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  });

  // @ts-ignore
  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
      >
        <div className={"flex"}>
          <div className={"mr-4"}>
            <Radio.Group className="filterRadio" onChange={handlePoolCategoryChange} value={poolCategory}>
              <Radio.Button value="主矿池">主矿池</Radio.Button>
              <Radio.Button value="备用矿池">备用矿池</Radio.Button>
            </Radio.Group>
          </div>
        </div>
        <div>
          <Input
            prefix={<SearchOutlined style={{ color: "rgba(0, 0, 0, 0.25)" }} size={18} />}
            placeholder="请输入搜索字段"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: 250 }} // 设定宽度
            className="text-sm mr-10"
          />
          <ActionButton
            label={"添加矿池"}
            // @ts-ignore
            initialValues={emptyData}
            onSubmit={handleNewMiningPool}
            FormComponent={EditForm}
            mode={ActionButtonMode.ADD}
          />
          <Button
            // type="primary"
            // icon={<DownloadOutlined />}
            icon={<ExportOutlined className="exportIcon" />}
            size="middle"
            className={"text-blue-500 exportButton"}
            style={{ marginLeft: "10px" }}
            onClick={onDownload}
          >
            导出
          </Button>
        </div>
      </div>

      {/* 覆盖在 EditTable 上方的 Spin */}
      {isLoadingNewPool && (
        <Spin
          tip="正在添加矿池..."
          size="large"
          style={{
            position: "absolute", // 绝对定位
            top: "30%", // 垂直居中
            left: "50%", // 水平居中
            transform: "translate(-50%, -50%)", // 使用 transform 进行中心对齐
            zIndex: 1000, // 确保在最上层
          }}
        />
      )}

      {isLoadingPools ? (
        <Spin style={{ marginTop: 20 }} />
      ) : (
        <EditTable
          tableData={filteredData}
          setTableData={setTableData}
          columns={columns}
          handleDelete={handleDelete}
          handleSave={handleSave}
        />
      )}
      <Modal
        title="修改矿池"
        className="editModal"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          name="basic"
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          // onFinish={onFinish}
          // onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          {/* <Form.Item<FieldType>
            label="ID"
            name="id"
          >
            <Input />
          </Form.Item> */}
          <Form.Item<FieldType>
            label="子账户名称"
            name="pool_name"
            rules={[{ required: true, message: "Please input your pool pool_name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="场地"
            name="venue_id" // 用于存储选中的场地 ID
            rules={[{ required: true, message: "请选择场地!" }]} // 添加验证规则
          >
            <Select
              placeholder="请选择场地"
              allowClear
              style={{ width: "100%" }} // 设置宽度为100%
            >
              {venueList?.data?.map((venue: { id: number; venue_name: string }) => (
                <Option key={venue.id} value={venue.id}>
                  {venue.venue_name} {/* 使用场地名称作为展示内容 */}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* <Form.Item<FieldType>
            label="矿池类型"
            name="pool_type"
            rules={[{ required: true, message: "Please input your pool_type!" }]}
          >
            <Input />
          </Form.Item> */}

          <Form.Item<FieldType>
            label="场地类型"
            name="pool_category"
            rules={[{ required: true, message: "Please input your pool_category!" }]}
          >
            <Select
              placeholder="请选择场地类型"
              // onChange={onGenderChange}
              allowClear
              style={{ backgroundColor: "white" }}
            >
              <Option value="主矿池">主矿池</Option>
              <Option value="备用矿池">备用矿池</Option>
            </Select>
          </Form.Item>

          <Form.Item<FieldType>
            label="所属国家"
            name="country"
            rules={[{ required: true, message: "Please input your country!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="状态"
            name="status"
            rules={[{ required: true, message: "Please input your country!" }]}
          >
            <Radio.Group
              name="radiogroup"
              defaultValue={1}
              options={[
                { value: 0, label: "暂停" },
                { value: 1, label: "活跃" },
              ]}
            />
          </Form.Item>

          <Form.Item<FieldType>
            label="理论算力"
            name="theoretical_hashrate"
            rules={[{ required: true, message: "Please input your theoretical_hashrate!" }]}
          >
            {/* <Input /> */}
            <InputNumber<string>
              style={{ width: 200 }}
              // defaultValue="1"
              min="0"
              max="100000"
              step="0.01"
              stringMode
            />
          </Form.Item>

          <Form.Item<FieldType>
            label="能耗比"
            name="energy_ratio"
            rules={[{ required: true, message: "Please input your energy_ratio!" }]}
          >
            {/* <Input /> */}
            <InputNumber<string>
              style={{ width: 200 }}
              // defaultValue="1"
              min="0"
              max="100000"
              step="0.01"
              stringMode
            />
          </Form.Item>

          <Form.Item<FieldType>
            label="基础托管费"
            name="basic_hosting_fee"
            rules={[{ required: true, message: "Please input your basic_hosting_fee!" }]}
          >
            {/* <Input /> */}
            <InputNumber<string>
              style={{ width: 200 }}
              // defaultValue="1"
              min="0"
              max="100000"
              step="0.01"
              stringMode
            />
          </Form.Item>

          <Form.Item<FieldType>
            label="Link"
            name="link"
            rules={[{ required: true, message: "Please input your link!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
