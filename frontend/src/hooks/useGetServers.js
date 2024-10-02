import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// usually only for server type server, cause the other server types need serverids and userslist
const useGetServers = (serverType) => {
  const [loading, setLoading] = useState(false);
  const [servers, setServers] = useState([]);

  useEffect(() => {
    const getServers = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/servers/get/${serverType}`,
          { credentials: "include" },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setServers(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    getServers();
  }, [serverType]);

  return { loading, servers };
};

export default useGetServers;
