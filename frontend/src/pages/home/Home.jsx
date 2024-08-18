import MessageContainer from "../../components/messages/MessageContainer";
import Serverbar from "../../components/serverbar/Serverbar";
import Servers from "../../components/serverbar/Servers";
import Tooltip from "../../components/serverbar/Tooltip";
import Sidebar from "../../components/sidebar/Sidebar";
import { CSSTransition } from "react-transition-group";
import { useState, useRef } from "react";

const Home = () => {
  const nodeRef = useRef(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    name: "",
    position: null,
  });

  const handleServerHover = (isHovered, name, position) => {
    if (isHovered) {
      setTooltip({
        visible: isHovered,
        name: name,
        position: {
          top: position.top,
          height: position.height,
          left: position.right,
        },
      });
    } else {
      setTooltip((prev) => ({
        ...prev,
        visible: false,
      }));
    }
  };

  return (
    <div className="flex overflow-hidden">
      <Serverbar onServerHover={handleServerHover} />
      {/* <Sidebar /> */}
      {/* <MessageContainer /> */}

      <CSSTransition
        in={tooltip.visible}
        nodeRef={nodeRef}
        timeout={300}
        classNames="server-tooltip"
        unmountOnExit
      >
        <Tooltip
          ref={nodeRef}
          name={tooltip.name}
          position={tooltip.position}
        />
      </CSSTransition>
    </div>
  );
};
export default Home;
