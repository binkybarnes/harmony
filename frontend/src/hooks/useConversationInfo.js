// only for server type Dm and groupchat
// combines useGetServers and useGetUsers since conversations needs the info of both

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// conversation is a server, that has 1 channel, treated as both
// returns server list, userslist (list of users in each server), and channelsList
const useConversationInfo = (serverType) => {
  const [loading, setLoading] = useState(false);
  const [servers, setServers] = useState([]);
  const [serverIds, setServerIds] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [channelsList, setChannelsList] = useState([]);

  const fetchServers = async () => {
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
  };
  const fetchChannels = async (queryString) => {
    try {
      const res = await fetch(`/api/servers/channels?${queryString}`);
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

  const fetchUsers = async (queryString) => {
    try {
      const res = await fetch(`/api/servers/users?${queryString}`);
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
      setServerIds(serverIds);

      const params = new URLSearchParams();
      serverIds.forEach((server_id) => params.append("server_ids", server_id));
      params.toString();

      const [channelsData, usersData] = await Promise.all([
        fetchChannels(params),
        fetchUsers(params),
      ]);

      setChannelsList(channelsData);
      setUsersList(usersData);
      setLoading(false);
    };

    fetchData();
  }, []);

  return { loading, servers, serverIds, usersList, channelsList };
};

export default useConversationInfo;
