import { Outlet } from "react-router-dom";

export default function NavLayout() {
  return (
    <div className="text-indigo-700">
      <Outlet />
    </div>
  );
}
