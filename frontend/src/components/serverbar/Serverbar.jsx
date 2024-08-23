import Servers from "./Servers";
import { IoChatbox } from "react-icons/io5";
import { IoIosAddCircleOutline } from "react-icons/io";
import SideButton from "./SideButton";

const Serverbar = () => {
  return (
    <div className="flex h-screen w-[72px] shrink-0 select-none flex-col items-center gap-2 bg-red-400 py-2">
      <SideButton name="Direct Messages">
        <IoChatbox size="100%" color="red" />
      </SideButton>
      <div className="h-[2px] w-[36px] rounded-[1px] bg-emerald-400"></div>
      <Servers />

      <SideButton name="Join a Server">
        <IoIosAddCircleOutline size="100%" color="red" />
      </SideButton>
    </div>
  );
};

export default Serverbar;
