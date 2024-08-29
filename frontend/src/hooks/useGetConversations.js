// only for server type Dm and groupchat
// combines useGetServers and useGetUsers since conversations needs the info of both

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

// returns server list, userslist (list of users in each server), and channelsList
const useGetConversations = (serverType) => {
  const [loading, setLoading] = useState(false);
  const [servers, setServers] = useState([]);
  const [serverIds, setServerIds] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [channelsList, setChannelsList] = useState([]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    serverIds.forEach((server_id) => params.append("server_ids", server_id));
    return params.toString();
  }, [serverIds]);

  useEffect(() => {
    const getServerInfo = async () => {
      setLoading(true);
      try {
        const serversRes = await fetch(`/api/servers/get/${serverType}`);
        const serversData = await serversRes.json();
        if (!serversRes.ok) {
          throw new Error(serversData.error);
        }
        setServers(serversData);
        const serverIds = serversData.map((server) => server.server_id);
        setServerIds(serverIds);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    getServerInfo();
  }, [serverType]);

  useEffect(() => {
    const getUsersInfo = async () => {
      //   if (serverIds.length === 0) {
      //     return;
      //   }
      setLoading(true);
      try {
        const usersRes = await fetch(`/api/users/get/users?${queryString}`, {
          method: "GET",
        });
        const usersData = await usersRes.json();
        if (!usersRes.ok) {
          throw new Error(usersData.error);
        }
        setUsersList(usersData);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    getUsersInfo();
  }, [serverIds, queryString]);

  useEffect(() => {
    const getChannelsInfo = async () => {};
  });

  return { loading, servers, serverIds, usersList };
};

export default useGetConversations;
