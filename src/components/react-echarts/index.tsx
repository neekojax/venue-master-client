import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { CanvasRenderer, SVGRenderer } from "echarts/renderers";
import echarts from "./library";
import { cn } from "@/utils";

interface ReactEchartsProps {
  theme?: string;
  renderer?: "canvas" | "svg";
  option: any;
  className?: string;
  style?: React.CSSProperties;
}

interface RefProps {
  getEChartInstance: () => echarts.ECharts | null;
}

export const ReactEcharts = forwardRef<RefProps, ReactEchartsProps>(function (
  { theme = "light", option, renderer, className, style },
  ref,
) {
  const eleRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  echarts.use(renderer === "svg" ? SVGRenderer : CanvasRenderer);

  useImperativeHandle(ref, () => ({
    getEChartInstance: () => chartInstance.current,
  }));

  useEffect(() => {
    if (!eleRef.current) return;

    chartInstance.current = echarts.init(eleRef.current, theme, { renderer });

    const resizeChart = () => {
      chartInstance.current?.resize();
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeChart();
    });

    resizeObserver.observe(eleRef.current);
    window.addEventListener("resize", resizeChart);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeChart);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [theme, renderer]);

  useEffect(() => {
    chartInstance.current?.setOption(option, true);
    chartInstance.current?.resize();
  }, [option]);

  return <div ref={eleRef} className={cn("w-full h-full", className)} style={style} />;
});

ReactEcharts.displayName = "ReactEcharts";
