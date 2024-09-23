// import { useEffect } from "react";
// import { useWebsocketContext } from "../../context/WebsocketContext";
// import useServer from "../../zustand/useServer";
// import toast from "react-hot-toast";

// const useListenUserJoin = () => {
//   const { websocket } = useWebsocketContext();
//   const addUser = useServer((state) => state.addUser);
//   const selectedServer = useServer((state) => state.selectedServer);
//   useEffect(() => {
//     if (!websocket) return;
//     const handleIncomingMessage = (event) => {
//       try {
//         const ws_event = JSON.parse(event.data);
//         console.log(ws_event);

//         if (
//           ws_event.event_type === "UserJoin" &&
//           ws_event.data.server_id == selectedServer.server_id
//         ) {
//           addUser(ws_event.data.user);
//         }
//       } catch (error) {
//         toast.error(error.message);
//       }
//     };

//     websocket.addEventListener("message", handleIncomingMessage);
//     return () => {
//       websocket.removeEventListener("message", handleIncomingMessage);
//     };
//   }, [websocket, addUser, selectedServer]);
// };

// export default useListenUserJoin;
