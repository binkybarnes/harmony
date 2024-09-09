import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";

export const WebsocketContext = createContext(null);

export const useWebsocketContext = () => {
  return useContext(WebsocketContext);
};
export const WebsocketContextProvider = ({ children }) => {
  const [websocket, setWebsocket] = useState(null);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser) {
      const ws = new WebSocket(`http://127.0.0.1:5000/ws/${7}`);

      //   ws.onmessage = (event) => {
      //     try {
      //       const data = JSON.parse(event.data);
      //       if (data.users) {
      //         setOnlineUsers(data.users);
      //       }
      //     } catch (error) {
      //       console.error("Failed to parse websocket message:", error);
      //     }
      //   };

      setWebsocket(ws);

      return () => ws.close();
    } else {
      if (websocket) {
        websocket.close();
        setWebsocket(null);
      }
    }
  }, [authUser]);
  return (
    <WebsocketContext.Provider value={{ websocket }}>
      {children}
    </WebsocketContext.Provider>
  );
};

WebsocketContextProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.element]),
};
