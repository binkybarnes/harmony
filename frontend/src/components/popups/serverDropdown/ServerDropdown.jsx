import { usePopupContext } from "../PopupContext";
import { CSSTransition } from "react-transition-group";
import { useEffect, useRef } from "react";
import { FaUserFriends } from "react-icons/fa";

import LeaveServer from "./LeaveServer";
import DropdownItem from "./DropdownItem";

const ServerDropdown = () => {
  const dropdownRef = useRef(null);
  const { serverDropdown, toggleServerDropdown } = usePopupContext();

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
          text="Invite people"
        />
        <div className="my-1 min-h-[2px] w-full rounded-[1px] bg-yellow-400"></div>
        <LeaveServer />
      </div>
    </CSSTransition>
  );
};

export default ServerDropdown;
