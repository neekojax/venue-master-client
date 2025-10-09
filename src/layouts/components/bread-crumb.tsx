import { Link, useMatches } from "react-router-dom";
import { Breadcrumb as AntdBreadcrumb } from "antd";
import { ROUTE_PATHS } from "@/constants/common";

export default function Breadcrumb() {
  const matches = useMatches();
  const items = matches
    .filter((match) => Boolean((match.handle as any)?.crumb))
    .map((match) => ({
      title: (match.handle as any)?.crumb?.(),
    }));

  return <AntdBreadcrumb items={[{ title: <Link to={ROUTE_PATHS.landing}>首页</Link> }, ...items]} />;
}
