import { useState } from "react";
import useServer from "../zustand/useServer";
import toast from "react-hot-toast";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const selectedChannel = useServer((state) => state.selectedChannel);
  const selectedServer = useServer((state) => state.selectedServer);

  const sendMessage = async (message, display_username, s3_icon_key) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/messages/send`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel_id: selectedChannel.channel_id,
            server_id: selectedServer.server_id,
            server_type: selectedServer.server_type,
            message,
            display_username,
            s3_icon_key,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, sendMessage };
};

export default useSendMessage;
