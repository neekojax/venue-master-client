const Efficiency: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-lg">
          <i className="fas fa-tachometer-alt text-blue-500"></i>
          <span>效率</span>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4 h-[184px] border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-gray-500">算力 EH/s</div>
                  <div className="text-xl text-gray-800">968.43</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-gray-500">全网比例</div>
                  <div className="text-xl text-gray-800">15.3%</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-gray-500">算力有效率</div>
                  <div className="text-xl text-gray-800">93.5%</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-gray-500">日产出</div>
                  <div className="text-xl">470.3</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-gray-500">MTD产出</div>
                  <div className="text-xl">3,256.8</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-gray-500">累计产出</div>
                  <div className="text-xl">1,584.6</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left w-[20%]">地区</th>
              <th className="p-3 text-left w-[20%]">有效算力</th>
              <th className="p-3 text-left w-[20%]">有效率</th>
              <th className="p-3 text-left w-[20%]">日产出</th>
              <th className="p-3 text-left w-[20%]">累计产出</th>
            </tr>
          </thead>
          <tbody>
            {["北美", "阿曼", "埃塞俄比亚", "巴拉圭"].map((region) => (
              <tr key={region} className="border-b border-gray-200">
                <td className="p-3">{region}</td>
                <td className="p-3">{(Math.random() * 100 + 200).toFixed(2)} EH/s</td>
                <td className="p-3">{(Math.random() * 5 + 90).toFixed(2)}%</td>
                <td className="p-3">{(Math.random() * 50 + 100).toFixed(2)}</td>
                <td className="p-3">{(Math.random() * 200 + 300).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left w-[20%]">类型</th>
              <th className="p-3 text-left w-[20%]">有效算力</th>
              <th className="p-3 text-left w-[20%]">有效率</th>
              <th className="p-3 text-left w-[20%]">日产出</th>
              <th className="p-3 text-left w-[20%]">累计产出</th>
            </tr>
          </thead>
          <tbody>
            {["风冷", "水冷"].map((type) => (
              <tr key={type} className="border-b border-gray-200">
                <td className="p-3">{type}</td>
                <td className="p-3">{(Math.random() * 200 + 300).toFixed(2)} EH/s</td>
                <td className="p-3">{(Math.random() * 5 + 90).toFixed(2)}%</td>
                <td className="p-3">{(Math.random() * 100 + 150).toFixed(2)}</td>
                <td className="p-3">{(Math.random() * 400 + 600).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-6">
        <div className="text-gray-500 mb-2">近三天有效率</div>
        <div id="efficiency" className="h-64"></div>
      </div>
    </div>
  );
};

export default Efficiency;
