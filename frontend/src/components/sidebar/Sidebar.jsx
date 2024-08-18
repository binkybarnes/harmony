import Conversations from "./Conversations";
import Profilebar from "./Profilebar";
import SearchInput from "./SearchInput";
const Sidebar = () => {
  return (
    <div className="flex h-screen w-60 shrink-0 flex-col gap-3 bg-lime-300 py-2">
      <SearchInput />
      <Conversations />
      <Profilebar />
    </div>
  );
};
export default Sidebar;
