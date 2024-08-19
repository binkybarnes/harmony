import PropTypes from "prop-types";
import { useTooltip } from "./tooltip/TooltipContext";
const SideButton = ({ name, children }) => {
  const { handleServerHover } = useTooltip();
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleServerHover(true, name, rect);
  };
  const handleMouseLeave = () => {
    handleServerHover(false, "", {});
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="h-12 w-12 rounded-md bg-yellow-300 p-0.5 transition-all duration-200 hover:rounded-[1.2rem]"
    >
      {children}
    </div>
  );
};

SideButton.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.element]),
  name: PropTypes.string,
};

export default SideButton;
