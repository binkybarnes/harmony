import PropTypes from "prop-types";
import { useState } from "react";

const DropdownItem = ({ text, icon, color = "white", handleClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const toggleIsHovered = () => setIsHovered((prev) => !prev);

  const colorStyle = {
    color: isHovered ? "white" : color,
    backgroundColor: isHovered
      ? color === "red"
        ? "red"
        : "magenta"
      : "transparent",
  };
  return (
    <div
      onMouseEnter={toggleIsHovered}
      onMouseLeave={toggleIsHovered}
      onClick={handleClick}
      style={colorStyle}
      className={`flex items-center justify-between rounded-md bg-transparent px-2 py-1.5 hover:cursor-pointer hover:bg-${color === "error" ? "error" : "accent"} hover:text-white active:brightness-95`}
    >
      <div className="truncate text-sm">{text}</div>
      {icon}
    </div>
  );
};

DropdownItem.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.element,
  color: PropTypes.string,
  handleClick: PropTypes.func,
};
export default DropdownItem;
