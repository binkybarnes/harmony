const MessageContainer = () => {
  return (
    <div className="flex-1 bg-blue-500 p-2">
      <div className="h-10 rounded-md bg-red-500">
        <div className="flex items-center gap-2 rounded-md text-neutral-200">
          <div className="avatar">
            <div className="w-8 rounded-md">
              <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
          </div>
          <p className="truncate">Username</p>
        </div>
      </div>
    </div>
  );
};

export default MessageContainer;
