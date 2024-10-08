import useServer from "../../zustand/useServer";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import Toolbar from "./Toolbar";
const MessageContainer = () => {
  const selectedServer = useServer((state) => state.selectedServer);
  const selectedChannel = useServer((state) => state.selectedChannel);

  return (
    <div className="flex h-screen flex-1 flex-col gap-3 bg-base-100">
      {!selectedChannel || !selectedServer ? null : (
        <>
          <Toolbar />
          <Messages />
          <MessageInput />
        </>
      )}
    </div>
  );
};

export default MessageContainer;
