import { usePopupContext } from "../PopupContext";
import { CSSTransition } from "react-transition-group";
import { useEffect, useRef } from "react";
import { FaUserFriends } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { VscSignOut } from "react-icons/vsc";
import { IoIosSettings } from "react-icons/io";

import DropdownItem from "./DropdownItem";
import useServer from "../../../zustand/useServer";
import { useAuthContext } from "../../../context/AuthContext";
import useLeaveServer from "../../../hooks/useLeaveServer";
import useDeleteServer from "../../../hooks/useDeleteServer";

const ServerDropdown = () => {
  const dropdownRef = useRef(null);
  const selectedServer = useServer((state) => state.selectedServer);
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);
  const { authUser } = useAuthContext();
  const {
    serverDropdown,
    toggleServerDropdown,
    setServerSettingsMenuVisible,
    setModalOverlayVisible,
  } = usePopupContext();
  const { leaveServer } = useLeaveServer();
  const { deleteServer } = useDeleteServer();
  // when dropdown visible, click anywhere outside of the dropdown will remove the dropdown
  const handleClickOutside = (event) => {
    if (serverDropdown.visible && !dropdownRef.current.contains(event.target)) {
      toggleServerDropdown();
    }
  };

  useEffect(() => {
    if (serverDropdown.visible) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    // cleanup function
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  const handleDeleteClick = async () => {
    await deleteServer(selectedServer.server_id);
    toggleServerDropdown();
    setSelectedServer(null);
    setSelectedChannel(null);
  };
  const handleLeaveClick = async () => {
    await leaveServer(selectedServer.server_id);
    toggleServerDropdown();
    setSelectedServer(null);
    setSelectedChannel(null);
  };
  const handleSettingsClick = (event) => {
    event.stopPropagation();
    setModalOverlayVisible(true);
    toggleServerDropdown();
    setServerSettingsMenuVisible(true);
  };

  const isAdmin = selectedServer?.admins.includes(authUser.user_id);

  return (
    <CSSTransition
      in={serverDropdown.visible}
      nodeRef={dropdownRef}
      timeout={75}
      classNames="server-dropdown"
      unmountOnExit
    >
      <div ref={dropdownRef} className="server-dropdown">
        <DropdownItem
          icon={<FaUserFriends className="flex-shrink-0" size="20px" />}
          text="Invite People"
          color="magenta"
        />
        {isAdmin ? (
          <DropdownItem
            icon={<IoIosSettings className="flex-shrink-0" size="20px" />}
            text="Server Settings"
            color="white"
            handleClick={handleSettingsClick}
          />
        ) : null}

        <div className="my-1 min-h-[2px] w-full rounded-[1px] bg-yellow-400"></div>
        {isAdmin ? (
          <DropdownItem
            icon={<FaTrashAlt className="flex-shrink-0" size="20px" />}
            text="Delete Server"
            color="red"
            handleClick={handleDeleteClick}
          />
        ) : (
          <DropdownItem
            icon={<VscSignOut className="flex-shrink-0" size="20px" />}
            text="Leave Server"
            color="red"
            handleClick={handleLeaveClick}
          />
        )}
      </div>
    </CSSTransition>
  );
};

export default ServerDropdown;
