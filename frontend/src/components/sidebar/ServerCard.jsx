import { RiArrowDropDownLine } from "react-icons/ri";

const ServerCard = () => {
  return (
    <div className="px-2">
      <div className="flex h-10 items-center justify-between rounded-md bg-red-500 px-4 py-2 font-semibold text-neutral-200">
        <div>Server Name</div>
        <RiArrowDropDownLine size={32} />
      </div>
      <div className="absolute left-12 z-50 h-20 w-20 bg-purple-500">FFFFF</div>
    </div>
  );
};

export default ServerCard;
