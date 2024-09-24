// only for server type Dm and groupchat
// combines useGetServers and useGetUsers since conversations needs the info of both

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

// conversation is a server, that has 1 channel, treated as both
// returns server list, userslist (list of users in each server), and channelsList
const useConversationInfo = (serverType) => {
  const [loading, setLoading] = useState(false);
  const [servers, setServers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [channelsList, setChannelsList] = useState([]);

  const fetchServers = useCallback(async () => {
    try {
      const res = await fetch(`/api/servers/get/${serverType}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  }, [serverType]);
  const fetchChannels = async (server_ids) => {
    try {
      const res = await fetch("/api/servers/channels-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          server_ids,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  };

  const fetchUsers = async (server_ids) => {
    try {
      const res = await fetch("/api/servers/users-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          server_ids,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const serversData = await fetchServers();
      if (!serversData) {
        setLoading(false);
        return;
      }
      setServers(serversData);
      const serverIds = serversData.map((server) => server.server_id);

      const [channelsData, usersData] = await Promise.all([
        fetchChannels(serverIds),
        fetchUsers(serverIds),
      ]);

      setChannelsList(channelsData);
      setUsersList(usersData);
      setLoading(false);
    };

    fetchData();
  }, [fetchServers]);

  return { loading, servers, usersList, channelsList };
};

export default useConversationInfo;
