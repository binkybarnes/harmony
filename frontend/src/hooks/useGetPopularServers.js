import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

// usually only for server type server, cause the other server types need serverids and userslist
const useServersPopular = () => {
  const [loading, setLoading] = useState(false);

  const serversPopular = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/servers/popular`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, serversPopular };
};

export default useServersPopular;
