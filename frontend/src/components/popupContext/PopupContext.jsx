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

  return (
    <PopupContext.Provider value={{ serverTooltip, handleServerHover }}>
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
