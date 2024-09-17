import PropTypes from "prop-types";
import { usePopupContext } from "../popups/PopupContext";
import useServer from "../../zustand/useServer";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaCompass } from "react-icons/fa";

const JoinServerButton = ({ setDiscoverServersVisible }) => {
  const { handleServerHover } = usePopupContext();
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);
  const name = "Join a Server";
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleServerHover(true, name, rect);
  };
  const handleMouseLeave = () => {
    handleServerHover(false, name, {});
  };
  const handleClick = () => {
    setDiscoverServersVisible(true);
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
      <FaCompass size="100%" color="red" />
    </div>
  );
};

JoinServerButton.propTypes = {
  setDiscoverServersVisible: PropTypes.func,
};

export default JoinServerButton;
