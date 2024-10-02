import { useState } from "react";
import toast from "../../node_modules/react-hot-toast/dist/index";

const useCreateChannel = () => {
  const [loading, setLoading] = useState(false);

  const createChannel = async (server_id, channel_name) => {
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/servers/channels/create`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server_id,
            channel_name,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, createChannel };
};

export default useCreateChannel;
