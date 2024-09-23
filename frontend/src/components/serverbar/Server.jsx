import PropTypes from "prop-types";
import { usePopupContext } from "../popups/PopupContext";
import useServer from "../../zustand/useServer";
import { useMemo } from "react";

const Server = ({ server }) => {
  const { handleServerHover } = usePopupContext();
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);
  const selectedServer = useServer((state) => state.selectedServer);

  const serverName = server.server_name;

  const serverNameAbbrev = useMemo(
    () =>
      serverName
        .trim()
        .split(/([^a-zA-Z0-9]+)/)
        .filter((char) => char.match(/\S/))
        .map((word) => word[0])
        .join(""),
    [serverName],
  );

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
      <div
        className={`overflow-hidden ${
          selectedServer?.server_id === server.server_id
            ? "rounded-[1.2rem] bg-green-700"
            : "rounded-md bg-cyan-700"
        } transition-all duration-100 hover:bg-green-700 group-hover:cursor-pointer group-hover:rounded-[1.2rem] group-active:translate-y-[1.5px]`}
      >
        {server.s3_icon_key ? (
          <img
            draggable={false}
            className="h-[48px] w-[48px]"
            src={`https://${import.meta.env.VITE_CLOUDFRONT_IMAGE_URL}/${server.s3_icon_key}`}
          />
        ) : (
          <div
            style={{
              fontSize: `clamp(0.625rem, ${4 / serverNameAbbrev.length}rem, 1rem)`,
            }}
            className="flex h-[48px] w-[48px] items-center justify-center text-white"
          >
            {serverNameAbbrev}
          </div>
        )}
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
    s3_icon_key: PropTypes.oneOfType([PropTypes.string, PropTypes.any]),
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
