const Toolbar = () => {
  return (
    <div className="mt-2 flex h-10 select-none items-center gap-2 rounded-md bg-red-500 p-1.5 text-neutral-200">
      <div className="avatar">
        <div className="w-8 rounded-md">
          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
      <p className="truncate font-medium text-neutral-200">Username</p>
    </div>
  );
};

export default Toolbar;
