// import React from "react";
import CountUp from "react-countup";
import { Card, Col, Row } from "antd";
// import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const DashboardCards = ({ data }: { data: any[] }) => {
  return (
    <Row gutter={[16, 16]}>
      {data.map((item, index) => {
        // const isUp = item.change.startsWith("+");
        return (
          <Col xs={12} sm={8} md={6} lg={6} key={index}>
            <Card
              bordered
              style={{
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 14, color: "#888" }}>{item.title}</div>
              <div style={{ fontSize: 28, fontWeight: 600, margin: "8px 0" }}>
                {/* {item.value}-- */}
                <CountUp
                  end={item.value} // 最终值
                  duration={1.5} // 动画时长（秒）
                  separator="," // 千分位分隔符
                  decimals={item.decimals} // 保留?位小数
                />
                &nbsp;&nbsp;
                {item.unit}
              </div>
              {/* <div
                                style={{
                                    color: isUp ? "#3f8600" : "#cf1322",
                                    fontSize: 14,
                                }}
                            >
                                {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                {item.change}
                            </div> */}
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default DashboardCards;
