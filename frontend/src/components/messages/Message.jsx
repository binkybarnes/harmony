const Message = () => {
  return (
    <div className="relative mt-4 rounded-md pl-16">
      <div className="avatar absolute left-4 select-none">
        <div className="w-10 rounded-md object-contain">
          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
      <h3 className="relative">
        <span className="mr-1 align-baseline font-medium leading-[1.375rem] text-neutral-200">
          Username
        </span>
        {/* <span className="absolute top-1/2 -mt-2 ml-1 text-xs">
          10/10/2000 3:50 PM
        </span> */}
        <span className="align-baseline text-xs leading-[1.375rem]">
          10/10/2000 3:50 PM
        </span>
      </h3>
      <div className="whitespace-break-spaces leading-[1.375rem] text-neutral-200">
        <span>TEXT CONTENT fdjfid</span>
      </div>
    </div>
  );
};

export default Message;
