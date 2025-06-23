import React, { useState } from "react";
import { EditableProTable } from "@ant-design/pro-components";
import { message, Pagination, Popconfirm } from "antd";

// import "../styles.css";

type EditTableProps = {
  tableData: any[];
  setTableData: React.Dispatch<React.SetStateAction<any[]>>;
  columns: any;
  handleDelete: (recordId: number) => Promise<void>; // 添加 handleDelete 作为参数
  handleSave: (rowKey: number, data: { [x: string]: string }) => Promise<void>; // 添加 handleSave 作为参数
};

const getRowClassName = (_record: any, index: number) => {
  return index % 2 === 0 ? "even-row" : "odd-row";
};

export default function EditTable({ tableData, columns, handleDelete, handleSave }: EditTableProps) {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 渲染操作列的函数
  const renderActions = (record: { key: number }, action: { startEditable: (arg0: any) => void }) => [
    <a key={`edit-${record.key}`} onClick={() => action?.startEditable?.(record.key)}>
      编辑
    </a>,
    <Popconfirm
      title="确认删除此记录吗？"
      onConfirm={() => handleDelete(record.key)} // 调用 onDelete
      okText="是"
      cancelText="否"
    >
      <a key={`delete-${record.key}`}>删除</a>
    </Popconfirm>,
  ];

  // 计算当前页的数据
  const paginatedData = tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const validateFields = (data: any) => {
    return Object.values(data).every((value) => value !== null && value !== undefined && value !== "");
  };

  return (
    <>
      <EditableProTable<any>
        rowKey="key"
        maxLength={5}
        scroll={{ x: 960 }}
        value={paginatedData}
        // onChange={(newData) => setTableData([...newData])} // 处理只读数组并转换为可变数组
        editable={{
          editableKeys,
          onChange: setEditableRowKeys,
          onSave: async (rowKey, data) => {
            // 保存逻辑，比如更新数据或者调用 API
            if (validateFields(data)) {
              // 如果验证通过，保存数据
              handleSave(rowKey as number, data);
            } else {
              // 如果验证不通过，显示提示信息
              message.error("所有字段不能为空");
            }
          },
        }}
        recordCreatorProps={false}
        columns={columns.map((col: { valueType: string }) => {
          if (col.valueType === "option") {
            return {
              ...col,
              render: (_text: any, record: any, _: any, action: any) => renderActions(record, action), // 使用 renderActions
            };
          }
          return col;
        })}
        style={{
          marginTop: 20,
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          padding: "0px",
        }}
        cardProps={{
          bodyStyle: {
            padding: 0,
          },
        }}
        tableStyle={{
          borderRadius: "8px",
          overflow: "hidden",
        }}
        tableClassName="custom-table"
        headerStyle={{
          background: "#f7f9fc",
          fontWeight: 600,
          color: "#1f2937",
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
        }}
        rowStyle={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          transition: "background-color 0.3s ease",
        }}
        rowClassName={getRowClassName} // 为主表添加行样式
      />
      {/* 分页组件 */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={tableData.length} // 总数据量
          onChange={(page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize); // 更新每页大小
          }}
          showSizeChanger
          pageSizeOptions={[10, 20, 50]} // 提供的选项
        />
      </div>
    </>
  );
}
