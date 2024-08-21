import { usePopupContext } from "../PopupContext";
import { CSSTransition } from "react-transition-group";
import { useRef } from "react";
const Tooltip = () => {
  const nodeRef = useRef(null);
  const { serverTooltip } = usePopupContext();
  const { name, position } = serverTooltip;
  return (
    // need to move CSSTransition in here so it can use useContext
    <CSSTransition
      in={serverTooltip.visible}
      nodeRef={nodeRef}
      timeout={75}
      classNames="server-tooltip"
      unmountOnExit
    >
      <div
        ref={nodeRef}
        style={{
          top: `${position.top + position.height / 2}px`,
          left: `${position.left + 25}px`,
        }}
        className="server-tooltip"
      >
        {name}
      </div>
    </CSSTransition>
  );
};

// Tooltip.displayName = "Tooltip";

export default Tooltip;
