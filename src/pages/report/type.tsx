export type ReportUpdateParam = {
  venue_name: string;
  total_failures: number;
};

export type SummaryOverview = {
  btcOutput: number;
  btcPrice: string;
  btcPriceDiff: number;
  cumulativeBtcOutput: number;
  cumulativeUsdOutput: number;
  failureRate: number;
  hashEfficiency: number;
  hashMarketShare: number;
  hashMarketShareDiff: number;
  hashRate: number;
  mtdBtcOutput: number;
  mtdUsdOutput: number;
  networkHashRate: number;
  networkHashRateDiff: number;
  newFailureRate: number;
  outputImpact: number;
  powerImpact: number;
  usdOutput: number;
};
