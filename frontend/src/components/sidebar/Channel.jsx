import { TbBrandAmongUs } from "react-icons/tb";

const Channel = () => {
  return (
    <a className="mb-1 flex items-center gap-2 rounded-md bg-base-100 p-1.5 hover:cursor-pointer hover:bg-neutral-700 hover:text-neutral-300 active:bg-neutral-600 active:text-neutral-200">
      <TbBrandAmongUs className="flex-shrink-0" size={20} />
      <p className="truncate font-medium">Username</p>
    </a>
  );
};

export default Channel;
