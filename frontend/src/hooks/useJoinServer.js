import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import useServer from "../zustand/useServer";

// usually only for server type server, cause the other server types need serverids and userslist
const useJoinServer = () => {
  const [loading, setLoading] = useState(false);
  const addServer = useServer((state) => state.addServer);
  const joinServer = useCallback(
    async (server_id) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/servers/join/${server_id}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        addServer(data);
        return data;
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [addServer],
  );

  return { loading, joinServer };
};

export default useJoinServer;
