
import React from 'react';
import { Tooltip, Typography } from 'antd';
import { BlockMath } from 'react-katex';

import { InfoCircleOutlined } from "@ant-design/icons";
import 'katex/dist/katex.min.css';

const { Text } = Typography;

const FormulaYouxiaolvTooltip = () => {
    // 定义公式的 LaTeX 表达式
    // const formula = `在线率 = \\frac{理论在线数}{理论在架数} = \\frac{\\frac{24小时算力 \\times 托管台数}{理论算力}}{托管台数 - 总故障数 - 不可抗力因素影响的台数}`;
    const formula = `净有效率=\\frac{24H有效算力}{理论算力-预报废态算力}`;

    return (
        <Tooltip
            classNames={{ root: 'formula-tooltip-root-300' }}
            title={
                <div style={{ padding: '8px 0px', fontSize: "13px", width: '250px' }}>
                    <BlockMath math={formula} />
                </div>
            }
            placement="top"
        >
            <Text underline style={{ cursor: 'help' }}>
                {/* 在线率公式 */}
                <InfoCircleOutlined style={{
                    marginLeft: 4,
                    color: "#1890ff",
                    cursor: "pointer"
                }} />
                {/* <InlineMath color="blue" math="\\{ⓘ}" /> */}

            </Text>
        </Tooltip>
    );
};

export default FormulaYouxiaolvTooltip;