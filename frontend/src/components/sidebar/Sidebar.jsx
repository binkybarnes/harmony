import Channels from "./Channels";
import Profilebar from "./Profilebar";
import SearchInput from "./SearchInput";
import ServerHeader from "./ServerHeader";
import Conversations from "./Conversations";
const Sidebar = () => {
  return (
    <div className="flex h-screen w-60 shrink-0 select-none flex-col gap-3 bg-lime-300 py-2">
      <SearchInput />
      <Conversations />
      {/* <ServerHeader />
      <Channels /> */}

      <Profilebar />
    </div>
  );
};
export default Sidebar;
