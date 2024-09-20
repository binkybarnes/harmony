import { useEffect } from "react";
import { useWebsocketContext } from "../context/WebsocketContext";
import useServer from "../zustand/useServer";
import toast from "../../node_modules/react-hot-toast/dist/index";

const useListenMessages = () => {
  const { websocket } = useWebsocketContext();
  const addMessage = useServer((state) => state.addMessage);
  const selectedChannel = useServer((state) => state.selectedChannel);
  useEffect(() => {
    if (!websocket) return;
    const handleIncomingMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.channel_id == selectedChannel.channel_id) {
          addMessage(data);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    websocket.addEventListener("message", handleIncomingMessage);
    return () => {
      websocket.removeEventListener("message", handleIncomingMessage);
    };
  }, [websocket, addMessage, selectedChannel.channel_id]);
};

export default useListenMessages;
