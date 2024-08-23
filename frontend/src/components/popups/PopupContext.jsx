import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

const PopupContext = createContext();

const PopupProvider = ({ children }) => {
  const [serverTooltip, setServerTooltip] = useState({
    visible: false,
    name: "",
    position: {},
  });
  const handleServerHover = (isHovered, name, position) => {
    setServerTooltip({
      visible: isHovered,
      name: name,
      position: {
        top: position.top,
        height: position.height,
        left: position.right,
      },
    });
  };

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
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

PopupProvider.propTypes = {
  children: PropTypes.array,
};

const usePopupContext = () => {
  const tooltip = useContext(PopupContext);
  return tooltip;
};
export { PopupProvider, usePopupContext };
