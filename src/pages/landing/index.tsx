import { Line } from "@ant-design/plots";
import { Card, Col, Row, Spin } from "antd";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";

import MiningPoolCard from "@/pages/landing/components/mining-pool-card.tsx";
import { useCustodyHostingFeeCurve } from "@/pages/landing/hook.ts";
import MiningEfficiencyCard from "@/pages/landing/components/mining-efficiency-card.tsx";
import MiningHashCard from "@/pages/landing/components/mining-hash-card.tsx";

export default function LandingPage() {
  useAuthRedirect();

  const { data: hostingCurve, error, isLoading: isLoadingHosting } = useCustodyHostingFeeCurve();

  const config = {
    data: hostingCurve?.data,
    xField: "year",
    yField: "value",
    // sizeField: "value",
    // shapeField: "trail",
    legend: { size: false },
    colorField: "category",
    axis: {
      y: {
        // 这部分是轴标题的配置
        title: "百分比", // 修改为更合适的 y 轴标题
        titleSpacing: 30,
        titleFill: "steelblue",
      },
      // 配置 x 轴
    },
    shapeField: 'smooth'

    // title: "托管费占比曲线",
  };

  return (
    <div>
      <Row gutter={24}>
        <Col style={{ marginTop: "16px" }} xs={24} sm={12}>
          <MiningPoolCard poolType="NS" />
        </Col>
        <Col style={{ marginTop: "16px" }} xs={24} sm={12}>
          <MiningPoolCard poolType="CANG" />
        </Col>
      </Row>
      <Row gutter={24}>
        <Col style={{ marginTop: "16px" }} xs={24} sm={12}>
          <MiningHashCard />
        </Col>
        <Col style={{ marginTop: "16px" }} xs={24} sm={12}>
          <MiningEfficiencyCard />
        </Col>
      </Row>
      <div className="mt-4 w-full mb-2">
        <Card
          title="托管费占比" // 可以设置一个标题
          bordered={false} // 设置边框
          style={{ marginTop: "10px", background: "#f7f9fc" }} // Card 的外边距
        >
          <div className="">
            {isLoadingHosting ? (
              <Spin style={{ marginTop: 20 }} />
            ) : (
              <div style={{ width: "100%", height: "300px" }}>
                <Line {...config} />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
