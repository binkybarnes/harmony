import { useCallback } from "react";
import toast from "react-hot-toast";

const useUpdateLastReadMessage = () => {
  const UpdateLastReadMessage = useCallback(async (server_id, message_id) => {
    try {
      console.log(message_id);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/servers/${server_id}/last-read-message/${message_id}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  return { UpdateLastReadMessage };
};

export default useUpdateLastReadMessage;
