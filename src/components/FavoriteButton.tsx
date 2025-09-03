import { useEffect, useState } from "react";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useFavorite } from "@/hooks/useFavorite";

interface FavoriteButtonProps {
  venueId: number;
  defaultFavorite: number;
  onChange?: (newState: 0 | 1) => void; // ✅ 新增回调
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ venueId, defaultFavorite, onChange }) => {
  const [isFavorite, setIsFavorite] = useState(0);
  const { loading, toggleFavorite } = useFavorite();

  const handleClick = async () => {
    console.log(defaultFavorite);
    const userId = localStorage.getItem("user_id") || "";
    const newState = await toggleFavorite(userId, venueId, defaultFavorite);
    const state01 = newState === 1 ? 1 : 0; // 保证是 0 或 1
    setIsFavorite(state01);
    // ✅ 通知父组件
    if (onChange) {
      onChange(state01);
    }
  };
  useEffect(() => {
    setIsFavorite(defaultFavorite);
  }, [defaultFavorite]);

  return (
    <Button
      type="text"
      icon={isFavorite == 1 ? <StarFilled style={{ color: "#faad14" }} /> : <StarOutlined />}
      loading={loading}
      onClick={handleClick}
    />
  );
};
