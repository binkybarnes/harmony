import Servers from "./Servers";
import PropTypes from "prop-types";
import JoinServerButton from "./JoinServerButton";
import DmButton from "./DmButton";
import CreateServerButton from "./CreateServerButton";

const Serverbar = () => {
  return (
    <div className="bg-base-400 flex h-screen w-[72px] shrink-0 select-none flex-col items-center gap-2 py-2">
      <DmButton />
      <div className="h-[2px] w-[36px] rounded-[1px] bg-base-100"></div>
      <Servers />
      <CreateServerButton />
      <JoinServerButton />
    </div>
  );
};

export default Serverbar;
