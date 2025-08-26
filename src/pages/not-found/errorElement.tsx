import React from "react";

type ErrorBoundaryProps = {
  fallback?: React.ReactNode;
  children?: React.ReactNode; // ✅ 这里要加
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    console.log("Error", _);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const hasReloaded = sessionStorage.getItem("hasReloaded");

    if (this.state.hasError) {
      if (!hasReloaded) {
        sessionStorage.setItem("hasReloaded", "true");
        window.location.reload();
      } else {
        sessionStorage.removeItem("hasReloaded");
        return this.props.fallback ? this.props.fallback : <h2>Something went wrong...</h2>;
      }
    }

    return this.props.children; // ✅ TS 就不会报错
  }
}

export default ErrorBoundary;
