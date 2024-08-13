import Conversations from "./Conversations";
import Profilebar from "./Profilebar";
import SearchInput from "./SearchInput";
const Sidebar = () => {
  return (
    <div className="flex h-screen max-w-60 flex-col gap-3 overflow-hidden bg-lime-300 p-2">
      <SearchInput />
      <Conversations />
      <Profilebar />
    </div>
  );
};
export default Sidebar;
