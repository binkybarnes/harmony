import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

const TooltipContext = createContext();

const TooltipProvider = ({ children }) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    name: "",
    position: {},
  });

  const handleServerHover = (isHovered, name, position) => {
    setTooltip({
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
    <TooltipContext.Provider value={{ tooltip, handleServerHover }}>
      {children}
    </TooltipContext.Provider>
  );
};

TooltipProvider.propTypes = {
  children: PropTypes.array,
};

// Custom hook to use the TooltipContext
// const useTooltip = () => useContext(TooltipContext);
const useTooltip = () => {
  const tooltip = useContext(TooltipContext);
  return tooltip;
};
export { TooltipProvider, useTooltip };
