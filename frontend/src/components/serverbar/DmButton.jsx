import PropTypes from "prop-types";
import { usePopupContext } from "../popups/PopupContext";
import useServer from "../../zustand/useServer";
import { IoChatbox } from "react-icons/io5";

const DmButton = ({ setDiscoverServersVisible }) => {
  const { handleServerHover } = usePopupContext();
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);
  const name = "Direct Messages";
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleServerHover(true, name, rect);
  };
  const handleMouseLeave = () => {
    handleServerHover(false, name, {});
  };
  const handleClick = () => {
    setDiscoverServersVisible(false);
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
      <IoChatbox size="100%" color="red" />
    </div>
  );
};

DmButton.propTypes = {
  setDiscoverServersVisible: PropTypes.func,
};

export default DmButton;
