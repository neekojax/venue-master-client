import { useState } from "react";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useFavorite } from "@/hooks/useFavorite";

interface FavoriteButtonProps {
  venueId: number;
  defaultFavorite: number;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ venueId, defaultFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(defaultFavorite);
  const { loading, toggleFavorite } = useFavorite();

  const handleClick = async () => {
    const userId = localStorage.getItem("user_id") || "";
    const newState = await toggleFavorite(userId, venueId, isFavorite);
    setIsFavorite(newState);
  };

  return (
    <Button
      type="text"
      icon={isFavorite == 1 ? <StarFilled style={{ color: "#faad14" }} /> : <StarOutlined />}
      loading={loading}
      onClick={handleClick}
    />
  );
};
