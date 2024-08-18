import Server from "./Server";
import PropTypes from "prop-types";

const Servers = ({ onServerHover }) => {
  const servers = [
    { id: 1, name: "Server 1" },
    { id: 2, name: "Server 2" },
    { id: 3, name: "Server 3" },
    { id: 4, name: "Server 4" },
    { id: 5, name: "Server 5" },
    { id: 6, name: "Server 6" },
    { id: 7, name: "Server 7" },
    { id: 8, name: "Server 8" },
    { id: 9, name: "Server 9" },
    { id: 10, name: "Server 10" },
    { id: 11, name: "Server 11" },
    { id: 12, name: "Server 12" },
    { id: 13, name: "Server 13" },
    { id: 14, name: "Server 14" },
    { id: 15, name: "Server 15" },
    { id: 16, name: "Server 16" },
    { id: 17, name: "Server 17" },
    { id: 18, name: "Server 18" },
    { id: 19, name: "Server 19" },
  ];
  return (
    <div className="flex-1 overflow-y-scroll scrollbar-none">
      {servers.map((server) => (
        <Server key={server.id} name={server.name} onHover={onServerHover} />
      ))}
    </div>
  );
};

Servers.propTypes = {
  onServerHover: PropTypes.func,
};

export default Servers;
