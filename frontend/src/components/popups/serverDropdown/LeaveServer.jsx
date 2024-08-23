import { VscSignOut } from "react-icons/vsc";
const LeaveServer = () => {
  return (
    <div className="flex items-center justify-between rounded-md bg-transparent px-2 py-1.5 text-error hover:bg-error hover:text-neutral-200 active:brightness-95">
      <div className="truncate text-sm">Leave Server</div>
      <VscSignOut className="flex-shrink-0" size="20px" />
    </div>
  );
};

export default LeaveServer;
