import { useEffect } from "react";
import { useWebsocketContext } from "../../context/WebsocketContext";
import useServer from "../../zustand/useServer";
import toast from "react-hot-toast";

const useListenServerCreated = () => {
  
  const { websocket } = useWebsocketContext();
  const addConversation = useServer((state) => state.addConversation);
  const addServer = useServer((state) => state.addServer);
  useEffect(() => {
    if (!websocket) return;
    const handleIncomingMessage = (event) => {
      try {
        const ws_event = JSON.parse(event.data);
        if (ws_event.event_type === "ServerCreated") {
          console.log(ws_event);

          const server_type = ws_event.data.server.server_type;
          if (server_type === "Dm" || server_type === "GroupChat") {

          addConversation(ws_event.data);
          }
          else if (server_type === "Server") {
            addServer(ws_event.data);
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
  }, [websocket, addConversation, addServer]);
};

export default useListenServerCreated;
