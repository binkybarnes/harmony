import MessageInput from "./MessageInput";
import Messages from "./Messages";
import Toolbar from "./Toolbar";
const MessageContainer = () => {
  return (
    <div className="flex h-screen min-w-60 flex-1 flex-col gap-3 bg-blue-500 p-2">
      <Toolbar />

      <Messages />
      <MessageInput />
    </div>
  );
};

export default MessageContainer;
