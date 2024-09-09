import React, { useEffect } from "react";
import { useWebsocketContext } from "../context/WebsocketContext";
import useServer from "../zustand/useServer";
import toast from "../../node_modules/react-hot-toast/dist/index";

const useListenMessages = () => {
  const { websocket } = useWebsocketContext();
  const messages = useServer((state) => state.messages);
  const setMessages = useServer((state) => state.setMessages);

  useEffect(() => {
    if (!websocket) return;
    const handleIncomingMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data) {
          console.log("BRUHHHH");
          console.log(messages);
          setMessages([...messages, data]);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    websocket.addEventListener("message", handleIncomingMessage);
    return () => {
      websocket.removeEventListener("message", handleIncomingMessage);
    };
  }, [websocket, messages, setMessages]);
};

export default useListenMessages;
