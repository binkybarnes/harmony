import SearchServers from "./SearchServers";
import ServerCard from "./ServerCard";

const DiscoverServers = () => {
  return (
    <div className="scrollbar-messages h-screen min-w-[480px] flex-1 overflow-x-hidden overflow-y-scroll bg-base-100 p-8">
      {/* <DiscoverServers /> */}

      <SearchServers />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
        <ServerCard />
        <ServerCard />
        <ServerCard />
        <ServerCard />
        <ServerCard />
        <ServerCard />
        <ServerCard />
        <ServerCard />
        <ServerCard />
      </div>
    </div>
  );
};

export default DiscoverServers;
