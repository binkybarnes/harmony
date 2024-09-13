import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

const PopupContext = createContext(null);

const PopupProvider = ({ children }) => {
  // Server Tooltip --------------------------------------------------------
  const [serverTooltip, setServerTooltip] = useState({
    visible: false,
    name: "",
    position: {},
  });
  const handleServerHover = (isHovered, name, position) => {
    setServerTooltip({
      visible: isHovered,
      name: name,
      position: position,
    });
  };

  // Info Tooltip --------------------------------------------------------
  const [infoTooltip, setInfoTooltip] = useState({
    visible: false,
    name: "",
    position: {},
  });
  const handleInfoHover = (isHovered, name, position) => {
    setInfoTooltip({
      visible: isHovered,
      name: name,
      position: position,
    });
  };

  // Server Dropdown --------------------------------------------------------
  const [serverDropdown, setServerDropdown] = useState({
    visible: false,
    ref: null,
  });

  const toggleServerDropdown = () => {
    setServerDropdown((prev) => ({
      ...prev,
      visible: !serverDropdown.visible,
    }));
  };

  return (
    <PopupContext.Provider
      value={{
        serverTooltip,
        handleServerHover,
        serverDropdown,
        toggleServerDropdown,
        infoTooltip,
        handleInfoHover,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

PopupProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.element]),
};

const usePopupContext = () => {
  return useContext(PopupContext);
};
export { PopupProvider, usePopupContext };
