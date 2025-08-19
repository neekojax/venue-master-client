import React, { type ErrorInfo } from "react";
import { Button, Result } from "antd";

type ErrorBoundaryProps = {
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};
/**
 * ErrorBoundary 是一个组件，它可以捕获其子组件渲染过程中的错误，并渲染一个备用 UI 而不是崩溃的组件树。
 * - https://zh-hans.react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 示例“组件堆栈”：
    //   在 ComponentThatThrows 中（由 App 创建）
    //   在 ErrorBoundary 中（由 APP 创建）
    //   在 div 中（由 APP 创建）
    //   在 App 中
    // 打印错误信息
    // 或者将错误日志上报给服务器
    console.error(error, info); // eslint-disable-line no-console

    // logErrorToMyService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      <Result
        status="error"
        title="加载失败"
        subTitle="前端文件可能已经更新版本，请刷新页面"
        extra={[
          <Button key="reload" type="primary" onClick={() => window.location.reload()}>
            刷新页面
          </Button>,
        ]}
      />;
      // return this.props.fallback ? this.props.fallback : <h2>Something went wrong.</h2>;
    }

    return this.props.children;
  }
}
