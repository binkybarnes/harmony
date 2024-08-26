import LogoutButton from "./LogoutButton.jsx";
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
      <LogoutButton />
    </div>
  );
};

export default Profilebar;
