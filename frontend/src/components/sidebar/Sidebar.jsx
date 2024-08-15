import Conversations from "./Conversations";
import Profilebar from "./Profilebar";
import SearchInput from "./SearchInput";
const Sidebar = () => {
  return (
    <div className="flex h-screen w-60 flex-col gap-3 bg-lime-300">
      <SearchInput />
      <Conversations />
      <Profilebar />
    </div>
  );
};
export default Sidebar;
