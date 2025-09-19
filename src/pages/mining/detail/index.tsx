import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseOutlined, RetweetOutlined } from "@ant-design/icons";
import { Tabs } from "antd";

import HostList from "@/pages/mining/detail/components/Host-list.tsx";
import OperationLog from "@/pages/mining/detail/components/Operation-Log.tsx";

const MiningDetailPage: React.FC = () => {
  useParams<{ venueId: string; poolId: string }>();

  return (
    <div>
      {/* <div className="mb-4 text-lg font-semibold">矿池详情</div> */}
      <Tabs
        defaultActiveKey="log"
        tabBarGutter={24}
        type="line"
        size="middle"
        items={[
          {
            key: "log",
            label: (
              <>
                <RetweetOutlined /> 算力变更
              </>
            ),
            children: <OperationLog />,
          },
          {
            key: "host",
            label: (
              <>
                <DatabaseOutlined /> 托管信息
              </>
            ),
            children: <HostList />,
          },
        ]}
      />
    </div>
  );
};

export default MiningDetailPage;
