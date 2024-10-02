import { useEffect } from "react";
import { useWebsocketContext } from "../../context/WebsocketContext";
import useServer from "../../zustand/useServer";
import toast from "react-hot-toast";

const useListenMessages = () => {
  const { websocket } = useWebsocketContext();
  const addMessage = useServer((state) => state.addMessage);
  const selectedChannel = useServer((state) => state.selectedChannel);
  const conversations = useServer((state) => state.conversations);
  const setConversations = useServer((state) => state.setConversations);
  useEffect(() => {
    if (!websocket || !selectedChannel) return;
    const handleIncomingMessage = (event) => {
      try {
        const ws_event = JSON.parse(event.data);
        console.log(ws_event);

        if (ws_event.event_type === "Message") {
          console.log(ws_event.data);
          if (ws_event.data.message.channel_id == selectedChannel.channel_id) {
            addMessage(ws_event.data.message);
          }

          // update the order of conversations
          if (
            ws_event.data.server_type === "Dm" ||
            ws_event.data.server_type === "GroupChat"
          ) {
            setConversations(
              conversations.map((conversation) => {
                if (conversation.server.server_id === ws_event.data.server_id) {
                  return {
                    ...conversation,
                    server: {
                      ...conversation.server,
                      last_message_at: ws_event.data.message.timestamp,
                    },
                  };
                }
                return conversation;
              }),
            );
          }
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
