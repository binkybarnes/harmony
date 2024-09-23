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
    setPopupActive(!serverDropdown.visible);
    setServerDropdown((prev) => ({
      ...prev,
      visible: !prev.visible,
    }));
  };

  // Create Channel Menu --------------------------------------------------------
  const [channelMenu, setChannelMenu] = useState({
    visible: false,
  });

  const setChannelMenuVisible = (visible) => {
    setPopupActive(visible);
    setChannelMenu(() => ({
      visible,
    }));
  };

  // Create Server Menu --------------------------------------------------------
  const [serverMenu, setServerMenu] = useState({
    visible: false,
  });

  const setServerMenuVisible = (visible) => {
    setPopupActive(visible);
    setServerMenu(() => ({
      visible,
    }));
  };

  // Server Settings Menu  --------------------------------------------------------
  const [serverSettingsMenu, setServerSettingsMenu] = useState({
    visible: false,
  });

  const setServerSettingsMenuVisible = (visible) => {
    setPopupActive(visible);
    setServerSettingsMenu(() => ({
      visible,
    }));
  };

  // Modal Overlay  --------------------------------------------------------
  const [modalOverlay, setModalOverlay] = useState({
    visible: false,
  });

  const setModalOverlayVisible = (visible) => {
    setModalOverlay(() => ({
      visible,
    }));
  };

  // Popup Active  --------------------------------------------------------
  // prevent messageinput from focusing on keydown when popup is active
  const [popupActive, setPopupActive] = useState(false);

  return (
    <PopupContext.Provider
      value={{
        popupActive,
        setPopupActive,
        serverTooltip,
        handleServerHover,
        serverDropdown,
        toggleServerDropdown,
        infoTooltip,
        handleInfoHover,
        channelMenu,
        setChannelMenuVisible,
        modalOverlay,
        setModalOverlayVisible,
        serverMenu,
        setServerMenuVisible,
        serverSettingsMenu,
        setServerSettingsMenuVisible,
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
