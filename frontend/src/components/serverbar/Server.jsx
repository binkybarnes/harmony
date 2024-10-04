import PropTypes from "prop-types";
import { usePopupContext } from "../popups/PopupContext";
import useServer from "../../zustand/useServer";
import { useMemo } from "react";

const Server = ({ server, handleClick }) => {
  const { handleServerHover } = usePopupContext();

  const selectedServer = useServer((state) => state.selectedServer);

  const serverName = server.server_name;

  const serverNameAbbrev = useMemo(() => {
    if (serverName) {
      return serverName
        .trim()
        .split(/([^a-zA-Z0-9]+)/)
        .filter((char) => char.match(/\S/))
        .map((word) => word[0])
        .join("");
    }
  }, [serverName]);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleServerHover(true, serverName, rect);
  };

  const handleMouseLeave = () => {
    handleServerHover(false, serverName, {});
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => handleClick(server)}
      className="group mb-2"
    >
      <div className="relative group-hover:cursor-pointer">
        <div
          className={`overflow-hidden transition-all duration-100 hover:bg-primary group-hover:rounded-[1.2rem] group-active:translate-y-[1.5px] ${
            selectedServer?.server_id === server.server_id
              ? "rounded-[1.2rem] bg-primary"
              : "rounded-md bg-base-100"
          }`}
        >
          {server.s3_icon_key ? (
            <img
              draggable={false}
              className="h-[48px] w-[48px]"
              src={`https://${import.meta.env.VITE_CLOUDFRONT_IMAGE_URL}/server-icons/${server.s3_icon_key}`}
            />
          ) : (
            <div
              style={{
                fontSize: `clamp(0.625rem, ${4 / serverNameAbbrev.length}rem, 1rem)`,
              }}
              className="flex h-[48px] w-[48px] items-center justify-center font-medium text-content-normal"
            >
              {serverNameAbbrev}
            </div>
          )}
        </div>
        {server.unread_messages > 0 ? (
          <>
            <div
              style={{
                width: `${server.unread_messages < 10 ? "24px" : server.unread_messages < 100 ? "30px" : "38px"}`,
              }}
              className="absolute bottom-0 right-0 h-6 translate-x-1 translate-y-1 rounded-xl bg-base-400"
            ></div>
            <div
              style={{
                width: `${server.unread_messages < 10 ? "16px" : server.unread_messages < 100 ? "22px" : "30px"}`,
              }}
              className="absolute bottom-0 right-0 flex w-[30px] items-center justify-center rounded-lg bg-error text-xs font-bold text-white"
            >
              {server.unread_messages < 1000 ? server.unread_messages : "1K+"}
            </div>
          </>
        ) : null}
      </div>
      {/* <div
        className={`overflow-hidden ${
          selectedServer?.server_id === server.server_id
            ? "rounded-[1.2rem] bg-primary"
            : "rounded-md bg-base-100"
        } transition-all duration-100 hover:bg-primary group-hover:cursor-pointer group-hover:rounded-[1.2rem] group-active:translate-y-[1.5px]`}
      >
        
      </div> */}
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
    unread_messages: PropTypes.number,
  }),
  handleClick: PropTypes.func,
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
