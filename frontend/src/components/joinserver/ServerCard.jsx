import PropTypes from "prop-types";
import useJoinServer from "../../hooks/useJoinServer";
import useServer from "../../zustand/useServer";
import { useMemo } from "react";
const ServerCard = ({ server }) => {
  const { loading, joinServer } = useJoinServer();
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);
  const handleClick = async () => {
    await joinServer(server.server_id);
    setSelectedChannel(null);
    setSelectedServer(server);
  };
  const serverNameAbbrev = useMemo(
    () =>
      server.server_name
        .trim()
        .split(/([^a-zA-Z0-9]+)/)
        .filter((char) => char.match(/\S/))
        .map((word) => word[0])
        .join(""),
    [server.server_name],
  );

  return (
    <button
      disabled={loading}
      onClick={handleClick}
      className="server-card flex w-48 flex-col overflow-hidden rounded-md bg-red-500 hover:cursor-pointer"
    >
      <div className="bg-cyan-700">
        {server.s3_icon_key ? (
          <img
            draggable={false}
            className="h-48 w-48"
            src={`https://${import.meta.env.VITE_CLOUDFRONT_IMAGE_URL}/${server.s3_icon_key}`}
          />
        ) : (
          <div
            style={{
              fontSize: `clamp(2.5rem, ${16 / serverNameAbbrev.length}rem, 4rem)`,
            }}
            className="flex h-48 w-48 items-center justify-center text-white"
          >
            {serverNameAbbrev}
          </div>
        )}
      </div>

      <div className="w-full px-2 py-1">
        <h3 className="truncate text-left font-semibold text-neutral-200">
          {server.server_name}
        </h3>
        <div className="flex items-center justify-between text-xs text-neutral-200">
          <div className="flex items-center gap-1">
            <div className="h-[8px] w-[8px] rounded-full bg-white"></div>
            <p>{server.members} Members</p>
          </div>
          <p>
            <span className="select-none">ID: </span>
            <span className="rounded-md bg-red-900 px-1 py-0.5">
              {server.server_id}
            </span>
          </p>
        </div>
      </div>
    </button>
  );
};

ServerCard.propTypes = {
  server: PropTypes.shape({
    server_id: PropTypes.number,
    server_type: PropTypes.string,
    members: PropTypes.number,
    server_name: PropTypes.string,
    s3_icon_key: PropTypes.string,
  }),
};

export default ServerCard;
