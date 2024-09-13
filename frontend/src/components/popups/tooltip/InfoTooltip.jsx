import { usePopupContext } from "../PopupContext";
import { CSSTransition } from "react-transition-group";
import { useRef } from "react";
const InfoTooltip = () => {
  const tooltipRef = useRef();
  const { infoTooltip } = usePopupContext();
  const { visible, name, position } = infoTooltip;
  return (
    // need to move CSSTransition in here so it can use useContext
    <CSSTransition
      in={visible}
      nodeRef={tooltipRef}
      timeout={75}
      classNames="info-tooltip"
      unmountOnExit
    >
      <div
        ref={tooltipRef}
        style={{
          top: `${position.top - 37}px`,
          left: `${position.left + position.width / 2}px`,
        }}
        className="info-tooltip"
      >
        {name}
      </div>
    </CSSTransition>
  );
};

// Tooltip.displayName = "Tooltip";

export default InfoTooltip;
