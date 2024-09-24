import { useState } from "react";
import useServer from "../zustand/useServer";
import toast from "react-hot-toast";

const useGetDm = () => {
  const [loading, setLoading] = useState(false);

  const getDm = async (recipient_id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/servers/dms/${recipient_id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, getDm };
};

export default useGetDm;
