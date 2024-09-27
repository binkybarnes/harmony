import PropTypes from "prop-types";
import { usePopupContext } from "../popups/PopupContext";
import useServer from "../../zustand/useServer";

import { FaCompass } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const JoinServerButton = () => {
  const { handleServerHover } = usePopupContext();
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);
  const navigate = useNavigate();
  const name = "Join a Server";
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleServerHover(true, name, rect);
  };
  const handleMouseLeave = () => {
    handleServerHover(false, name, {});
  };
  const handleClick = () => {
    navigate("/discover");
    setSelectedServer(null);
    setSelectedChannel(null);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="flex h-12 w-12 items-center justify-center rounded-md bg-primary p-0.5 transition-all duration-200 hover:cursor-pointer hover:rounded-[1.2rem] active:translate-y-[2px]"
    >
      <FaCompass size="40" color="#dbdee1" />
    </div>
  );
};

export default JoinServerButton;
