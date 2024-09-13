import { useMemo } from "react";
import useGetServers from "../../hooks/useGetServers";
import Server from "./Server";

const Servers = () => {
  const { loading, servers } = useGetServers("Server");

  const mapServers = useMemo(
    () =>
      servers.map((server) => (
        <Server key={server.server_id} server={server} />
      )),
    [servers],
  );

  return (
    <div className="scrollbar-none flex-1 overflow-y-scroll">{mapServers}</div>
  );
};

export default Servers;
