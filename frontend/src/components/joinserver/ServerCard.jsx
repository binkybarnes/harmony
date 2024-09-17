import PropTypes from "prop-types";
const ServerCard = ({ server }) => {
  return (
    <div className="server-card flex w-48 flex-col overflow-hidden rounded-md bg-red-500 hover:cursor-pointer">
      <img
        draggable={false}
        className="h-48 w-full object-cover"
        src="https://cdn.discordapp.com/discovery-splashes/662267976984297473/4798759e115d2500fef16347d578729a.jpg?size=600"
      />
      <div className="px-2 py-1">
        <h3 className="truncate font-semibold text-neutral-200">
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
    </div>
  );
};

ServerCard.propTypes = {
  server: PropTypes.shape({
    server_id: PropTypes.number,
    server_type: PropTypes.string,
    members: PropTypes.number,
    server_name: PropTypes.string,
  }),
};

export default ServerCard;
