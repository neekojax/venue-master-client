import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  colorPrimary: "#2d8cf0", // #1DA57A  #4096ff #2d8cf0
  collapsed: false,
  poolType: "KZ",
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
