import Conversation from "./Conversation";

import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import useConversationInfo from "../../../hooks/useConversationInfo";
import { useWebsocketContext } from "../../../context/WebsocketContext";
import useServer from "../../../zustand/useServer";

// TODO: START CACHEING EVERYTHING
// TODO: make last messaged conversation the top
const Conversations = () => {
  // useWebsocketContext();

  const conversations = useServer((state) => state.conversations);
  const setConversations = useServer((state) => state.setConversations);
  // TODO: put groupchats in here
  // TODO: handle the server name in the backend?
  const { loading, servers, usersList, channelsList } =
    useConversationInfo("Dm");

  useEffect(() => setConversations(servers), [servers, setConversations]);

  const mapDmConversations = useMemo(() => {
    if (!conversations || !channelsList || !usersList) {
      return null;
    }
    return usersList.map((users, i) => {
      if (users.length != 2) {
        toast.error("DM servers should have only 2 members");
        return null;
      }

      return (
        <Conversation
          key={conversations[i].server_id}
          users={users}
          server={conversations[i]}
          channel={channelsList[i][0]}
        />
      );
    });
  }, [usersList, channelsList, conversations]);

  return (
    <nav className="scrollbar-sidebar visible-on-hover flex-1 overflow-y-scroll pl-2">
      {loading ? (
        <span className="loading loading-spinner" />
      ) : (
        mapDmConversations
      )}
    </nav>
  );
};

export default Conversations;
