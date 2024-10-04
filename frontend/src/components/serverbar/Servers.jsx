import { useCallback, useEffect, useMemo } from "react";
import useGetServers from "../../hooks/useGetServers";
import Server from "./Server";
import useServer from "../../zustand/useServer";
import toast from "react-hot-toast";
import Conversation from "../sidebar/conversations/Conversation";

const Servers = () => {
  const { loading, servers: fetchedServers } = useGetServers("Server");
  const servers = useServer((state) => state.servers);
  const setServers = useServer((state) => state.setServers);
  const setSelectedConversation = useServer(
    (state) => state.setSelectedConversation,
  );
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);

  useEffect(() => {
    if (fetchedServers) {
      setServers(fetchedServers);
    }
  }, [fetchedServers, setServers]);

  const handleServerClick = useCallback(
    (server) => {
      setSelectedConversation(null);
      setSelectedServer(server);
      // TODO: CHANGE TO LAST VISITED CHANNEL?
      setSelectedChannel(null);
    },
    [setSelectedChannel, setSelectedServer, setSelectedConversation],
  );

  const mapServers = useMemo(
    () =>
      servers.map((server) => (
        <Server
          key={server.server_id}
          server={server}
          handleClick={handleServerClick}
        />
      )),
    [servers, handleServerClick],
  );

  return (
    <div className="scrollbar-none mb-2 flex-1 overflow-y-scroll">
      {mapServers}
    </div>
  );
};

export default Servers;
