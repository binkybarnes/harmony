import { usePopupContext } from "../PopupContext";
import { CSSTransition } from "react-transition-group";
import { useRef } from "react";
const ServerTooltip = () => {
  const tooltipRef = useRef();
  const { serverTooltip } = usePopupContext();
  const { visible, name, position } = serverTooltip;
  return (
    // need to move CSSTransition in here so it can use useContext
    <CSSTransition
      in={visible}
      nodeRef={tooltipRef}
      timeout={75}
      classNames="server-tooltip"
      unmountOnExit
    >
      <div
        ref={tooltipRef}
        style={{
          top: `${position.top + position.height / 2}px`,
          left: `${position.right + 22}px`,
        }}
        className="server-tooltip"
      >
        {name}
      </div>
    </CSSTransition>
  );
};

// Tooltip.displayName = "Tooltip";

export default ServerTooltip;
