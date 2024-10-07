import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuthContext } from "./AuthContext";

export const WebsocketContext = createContext(null);

export const useWebsocketContext = () => {
  return useContext(WebsocketContext);
};
export const WebsocketContextProvider = ({ children }) => {
  const [websocket, setWebsocket] = useState(null);
  const { authUser } = useAuthContext();

  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const connectWebSocket = () => {
    if (authUser) {
      const ws = new WebSocket(
        `${import.meta.env.VITE_API_URL}/ws/chat_ws/${authUser.user_id}`,
      );

      ws.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttemptsRef.current = 0; // Reset attempts after a successful connection
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected. Attempting to reconnect...");
        attemptReconnect(); // Try reconnecting
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close(); // Close connection on error
      };

      // Handle messages
      // ws.onmessage = (event) => {
      //   try {
      //     const data = JSON.parse(event.data);
      //     console.log(data);
      //   } catch (error) {
      //     console.error("Failed to parse WebSocket message:", error);
      //   }
      // };

      setWebsocket(ws);
    }
  };

  const attemptReconnect = () => {
    if (reconnectAttemptsRef.current < 10) {
      // Exponential backoff: delay increases with more attempts
      const delay = Math.min(
        10000,
        1000 * Math.pow(2, reconnectAttemptsRef.current),
      ); // max delay of 10 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current += 1;
        connectWebSocket(); // Reattempt connection
      }, delay);
    } else {
      console.error(
        "Max reconnect attempts reached. WebSocket will not reconnect.",
      );
    }
  };

  useEffect(() => {
    if (authUser) {
      connectWebSocket();

      // Cleanup on component unmount or when authUser changes
      return () => {
        if (websocket) {
          websocket.close();
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };
    }
  }, [authUser?.user_id]);
  return (
    <WebsocketContext.Provider value={{ websocket }}>
      {children}
    </WebsocketContext.Provider>
  );
};

WebsocketContextProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.element]),
};
