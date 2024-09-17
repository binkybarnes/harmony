import { useState } from "react";
import useServer from "../zustand/useServer";
import toast from "react-hot-toast";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const messages = useServer((state) => state.messages);
  const setMessages = useServer((state) => state.setMessages);
  const selectedChannel = useServer((state) => state.selectedChannel);
  const selectedServer = useServer((state) => state.selectedServer);

  const sendMessage = async (message) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel_id: selectedChannel.channel_id,
          server_id: selectedServer.server_id,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // setMessages([...messages, data]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, sendMessage };
};

export default useSendMessage;
