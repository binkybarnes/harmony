import { useEffect, useState } from "react";
import useServer from "../zustand/useServer";
import toast from "react-hot-toast";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const selectedServer = useServer((state) => state.selectedServer);
  const selectedChannel = useServer((state) => state.selectedChannel);

  const messages = useServer((state) => state.messages);
  const setMessages = useServer((state) => state.setMessages);

  const users = useServer((state) => state.users);
  const setUsers = useServer((state) => state.setUsers);

  const fetchMessages = async () => {
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
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/servers/users/${selectedServer.server_id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  };

  useEffect(() => {
    if (!selectedServer?.server_id || !selectedChannel?.channel_id) return;
    const getMessages = async () => {
      setLoading(true);
      const messagesData = await fetchMessages();
      if (!messagesData) {
        setLoading(false);
        return;
      }
      const usersData = await fetchUsers();
      // const usersMap = usersData.reduce((acc, user) => {
      //   acc[user.user_id] = user;
      //   return acc;
      // }, {});

      // const messagesWithUsers = messagesData.map((message) => {
      //   const { display_username, profile_picture } = usersMap[message.user_id];
      //   return { ...message, display_username, profile_picture };
      // });
      setMessages(messagesData);
      setUsers(usersData);

      setLoading(false);
    };

    getMessages();
  }, [selectedServer?.server_id, selectedChannel?.channel_id]);
  return { loading, messages };
};

export default useGetMessages;
