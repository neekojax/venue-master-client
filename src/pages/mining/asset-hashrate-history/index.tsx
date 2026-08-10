import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { TablePaginationConfig, TableProps } from "antd";
import { Alert, Button, DatePicker, Empty, Form, Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useAssetHashrateChangeList } from "./hook";
import type {
  AssetHashrateChangeListData,
  AssetHashrateChangePoolOption,
  AssetHashrateChangeQueryParams,
  AssetHashrateChangeRecord,
  AssetHashrateChangeVenueOption,
} from "./types";
import useAuthRedirect from "@/hooks/useAuthRedirect";

const { RangePicker } = DatePicker;

function formatDateTime(value?: string) {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

export default function AssetHashrateHistoryPage() {
  useAuthRedirect();

  const [searchForm] = Form.useForm();
  const [query, setQuery] = useState<AssetHashrateChangeQueryParams>({
    pageNum: 1,
    pageSize: 20,
  });
  const selectedVenueId = Form.useWatch("venue_id", searchForm);

  const listQuery = useAssetHashrateChangeList(query);

  const listData = useMemo<AssetHashrateChangeListData>(() => {
    const payload = listQuery.data?.data;
    return {
      list: Array.isArray(payload?.list) ? payload.list : [],
      total: Number(payload?.total ?? 0),
      page: Number(payload?.page ?? payload?.pageNum ?? query.pageNum ?? 1),
      pageNum: Number(payload?.pageNum ?? payload?.page ?? query.pageNum ?? 1),
      pageSize: Number(payload?.pageSize ?? query.pageSize ?? 20),
      hasMore: Boolean(payload?.hasMore),
      venues: Array.isArray(payload?.venues) ? payload.venues : [],
    };
  }, [listQuery.data, query.pageNum, query.pageSize]);

  const venueOptions = useMemo(
    () =>
      listData.venues.map((venue: AssetHashrateChangeVenueOption) => ({
        label: `${venue.venue_name || "-"} (${venue.venue_id})`,
        value: venue.venue_id,
      })),
    [listData.venues],
  );

  const poolOptions = useMemo(() => {
    const normalizePoolLabel = (pool: AssetHashrateChangePoolOption) => {
      const categorySuffix = pool.pool_category ? ` · ${pool.pool_category}` : "";
      return `${pool.pool_name || "-"} (${pool.pool_id})${categorySuffix}`;
    };

    if (selectedVenueId) {
      const currentVenue = listData.venues.find((venue) => venue.venue_id === selectedVenueId);
      return (currentVenue?.pools || []).map((pool) => ({
        label: normalizePoolLabel(pool),
        value: pool.pool_id,
      }));
    }

    return listData.venues.flatMap((venue) =>
      (venue.pools || []).map((pool) => ({
        label: `${venue.venue_name || "-"} / ${normalizePoolLabel(pool)}`,
        value: pool.pool_id,
      })),
    );
  }, [listData.venues, selectedVenueId]);

  useEffect(() => {
    const currentPoolId = searchForm.getFieldValue("pool_id");
    if (!currentPoolId) {
      return;
    }

    const poolExists = poolOptions.some((pool) => pool.value === currentPoolId);
    if (!poolExists) {
      searchForm.setFieldValue("pool_id", undefined);
    }
  }, [poolOptions, searchForm]);

  const handleSearch = useCallback(
    (values: any) => {
      setQuery({
        pageNum: 1,
        pageSize: query.pageSize ?? 20,
        venue_id: values.venue_id ? Number(values.venue_id) : undefined,
        pool_id: values.pool_id ? Number(values.pool_id) : undefined,
        hashrate_changed_at_start: values.hashrate_changed_at?.[0]
          ? dayjs(values.hashrate_changed_at[0]).format("YYYY-MM-DD HH:mm:ss")
          : undefined,
        hashrate_changed_at_end: values.hashrate_changed_at?.[1]
          ? dayjs(values.hashrate_changed_at[1]).format("YYYY-MM-DD HH:mm:ss")
          : undefined,
        updated_at_start: values.updated_at?.[0]
          ? dayjs(values.updated_at[0]).format("YYYY-MM-DD HH:mm:ss")
          : undefined,
        updated_at_end: values.updated_at?.[1]
          ? dayjs(values.updated_at[1]).format("YYYY-MM-DD HH:mm:ss")
          : undefined,
      });
    },
    [query.pageSize],
  );

  const handleReset = useCallback(() => {
    searchForm.resetFields();
    setQuery({
      pageNum: 1,
      pageSize: query.pageSize ?? 20,
    });
  }, [query.pageSize, searchForm]);

  const columns = useMemo<ColumnsType<AssetHashrateChangeRecord>>(
    () => [
      {
        title: "序号",
        key: "index",
        width: 76,
        render: (_: unknown, __: AssetHashrateChangeRecord, index: number) =>
          (listData.pageNum - 1) * listData.pageSize + index + 1,
      },
      {
        title: "场地",
        dataIndex: "venue_name",
        key: "venue_name",
        width: 220,
        render: (value: string | undefined) => (
          <div className="font-medium text-slate-800 break-all">{value || "-"}</div>
        ),
      },
      {
        title: "子账户",
        dataIndex: "pool_name",
        key: "pool_name",
        width: 240,
        render: (value: string | undefined) => (
          <div className="font-medium text-slate-800 break-all">{value || "-"}</div>
        ),
      },
      {
        title: "托管机器",
        dataIndex: "hosted_machine",
        key: "hosted_machine",
        width: 120,
        align: "right",
        render: (value: number | undefined) => (
          <span className="font-medium text-slate-700">{value != null ? value : "-"}</span>
        ),
      },
      {
        title: "理论算力",
        dataIndex: "theoretical_hashrate",
        key: "theoretical_hashrate",
        width: 140,
        align: "right",
        render: (value: number | undefined) => (
          <span className="font-semibold text-slate-900">{value != null ? `${value} T` : "-"}</span>
        ),
      },
      {
        title: "算力变更时间",
        dataIndex: "hashrate_changed_at",
        key: "hashrate_changed_at",
        width: 180,
        render: (value: string | undefined) => (
          <span className="text-slate-600">{formatDateTime(value)}</span>
        ),
      },
      {
        title: "更新时间",
        dataIndex: "updated_at",
        key: "updated_at",
        width: 180,
        render: (value: string | undefined) => (
          <span className="text-slate-600">{formatDateTime(value)}</span>
        ),
      },
    ],
    [listData.pageNum, listData.pageSize],
  );

  const pagination: TablePaginationConfig = {
    current: listData.pageNum,
    pageSize: listData.pageSize,
    total: listData.total,
    showSizeChanger: true,
    pageSizeOptions: [20, 50, 100, 200],
    showTotal: (total) => `共 ${total} 条记录`,
    locale: { items_per_page: "条/页" },
    onChange: (page, pageSize) => {
      setQuery((prev) => ({
        ...prev,
        pageNum: page,
        pageSize,
      }));
    },
  };

  const tableLocale: TableProps<AssetHashrateChangeRecord>["locale"] = {
    emptyText: (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={query.venue_id || query.pool_id ? "暂无匹配数据" : "暂无资产变更历史数据"}
      />
    ),
  };

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f7fafc_0%,#f5f5f5_28%,#f5f5f5_100%)] -m-4 p-4">
      <div className="mx-auto flex w-full max-w-full flex-col gap-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <Form
                form={searchForm}
                layout="vertical"
                colon={false}
                onFinish={handleSearch}
                className="[&_.ant-form-item]:!mb-0 [&_.ant-form-item-label]:!pb-2 [&_.ant-form-item-label>label]:!text-[13px] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label>label]:!text-slate-700"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Form.Item name="venue_id" label="场地">
                    <Select
                      allowClear
                      showSearch
                      placeholder="请选择场地"
                      optionFilterProp="label"
                      options={venueOptions}
                    />
                  </Form.Item>
                  <Form.Item name="pool_id" label="子账户">
                    <Select
                      allowClear
                      showSearch
                      placeholder={selectedVenueId ? "请选择该场地下的子账户" : "请选择子账户"}
                      optionFilterProp="label"
                      options={poolOptions}
                    />
                  </Form.Item>
                  <Form.Item name="hashrate_changed_at" label="变更时间">
                    <RangePicker showTime className="!w-full" />
                  </Form.Item>
                  <Form.Item name="updated_at" label="更新时间">
                    <RangePicker showTime className="!w-full" />
                  </Form.Item>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-slate-200/80 pt-4">
                  <Button onClick={handleReset}>重置</Button>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    查询记录
                  </Button>
                </div>
              </Form>
            </div>
          </div>

          {listQuery.isError ? (
            <Alert
              className="m-4"
              type="error"
              showIcon
              message={(listQuery.error as Error)?.message || "资产变更历史列表加载失败"}
            />
          ) : null}

          <div className="px-4 pb-4 pt-4">
            <Table<AssetHashrateChangeRecord>
              rowKey="id"
              columns={columns}
              dataSource={listData.list}
              loading={listQuery.isLoading || listQuery.isFetching}
              size="middle"
              scroll={{ x: 1200 }}
              locale={tableLocale}
              pagination={pagination}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
