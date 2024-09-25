import { useEffect } from "react";
import { useWebsocketContext } from "../../context/WebsocketContext";
import useServer from "../../zustand/useServer";
import toast from "react-hot-toast";

const useListenMessages = () => {
  const { websocket } = useWebsocketContext();
  const addMessage = useServer((state) => state.addMessage);
  const selectedChannel = useServer((state) => state.selectedChannel);
  useEffect(() => {
    if (!websocket || !selectedChannel) return;
    const handleIncomingMessage = (event) => {
      try {
        const ws_event = JSON.parse(event.data);

        if (
          ws_event.event_type === "Message" &&
          ws_event.data.channel_id == selectedChannel.channel_id
        ) {
          addMessage(ws_event.data);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    websocket.addEventListener("message", handleIncomingMessage);
    return () => {
      websocket.removeEventListener("message", handleIncomingMessage);
    };
  }, [websocket, addMessage, selectedChannel]);
};

export default useListenMessages;
