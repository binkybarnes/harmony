import Channels from "./Channels";
import Conversations from "./Conversations";
import Profilebar from "./Profilebar";
import SearchInput from "./SearchInput";
import ServerCard from "./ServerCard";
const Sidebar = () => {
  return (
    <div className="flex h-screen w-60 shrink-0 select-none flex-col gap-3 bg-lime-300 py-2">
      <SearchInput />
      <ServerCard />
      {/* <Conversations /> */}
      <Channels />
      <Profilebar />
    </div>
  );
};
export default Sidebar;
