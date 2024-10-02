import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// usually only for server type server, cause the other server types need serverids and userslist
const useSearchServers = () => {
  const [loading, setLoading] = useState(false);

  const searchServers = async (searchType, term) => {
    setLoading(true);
    try {
      let url = "";
      switch (searchType) {
        case "name":
          url = `${import.meta.env.VITE_API_URL}/api/servers/searchName?name=${term}`;
          break;
        case "id":
          url = `${import.meta.env.VITE_API_URL}/api/servers/searchId?id=${term}`;
          break;
      }
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, searchServers };
};

export default useSearchServers;
