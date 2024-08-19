import Servers from "./Servers";
import { IoChatbox } from "react-icons/io5";
import { IoIosAddCircleOutline } from "react-icons/io";
import SideButton from "./SideButton";

const Serverbar = () => {
  return (
    <div className="flex h-screen w-[72px] shrink-0 flex-col items-center gap-2 bg-red-400 py-2">
      <SideButton name="Direct Messages">
        <IoChatbox size="auto" color="red" />
      </SideButton>
      <div className="h-[2px] w-[36px] rounded-[1px] bg-emerald-400"></div>
      <Servers />

      <SideButton name="Add a Server">
        <IoIosAddCircleOutline size="auto" color="red" />
      </SideButton>
    </div>
  );
};

export default Serverbar;
