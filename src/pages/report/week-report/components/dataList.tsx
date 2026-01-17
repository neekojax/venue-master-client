// import React from "react";
// import StatCard from "./StatCard";

// const Dashboard: React.FC = () => {
//   const stats = [
//     {
//       title: "总算力有效率",
//       value: "90.8%",
//       icon: "fas fa-chart-line",
//       iconColor: "text-blue-500",
//       trend: "up" as const, // ✅ 这里加 as const
//       trendValue: "2.3%",
//       trendText: "较上周",
//       trendColor: "text-green-500",
//     },
//     {
//       title: "总故障率",
//       value: "3.4%",
//       icon: "fas fa-exclamation-triangle",
//       iconColor: "text-red-500",
//       trend: "up" as const, // ✅ 这里加 as const
//       trendValue: "0.5%",
//       trendText: "较上周",
//       trendColor: "text-red-500",
//     },
//     {
//       title: "高温影响率",
//       value: "4.2%",
//       icon: "fas fa-temperature-high",
//       iconColor: "text-orange-500",
//       trend: "up" as const, // ✅ 这里加 as const
//       trendValue: "1.2%",
//       trendText: "较上周",
//       trendColor: "text-orange-500",
//     },
//     {
//       title: "限电影响率",
//       value: "1.8%",
//       icon: "fas fa-bolt",
//       iconColor: "text-yellow-500",
//       trend: "down" as const, // ✅ 这里加 as const
//       trendValue: "0.5%",
//       trendText: "较上周",
//       trendColor: "text-green-500",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-4 gap-4 mb-6">
//       {stats.map((s, idx) => (
//         // <StatCard key={idx} {...s} />
//       ))}
//     </div>
//   );
// };

// export default Dashboard;
