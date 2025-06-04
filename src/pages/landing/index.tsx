import { Line } from "@ant-design/plots";
import { Col, Row, Spin } from "antd";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";

import MiningPoolCard from "@/pages/landing/components/mining-pool-card.tsx";
import { useCustodyHostingFeeCurve } from "@/pages/landing/hook.ts";

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

    title: "托管费占比曲线",
  };

  return (
    <div>
      <Row gutter={24}>
        <Col xs={24} sm={12}>
          <MiningPoolCard poolType="NS" />
        </Col>
        <Col xs={24} sm={12}>
          <MiningPoolCard poolType="CANG" />
        </Col>
      </Row>
      <div className="mt-20 ml-10 w-10/12">
        <div className="mt-10">
          {isLoadingHosting ? (
            <Spin style={{ marginTop: 20 }} />
          ) : (
            <div style={{ width: "100%", height: "350px" }}>
              {" "}
              {/* 设置宽度为100% */}
              <Line {...config} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
