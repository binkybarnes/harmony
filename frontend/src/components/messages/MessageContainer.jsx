import useServer from "../../zustand/useServer";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import Toolbar from "./Toolbar";
const MessageContainer = () => {
  const selectedServer = useServer((state) => state.selectedServer);
  if (!selectedServer) {
    return (
      <div className="flex h-screen flex-1 flex-col gap-3 bg-blue-500 px-2"></div>
    );
  } else {
    return (
      <div className="flex h-screen flex-1 flex-col gap-3 bg-blue-500 px-2">
        <Toolbar />
        <Messages />
        <MessageInput />
      </div>
    );
  }
};

export default MessageContainer;
