import { useState } from "react";
import toast from "react-hot-toast";
import useServer from "../zustand/useServer";

// usually only for server type server, cause the other server types need serverids and userslist
const useJoinServer = () => {
  const [loading, setLoading] = useState(false);
  const addServer = useServer((state) => state.addServer);
  const joinServer = async (server_id) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/servers/join/${server_id}`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addServer(data);
      return data;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, joinServer };
};

export default useJoinServer;
