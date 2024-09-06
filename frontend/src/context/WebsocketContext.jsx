import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";

export const WebsocketContext = createContext(null);
export const WebsocketContextProvider = ({ children }) => {
  const [websocket, setWebsocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();
  useEffect(() => {
    if (authUser) {
      const ws = new WebSocket(
        `http://127.0.0.1:5000/chat/${authUser.user_id}`,
      );
      setWebsocket(ws);

      return () => websocket.close();
    } else {
      if (websocket) {
        websocket.close();
        setWebsocket(null);
      }
    }
  }, []);
  return (
    <WebsocketContext.Provider value={{ websocket, onlineUsers }}>
      {children}
    </WebsocketContext.Provider>
  );
};

WebsocketContextProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.element]),
};
