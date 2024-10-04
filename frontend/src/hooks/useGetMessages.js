import { useCallback, useEffect, useState } from "react";
import useServer from "../zustand/useServer";
import toast from "react-hot-toast";
import useUpdateLastReadMessage from "./useUpdateLastReadMessage";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const selectedServer = useServer((state) => state.selectedServer);
  const selectedChannel = useServer((state) => state.selectedChannel);
  const { UpdateLastReadMessage } = useUpdateLastReadMessage();

  const updateConversationUnread = useServer(
    (state) => state.updateConversationUnread,
  );
  const updateServerUnread = useServer((state) => state.updateServerUnread);

  // const messages = useServer((state) => state.messages);
  // const setMessages = useServer((state) => state.setMessages);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  // const users = useServer((state) => state.users);
  // const setUsers = useServer((state) => state.setUsers);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/messages/get/${selectedChannel.channel_id}`,
        { credentials: "include" },
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
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/servers/users/${selectedServer.server_id}`,
        {
          credentials: "include",
        },
      );
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

        const last_message_id = messagesData.slice(-1)[0]?.message_id;
        if (last_message_id) {
          UpdateLastReadMessage(selectedServer.server_id, last_message_id);
        }

        // clicking on any of the server's channels will get rid of the unread
        if (
          selectedServer.server_type === "Dm" ||
          selectedServer.server_type === "GroupChat"
        ) {
          console.log("rat");
          updateConversationUnread(selectedServer.server_id, 0);
        } else if (selectedServer.server_type === "Server") {
          updateServerUnread(selectedServer.server_id, 0);
        }
      }

      setLoading(false);
    };

    getMessages();
  }, [
    selectedServer?.server_id,
    selectedChannel?.channel_id,
    fetchMessages,
    fetchUsers,
    UpdateLastReadMessage,
    selectedServer.server_type,
    updateConversationUnread,
    updateServerUnread,
  ]);
  return { loading, messages, users };
};

export default useGetMessages;
