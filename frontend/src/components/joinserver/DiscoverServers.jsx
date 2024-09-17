import { useEffect, useMemo, useState } from "react";

import ServerCard from "./ServerCard";
import SearchServersName from "./SearchServersName";
import useServersPopular from "../../hooks/useGetPopularServers";

const DiscoverServers = () => {
  const { loading, serversPopular } = useServersPopular();
  const [servers, setServers] = useState([]);

  useEffect(() => {
    const initializeServers = async () => {
      console.log("skibid");
      setServers(await serversPopular());
    };
    initializeServers();
  }, [serversPopular]);

  const serversMap = useMemo(
    () =>
      servers.map((server) => (
        <ServerCard key={server.server_id} server={server} />
      )),
    [servers],
  );

  return (
    <div className="scrollbar-messages h-screen min-w-[480px] flex-1 overflow-x-hidden overflow-y-scroll bg-base-100 p-8">
      <div className="mb-4 flex justify-center">
        <div className="w-[720px] text-center">
          <h1 className="mb-2 text-xl font-semibold text-neutral-200">
            Join a server
          </h1>
          <SearchServersName setServers={setServers} />
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
        {serversMap}
      </div>
    </div>
  );
};

export default DiscoverServers;
