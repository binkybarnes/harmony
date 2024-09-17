import { useState } from "react";
import toast from "react-hot-toast";

const useCreateServer = () => {
  const [loading, setLoading] = useState(false);

  const createServer = async (server_name) => {
    setLoading(true);

    try {
      const res = await fetch("/api/servers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_ids: [],
          server_type: "Server",
          server_name,
        }),
      });

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

  return { loading, createServer };
};

export default useCreateServer;
