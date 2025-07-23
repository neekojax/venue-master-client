import React from "react";
import { Button, Card, Col, Form, Input, message, Row } from "antd";

const ChangePasswordForm: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const { currentPassword, newPassword, confirmPassword } = values;
    if (currentPassword == "") {
      message.error("原密码不能为空！");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error("两次新密码不一致！");
      return;
    }

    // 模拟提交逻辑
    console.log("修改密码数据：", values);
    message.success("密码修改成功！");
    form.resetFields();
  };

  return (
    <div>
      <Row gutter={24} style={{ marginTop: "16px" }}>
        <Col span={6}></Col>
        <Col span={12}>
          <Card title="修改密码" style={{ margin: "0 auto", marginTop: 80 }}>
            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item
                label="当前密码"
                name="currentPassword"
                rules={[{ required: true, message: "请输入当前密码" }]}
              >
                <Input.Password placeholder="请输入当前密码" />
              </Form.Item>

              <Form.Item
                label="新密码"
                name="newPassword"
                rules={[
                  { required: true, message: "请输入新密码" },
                  { min: 6, message: "密码不能少于6位" },
                ]}
              >
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>

              <Form.Item
                label="确认新密码"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "请确认新密码" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("两次输入的新密码不一致！"));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请再次输入新密码" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  确认修改
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={6}></Col>
      </Row>
    </div>
  );
};

export default ChangePasswordForm;
