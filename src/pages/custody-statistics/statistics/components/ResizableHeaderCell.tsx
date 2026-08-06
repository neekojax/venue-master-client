import type { CSSProperties, MouseEvent as ReactMouseEvent, ThHTMLAttributes } from "react";
import { useState } from "react";

type ResizableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement> & {
  width?: number;
  onResize?: (nextWidth: number) => void;
};

const MIN_WIDTH = 160;

export default function ResizableHeaderCell({
  width,
  onResize,
  style,
  children,
  ...restProps
}: ResizableHeaderCellProps) {
  const [hovered, setHovered] = useState(false);

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!onResize) return;

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = width || MIN_WIDTH;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      onResize(Math.max(MIN_WIDTH, startWidth + deltaX));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <th
      {...restProps}
      style={{
        ...(style as CSSProperties),
        width,
        position: "relative",
      }}
    >
      {children}
      {onResize ? (
        <div
          onClick={(event) => event.stopPropagation()}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: "absolute",
            top: 0,
            right: -6,
            width: 14,
            height: "100%",
            cursor: "col-resize",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 1,
              height: "62%",
              backgroundColor: hovered ? "#1677ff" : "#d1d5db",
              boxShadow: hovered ? "0 0 0 1px rgba(22,119,255,0.12)" : "none",
              marginRight: 2,
            }}
          />
          <span
            style={{
              color: hovered ? "#1677ff" : "#c0c4cc",
              fontSize: 12,
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            ⋮
          </span>
        </div>
      ) : null}
    </th>
  );
}
