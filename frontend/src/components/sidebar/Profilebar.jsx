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
      <svg
        className="h-6 w-6 hover:cursor-pointer hover:text-neutral-300 active:text-neutral-200"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
        />
      </svg>
    </div>
  );
};

export default Profilebar;
