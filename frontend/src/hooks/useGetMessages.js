import { useCallback, useEffect, useState } from "react";
import useServer from "../zustand/useServer";
import toast from "react-hot-toast";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const selectedServer = useServer((state) => state.selectedServer);
  const selectedChannel = useServer((state) => state.selectedChannel);

  // const messages = useServer((state) => state.messages);
  // const setMessages = useServer((state) => state.setMessages);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  // const users = useServer((state) => state.users);
  // const setUsers = useServer((state) => state.setUsers);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/messages/get/${selectedChannel.channel_id}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  }, [selectedChannel.channel_id]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/servers/users/${selectedServer.server_id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  }, [selectedServer.server_id]);

  useEffect(() => {
    if (!selectedChannel?.channel_id || !selectedServer?.server_id) return;
    const getMessages = async () => {
      setLoading(true);
      const [usersData, messagesData] = await Promise.all([
        fetchUsers(),
        fetchMessages(),
      ]);

      if (usersData && messagesData) {
        setUsers(usersData);
        setMessages(messagesData);
      }

      setLoading(false);

      setLoading(false);
    };

    getMessages();
  }, [
    selectedServer?.server_id,
    selectedChannel?.channel_id,
    fetchMessages,
    fetchUsers,
  ]);
  return { loading, messages, users };
};

export default useGetMessages;
