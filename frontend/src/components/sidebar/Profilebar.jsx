import { VscSignOut } from "react-icons/vsc";
const Profilebar = () => {
  return (
    <div className="mx-2 flex items-center justify-between rounded-md bg-base-100 p-1.5">
      <div className="flex min-w-0 items-center gap-2">
        <div className="avatar">
          <div className="w-10 rounded-md">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          </div>
        </div>
        <p className="truncate font-medium">Your username fsdojfdsfodsj</p>
      </div>
      <VscSignOut
        className="flex-shrink-0 hover:text-neutral-300 active:text-neutral-200"
        size="20px"
      />
    </div>
  );
};

export default Profilebar;
