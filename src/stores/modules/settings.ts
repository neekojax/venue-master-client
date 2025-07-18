import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  colorPrimary: "#1DA57A",
  collapsed: false,
  poolType: "CANG",
};

export const useSettingsStore = create<typeof initialState>()(
  persist(() => initialState, { name: "app-settings" }),
);

export function setColorPrimary(colorPrimary: string) {
  useSettingsStore.setState({ colorPrimary });
}

export function setCollapsed(collapsed: boolean) {
  useSettingsStore.setState({ collapsed });
}

export function setPoolType(poolType: string) {
  useSettingsStore.setState({ poolType });
}
