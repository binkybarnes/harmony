import { useState } from "react";
import toast from "react-hot-toast";

const useCreateServer = () => {
  const [loading, setLoading] = useState(false);

  const createServer = async (
    server_name,
    server_icon,
    recipient_ids,
    server_type,
  ) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("server_name", server_name);
      formData.append("server_type", server_type);

      if (recipient_ids) {
        recipient_ids.forEach((id) => formData.append("recipient_ids", id));
      }
      if (server_icon) {
        formData.append("server_icon", server_icon);
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/servers/create`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      // {server, channel}
      return data;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, createServer };
};

export default useCreateServer;
