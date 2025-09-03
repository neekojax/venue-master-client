import { useState } from "react";
import { message } from "antd";

import { fetchPost } from "@/helper/fetchHelper.ts";

export function useFavorite() {
  const [loading, setLoading] = useState(false);

  // 收藏/取消收藏
  //isFavorite: 1表示收藏 0 未收藏
  const toggleFavorite = async (userId: string, venueId: number, isFavorite: number) => {
    setLoading(true);

    try {
      // const token = localStorage.getItem("refresh_token");
      const url = isFavorite == 1 ? "/unsubscribe" : "/subscribe";
      const param_data = {
        user_id: userId, // 对应 Go 的 user_id
        venue_id: Number(venueId), // 对应 Go 的 venue_id
      };
      await fetchPost(url, param_data);

      message.success(isFavorite == 1 ? "已取消收藏" : "收藏成功");
      return isFavorite == 1 ? 0 : 1; // 返回更新后的收藏状态
    } catch (error) {
      message.error("操作失败，请稍后再试" + error);
      return isFavorite; // 保持原状态
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    toggleFavorite,
  };
}
