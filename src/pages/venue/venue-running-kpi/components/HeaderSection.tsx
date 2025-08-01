import { BarChartOutlined, DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Row, Space, Statistic, Typography } from "antd";
// import './HeaderSection.css'

const { Title, Paragraph } = Typography;

interface HeaderSectionProps {
  onChange: (value: any) => void;
  venueNum: number;
  subAccountNum: number;
}

const HeaderSection = ({ onChange, venueNum, subAccountNum }: HeaderSectionProps) => {
  return (
    // <div className='headerSection' style={{ background: '#fff', padding: '24px', borderRadius: 8, marginBottom: 24 }}>
    <div className="headerSection">
      {/* 标题与说明 */}
      <Row justify="space-between" align="middle" style={{ flexWrap: "wrap", marginBottom: 16 }}>
        <Space wrap align="start">
          <Flex vertical gap="0.825rem">
            <Title level={3} style={{ marginBottom: 0 }}>
              <span style={{ marginRight: "0.5rem" }}>
                <BarChartOutlined className="stat-value-blue" />
              </span>
              场地运行指标概览
            </Title>
            <Paragraph style={{ color: "#999" }}>实时监控各数据中心的运行状态和关键指标数据</Paragraph>
          </Flex>
        </Space>
        {/* 右侧统计数据 */}
        <Space
          style={{
            marginBottom: 16,
            background: "#f9fafe",
            border: "rgba(238,238,242) solid 1px",
            borderRadius: "0.625rem",
            padding: "0.625rem 1rem",
          }}
          wrap
          align="start"
        >
          <Flex justify="space-between" gap="0.725rem">
            <Statistic
              title={<span className="title">总场地数</span>}
              value={venueNum}
              formatter={(value) => <span className="stat-value stat-value-blue">{value}</span>}
            />
            {/* 垂直分割线 */}
            <div className="vertical-divider" />
            <Statistic
              // title="子账户数"
              title={<span className="title">子账户数</span>}
              value={subAccountNum}
              formatter={(value) => <span className="stat-value stat-value-green">{value}</span>}
            />
          </Flex>
        </Space>
      </Row>

      {/* 搜索与导出 */}
      <Row
        justify="space-between"
        align="middle"
        style={{ flexWrap: "wrap", marginBottom: 16 }}
        className="border"
      >
        <Space wrap>
          <Input
            className="custom-input"
            placeholder="搜索场地/子账户"
            onChange={onChange}
            prefix={<SearchOutlined />}
            style={{ width: 240 }}
            size="middle"
          />
          <Button icon={<DownloadOutlined />} size="middle">
            导出数据
          </Button>
        </Space>
      </Row>
    </div>
  );
};

export default HeaderSection;
