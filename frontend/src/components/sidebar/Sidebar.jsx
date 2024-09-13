import Channels from "./Channels";
import Profilebar from "./Profilebar";
import SearchInput from "./SearchInput";
import ServerHeader from "./ServerHeader";
import Conversations from "./Conversations";
import useServer from "../../zustand/useServer";
const Sidebar = () => {
  const selectedServer = useServer((state) => state.selectedServer);

  return (
    <div className="flex h-screen w-60 shrink-0 select-none flex-col gap-3 bg-lime-300 py-2">
      {selectedServer?.server_type === "Server" ? (
        <>
          <ServerHeader />
          <Channels />
        </>
      ) : (
        <>
          <SearchInput />
          <Conversations />
        </>
      )}

      <Profilebar />
    </div>
  );
};
export default Sidebar;
