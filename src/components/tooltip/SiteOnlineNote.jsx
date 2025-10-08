import React from 'react';
import { Tooltip, Typography } from 'antd';
import { InlineMath, BlockMath } from 'react-katex';
import { InfoCircleOutlined } from "@ant-design/icons";
import 'katex/dist/katex.min.css';

const { Text } = Typography;

const FormulaTooltip = () => {
    // 定义公式的 LaTeX 表达式
    // const formula = `在线率 = \\frac{理论在线数}{理论在架数} = \\frac{\\frac{24小时算力 \\times 托管台数}{理论算力}}{托管台数 - 总故障数 - 不可抗力因素影响的台数}`;
    // const formula = `\\frac{\\text{托管台数} - \\text{总故障数} - \\text{不可抗力因素影响的台数}}`;
    const formula = `\\text{托管台数} - \\text{总故障数} - \\text{不可抗力因素影响的台数}`;
    return (
        <Tooltip
            classNames={{ root: 'formula-tooltip-root-350' }}
            title={
                <div style={{ padding: '8px 0px', fontSize: "13px", }}>
                    <BlockMath math={formula} />
                </div>
            }
            placement="top"
        >
            <Text style={{ cursor: 'help' }}>
                {/* 在线率公式 */}
                在架台数
                <InfoCircleOutlined style={{
                    marginLeft: 4,
                    color: "#1890ff",
                    cursor: "pointer"
                }} />
                &nbsp;：
                {/* <InlineMath color="blue" math="\\{ⓘ}" /> */}

            </Text>
        </Tooltip>
    );
};

export default FormulaTooltip;