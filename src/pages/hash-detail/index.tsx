import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import HashRatePieChart from "@/pages/hash-detail/components/hash-rate-pie-chart.tsx";
import HashCompletionRateHistoryTable from "@/pages/hash-detail/components/hash-completion-rate-history-table.tsx";
import HashRateHistoryTable from "@/pages/hash-detail/components/hash-rate-history-table.tsx";
import { Col, Row } from "antd";

export default function HashDetailPage() {
  useAuthRedirect();

  return (
    <div>
      <HashRatePieChart />
      <Row gutter={24} style={{ marginTop: "20px" }}>
        <Col span={10}>
          <HashCompletionRateHistoryTable />
        </Col>
        <Col span={14}>
          <HashRateHistoryTable />
        </Col>
      </Row>
    </div>
  );
}
