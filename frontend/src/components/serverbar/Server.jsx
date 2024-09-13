import PropTypes from "prop-types";
import { usePopupContext } from "../popups/PopupContext";
import useServer from "../../zustand/useServer";

const Server = ({ server }) => {
  const { handleServerHover } = usePopupContext();
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);

  const serverName = server.server_name;

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleServerHover(true, serverName, rect);
  };

  const handleMouseLeave = () => {
    handleServerHover(false, serverName, {});
  };

  const handleClick = () => {
    setSelectedServer(server);
    // TODO: CHANGE TO LAST VISITED CHANNEL?
    setSelectedChannel(null);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="group mb-2"
    >
      <div className="overflow-hidden rounded-md bg-cyan-200 transition-all duration-100 group-hover:cursor-pointer group-hover:rounded-[1.2rem] group-active:translate-y-[1.5px]">
        <img
          draggable={false}
          className="h-[48px] w-[48px]"
          src={`https://robohash.org/${serverName}`}
        />
      </div>
    </div>
  );
};

Server.propTypes = {
  server: PropTypes.shape({
    server_id: PropTypes.number,
    server_type: PropTypes.string,
    members: PropTypes.number,
    server_name: PropTypes.string,
  }),
};

export default Server;

// import { useState } from "react";
// const Server = () => {
//   const [isHovered, setIsHovered] = useState(false);
//   return (
//     <div
//       className="relative mb-2 h-[48px] w-[48px]"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className="avatar">
//         <div className="rounded-md object-contain">
//           <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
//         </div>
//       </div>
//       {isHovered && (
//         <div className="absolute bottom-full left-1/2 z-50 bg-black">
//           Server Name
//         </div>
//       )}

//     </div>
//   );
// };

// export default Server;
