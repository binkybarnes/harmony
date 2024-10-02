import { useState } from "react";
import toast from "react-hot-toast";

const useEditServer = () => {
  const [loading, setLoading] = useState(false);

  const editServer = async (server_id, server_name, server_icon) => {
    setLoading(true);

    try {
      const formData = new FormData();
      if (server_name) {
        formData.append("server_name", server_name);
      }

      if (server_icon) {
        formData.append("server_icon", server_icon);
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/servers/edit/${server_id}`,
        {
          method: "PATCH",
          body: formData,
          credentials: "include",
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, editServer };
};

export default useEditServer;
