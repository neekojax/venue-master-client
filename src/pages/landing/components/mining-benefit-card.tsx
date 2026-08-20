import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Calendar, DollarSign, PieChart, Wallet } from "lucide-react";

import { fetchHomesuanli, fetchTotalLastProfitStatus } from "@/pages/mining/api.tsx";

interface MiningPoolCardProps {
  poolType: string;
}

const MiningBenefitCard: React.FC<MiningPoolCardProps> = ({ poolType }) => {
  const [lastProfitStatus, setLastProfitStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [suanlilv, setSuanlilv] = useState<any>(null);

  const formatNumber = (value: any) => {
    const num = Number(value);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatInt = (value: any) => {
    const num = Number(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString();
  };

  const fetchData = async (poolType: string) => {
    setLoading(true);
    try {
      const [lastProfitStatusResult, suanlilvResult] = await Promise.all([
        fetchTotalLastProfitStatus(poolType),
        (async () => {
          const targetDate = dayjs()
            .subtract(dayjs().hour() < 10 ? 2 : 1, "day")
            .format("YYYY-MM-DD");
          return await fetchHomesuanli(poolType, targetDate);
        })(),
      ]);
      setLastProfitStatus(lastProfitStatusResult.data);
      setSuanlilv(suanlilvResult.data);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(poolType);
  }, [poolType]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
            <div className="w-24 h-6 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="space-y-6 flex-1">
          <div className="h-24 bg-slate-100 rounded-xl"></div>
          <div className="h-32 bg-slate-100 rounded-xl"></div>
          <div className="h-32 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl ring-1 ring-emerald-100/50">
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">效益</h2>
          </div>
        </div>
      </div>

      <div className="space-y-5 flex-1 flex flex-col">
        {/* Yesterday Stats */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Wallet size={12} /> 昨日表现
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">昨日总收益</div>
              <div className="text-lg font-bold text-slate-900">
                {formatNumber(lastProfitStatus?.last_day_income_statistics?.income_btc)}{" "}
                <span className="text-xs font-normal text-slate-500">BTC</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">昨日产出效率</div>
              <div className="text-lg font-bold text-emerald-600">
                {suanlilv?.BTCOutputPerEPower || "0.00"}{" "}
                <span className="text-xs text-emerald-500 font-normal">BTC/EH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="flex-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar size={12} /> {lastProfitStatus?.month}月统计
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-2">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-sm text-slate-500">产出数量</span>
              <span className="text-sm font-bold text-slate-900">
                {formatNumber(lastProfitStatus?.month_statistics?.income_btc)} BTC
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-sm text-slate-500">产出价值</span>
              <span className="text-sm font-bold text-slate-900">
                ${formatInt(lastProfitStatus?.month_statistics?.income_usd)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-sm text-slate-500">托管运维</span>
              <span className="text-sm font-bold text-slate-900">
                ${formatInt(lastProfitStatus?.month_statistics?.hosting_fee)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-sm text-slate-500">{lastProfitStatus?.month}月托管占比</span>
              <span className="text-sm font-bold text-blue-600">
                {lastProfitStatus?.month_hosting_fee_ratio}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Ratios */}
        <div className="pt-2 border-t border-slate-50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <PieChart size={12} /> 托管费占比详情
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center group">
              <span className="text-xs text-slate-500">昨日平均</span>
              <div className="flex items-center gap-3">
                <div className="w-24 md:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${lastProfitStatus?.last_day_hosting_fee_ratio}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-slate-700 w-8 text-right">
                  {lastProfitStatus?.last_day_hosting_fee_ratio}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-xs text-slate-500">昨日最高</span>
              <div className="flex items-center gap-3">
                <div className="w-24 md:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${lastProfitStatus?.max_last_day_custody_ratio}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-slate-700 w-8 text-right">
                  {lastProfitStatus?.max_last_day_custody_ratio}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-xs text-slate-500 truncate mr-2" title="最高场地14天平均">
                最高场地14天平均
              </span>
              <div className="flex items-center gap-3">
                <div className="w-24 md:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${lastProfitStatus?.max_last_2week_custody_ratio}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-slate-700 w-8 text-right">
                  {lastProfitStatus?.max_last_2week_custody_ratio}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiningBenefitCard;
