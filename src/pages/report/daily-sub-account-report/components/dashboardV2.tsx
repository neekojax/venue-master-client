// import React from "react";
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
              <div style={{ fontSize: 28, fontWeight: 600, margin: "8px 0" }}>{item.value}</div>
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
