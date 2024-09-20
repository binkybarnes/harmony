import { useEffect, useMemo } from "react";
import useGetServers from "../../hooks/useGetServers";
import Server from "./Server";
import useServer from "../../zustand/useServer";

const Servers = () => {
  const { loading, servers: fetchedServers } = useGetServers("Server");
  const servers = useServer((state) => state.servers);
  const setServers = useServer((state) => state.setServers);
  useEffect(() => {
    if (fetchedServers) {
      setServers(fetchedServers);
    }
  }, [fetchedServers, setServers]);

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
