const Conversation = () => {
  return (
    <a className="flex items-center gap-2 rounded-md bg-base-100 p-1.5 hover:bg-neutral-700 hover:text-neutral-300 active:bg-neutral-600 active:text-neutral-200">
      <div className="avatar">
        <div className="w-10 rounded-md object-contain">
          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
      <p className="truncate font-medium">Username</p>
    </a>
  );
};

export default Conversation;
