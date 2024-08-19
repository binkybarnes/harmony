import Servers from "./Servers";
import { IoChatbox } from "react-icons/io5";
import { IoIosAddCircleOutline } from "react-icons/io";

const Serverbar = () => {
  return (
    <div className="flex h-screen w-[72px] shrink-0 flex-col items-center bg-red-400 py-2">
      <div className="mb-2 rounded-md bg-yellow-300">
        <IoChatbox size={48} color="red" />
      </div>
      <div className="mb-2 h-[2px] w-[36px] rounded-[1px] bg-emerald-400"></div>
      <Servers />
      <div className="mt-2 rounded-md bg-yellow-300">
        <IoIosAddCircleOutline size={48} color="red" />
      </div>
    </div>
  );
};

export default Serverbar;
