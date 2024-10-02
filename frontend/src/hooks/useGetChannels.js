import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetChannels = (serverId) => {
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const getChannels = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/servers/channels/${serverId}`,
          { credentials: "include" },
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error);
        }
        setChannels(data);
      } catch (error) {
        toast.error(error.message);
      }
    };
    getChannels();
  }, [serverId]);
  return { loading, channels };
};

export default useGetChannels;
