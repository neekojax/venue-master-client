import { Button, DatePicker, Flex, Typography } from "antd";
import { Test1 } from "./components/test-1";
import { Test2 } from "./components/test-2";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";

const { RangePicker } = DatePicker;

export default function LandingPage() {
  useAuthRedirect();
  return (
    <>
      <Typography.Title level={4}>首页</Typography.Title>
      {/*<Flex gap={16} wrap>*/}
      {/*  <RangePicker />*/}
      {/*  <Button type="primary" onClick={() => window.$message?.success("show message success!")}>*/}
      {/*    message*/}
      {/*  </Button>*/}
      {/*</Flex>*/}
      {/*<Flex gap={16}>*/}
      {/*  <Test1 />*/}
      {/*  <Test2 />*/}
      {/*</Flex>*/}
      <div className="h-screen" />
    </>
  );
}
