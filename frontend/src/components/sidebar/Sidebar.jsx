import Channels from "./servers/Channels";
import Profilebar from "./Profilebar";
import SearchInput from "./conversations/SearchInput";
import ServerHeader from "./servers/ServerHeader";
import Conversations from "./conversations/Conversations";
import useServer from "../../zustand/useServer";
const Sidebar = () => {
  const selectedServer = useServer((state) => state.selectedServer);

  return (
    <div className="flex h-screen w-60 shrink-0 select-none flex-col gap-3 bg-base-200">
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
