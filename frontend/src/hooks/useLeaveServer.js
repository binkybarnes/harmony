import { useState } from "react";
import toast from "react-hot-toast";
import useServer from "../zustand/useServer";

// usually only for server type server, cause the other server types need serverids and userslist
const useLeaveServer = () => {
  const [loading, setLoading] = useState(false);
  const removeServer = useServer((state) => state.removeServer);
  const leaveServer = async (server_id) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/servers/leave/${server_id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error((await res.json()).error);
      removeServer(server_id);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, leaveServer };
};

export default useLeaveServer;
