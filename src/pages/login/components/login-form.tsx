import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, type FormProps, Input } from "antd";
import CryptoJS from "crypto-js"; // 导入 crypto-js
import { useLogin } from "../api";
import { ROUTE_PATHS } from "@/constants/common";

import { LoginField } from "@/pages/login/type.ts";

export default function LoginForm() {
  const navigate = useNavigate();

  // const [captcha, setCaptcha] = useState("");
  // const [captchaId, setCaptchaId] = useState("");

  const { mutate: onLogin, isPending } = useLogin();

  useEffect(() => {
    // 假设你有一个函数来获取验证码数据
    // loadCaptcha();
  }, []);

  // const loadCaptcha = async () => {
  //   try {
  //     const data = await fetchCaptcha();
  //     // @ts-ignore
  //     if (data.success) {
  //       setCaptcha(data.data.captcha); // 设置 captcha 状态
  //       setCaptchaId(data.data.captchaId); // 设置 captcha Id
  //     } else {
  //       // 处理失败情况
  //       // @ts-ignore
  //       console.error("获取验证码失败:", data.message);
  //     }
  //   } catch (error) {
  //     console.error("网络错误:", error);
  //   }
  // };
  //
  // const refreshCaptcha = () => {
  //   loadCaptcha(); // 点击验证码图片时重新加载验证码
  // };

  const onFinish: FormProps<LoginField>["onFinish"] = async (values) => {
    if (isPending) return;
    // values.captchaId = captchaId;
    values.password = CryptoJS.MD5(values.password || "").toString();

    try {
      const data = await onLogin(values);
      localStorage.setItem("access_token", data.data.access_token);
      localStorage.setItem("" + "refresh_token", data.data.refresh_token);

      navigate(ROUTE_PATHS.landing);
      setTimeout(() => {
        window.$notification?.success({
          message: "登录成功",
          description: "欢迎回来",
        });
      }, 300);
    } catch (err) {
      window.$notification?.error({
        // @ts-ignore
        message: err.toString(),
      });
    }
  };

  const onFinishFailed: FormProps<LoginField>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      initialValues={{ username: "", password: "" }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item name="name" rules={[{ required: true, message: "请输入用户名" }]}>
        <Input addonBefore={<UserOutlined />} placeholder="请输入用户名" />
      </Form.Item>

      <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
        <Input.Password addonBefore={<LockOutlined />} placeholder="请输入密码" />
      </Form.Item>

      {/*<Form.Item name="captcha" rules={[{ required: true, message: "请输入验证码" }]}>*/}
      {/*  <div style={{ display: "flex", alignItems: "center" }}>*/}
      {/*    <Input addonBefore={<CodeOutlined />} placeholder="请输入验证码" style={{ flex: 1 }} />*/}
      {/*    <img*/}
      {/*      src={captcha}*/}
      {/*      alt="验证码"*/}
      {/*      style={{ marginLeft: "10px", height: "40px", cursor: "pointer" }}*/}
      {/*      onClick={refreshCaptcha}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*</Form.Item>*/}

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={isPending}>
          登录
        </Button>
      </Form.Item>
    </Form>
  );
}
