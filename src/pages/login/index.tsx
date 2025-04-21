import { Helmet } from "react-helmet-async";
import { Card, Layout, Typography } from "antd";
import { ThemeSwitch } from "@/components/theme-switch";
import loginBg from "../../../public/aa.webp";
import LoginForm from "./components/login-form";

export default function Login() {
  return (
    <>
      <Helmet>
        <title>登录页 | {import.meta.env.VITE_APP_TITLE_SUFFIX}</title>
      </Helmet>
      <Layout className="min-h-screen relative">
        <Layout.Content className="flex">
          <div className="w-2/5  hidden md:flex justify-center items-center ml-[100px]">
            <img src={loginBg} alt="登录图标" /> {/* 使用登录图标 */}
          </div>
          <div className="w-screen md:w-3/5 flex justify-center items-center">
            <Card
              title={
                <Typography.Title level={2} className="flex justify-center pt-8 pb-4">
                  管理系统
                </Typography.Title>
              }
              className="w-[450px]"
            >
              {/*<Alert message="用户名：admin，密码：123456" type="info" showIcon className="mb-6" />*/}
              <LoginForm />
              {/*<Divider>其他登录方式</Divider>*/}
              {/*<ThirdPartyLogin />*/}
            </Card>
          </div>
        </Layout.Content>
        <div className="absolute top-4 right-4">
          <ThemeSwitch />
        </div>
      </Layout>
    </>
  );
}
