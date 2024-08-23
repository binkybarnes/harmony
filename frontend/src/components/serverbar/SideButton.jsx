import PropTypes from "prop-types";
import { usePopupContext } from "../popups/PopupContext";
const SideButton = ({ name, children }) => {
  const { handleServerHover } = usePopupContext();
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleServerHover(true, name, rect);
  };
  const handleMouseLeave = () => {
    handleServerHover(false, name, {});
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="h-12 w-12 rounded-md bg-yellow-300 p-0.5 transition-all duration-200 hover:cursor-pointer hover:rounded-[1.2rem] active:translate-y-[2px]"
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
