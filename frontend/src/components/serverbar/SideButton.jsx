import PropTypes from "prop-types";
import { usePopupContext } from "../popups/PopupContext";
import useServer from "../../zustand/useServer";
const SideButton = ({ name, children }) => {
  const { handleServerHover } = usePopupContext();
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleServerHover(true, name, rect);
  };
  const handleMouseLeave = () => {
    handleServerHover(false, name, {});
  };
  const handleClick = () => {
    setSelectedServer(null);
    setSelectedChannel(null);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
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
