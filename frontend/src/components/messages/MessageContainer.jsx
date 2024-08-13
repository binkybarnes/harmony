const MessageContainer = () => {
  return (
    <div className="min-w-60 flex-1 overflow-hidden bg-blue-500 p-2">
      <div className="flex h-10 items-center gap-2 rounded-md bg-red-500 p-1.5 text-neutral-200">
        <div className="avatar">
          <div className="w-8 rounded-md">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          </div>
        </div>
        <p className="truncate">Username</p>
      </div>
    </div>
  );
};

export default MessageContainer;
