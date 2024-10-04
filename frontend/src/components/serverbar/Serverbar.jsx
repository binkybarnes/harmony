import Servers from "./Servers";
import PropTypes from "prop-types";
import JoinServerButton from "./JoinServerButton";
import DmButton from "./DmButton";
import CreateServerButton from "./CreateServerButton";
import UnreadConversations from "./UnreadConversations";

const Serverbar = () => {
  return (
    <div className="flex h-screen w-[72px] shrink-0 select-none flex-col items-center bg-base-400 py-2">
      <DmButton />
      <UnreadConversations />
      <div className="mb-2 h-[2px] w-[36px] rounded-[1px] bg-base-100"></div>
      <Servers />
      <CreateServerButton />
      <JoinServerButton />
    </div>
  );
};

export default Serverbar;
