import PropTypes from "prop-types";
import { forwardRef } from "react";

const Tooltip = forwardRef(({ name, position }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        top: `${position.top + position.height / 2}px`,
        left: `${position.left + 25}px`,
      }}
      className="server-tooltip"
    >
      {name}
    </div>
  );
});

Tooltip.displayName = "Tooltip";

Tooltip.propTypes = {
  name: PropTypes.string,
  position: PropTypes.object,
};

export default Tooltip;
