import { Spin, Typography } from "antd";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useCustodyHostingFeeCurve } from "@/pages/landing/hook.ts";
import { Line } from "@ant-design/plots";

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
    <div className="flex">
      <div className="mt-10">
        {isLoadingHosting ? <Spin style={{ marginTop: 20 }} /> : <Line {...config} />}
      </div>

      <div className="mt-20 ml-10">
        <Typography.Paragraph></Typography.Paragraph>
        {/* 可以添加更多内容 */}
      </div>
    </div>
  );
}
