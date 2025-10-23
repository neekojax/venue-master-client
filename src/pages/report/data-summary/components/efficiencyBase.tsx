export type EfficiencyStat = {
  cumulativeOutput: number;
  dailyOutput: number;
  hashEffective: number;
  mtdOutput: number;
  networkHashRate: number;
  totalHash: number;
};
const EfficiencyBase: React.FC<{ data: EfficiencyStat }> = ({ data }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-4 h-[154px] border border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-gray-500" style={{ minWidth: "80px" }}>
                  算力
                </div>
                <div className="text-xl text-gray-800">
                  {data?.totalHash.toFixed(2)} <span className="text-sm text-gray-400">EH/s</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-gray-500" style={{ minWidth: "80px" }}>
                  全网比例
                </div>
                <div className="text-xl text-gray-800">{data?.networkHashRate.toFixed(2)}%</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-gray-500" style={{ minWidth: "80px" }}>
                  算力有效率
                </div>
                <div className="text-xl text-gray-800">{data?.hashEffective.toFixed(2)}%</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-gray-500" style={{ minWidth: "80px" }}>
                  日产出
                </div>
                <div className="text-xl text-gray-800">
                  {data?.dailyOutput.toFixed(2)} <span className="text-sm text-gray-400">BTC</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-gray-500" style={{ minWidth: "80px" }}>
                  MTD产出
                </div>
                <div className="text-xl text-gray-800">
                  {data?.mtdOutput.toFixed(2)} <span className="text-sm text-gray-400">BTC</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-gray-500" style={{ minWidth: "80px" }}>
                  累计产出
                </div>
                <div className="text-xl text-gray-800">
                  {data?.cumulativeOutput.toFixed(2)} <span className="text-sm text-gray-400">BTC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EfficiencyBase;
