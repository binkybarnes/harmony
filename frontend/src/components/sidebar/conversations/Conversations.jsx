import Conversation from "./Conversation";

import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import useConversationInfo from "../../../hooks/useConversationInfo";
import { useWebsocketContext } from "../../../context/WebsocketContext";

const Conversations = () => {
  useWebsocketContext();

  // TODO: put groupchats in here
  const { loading, servers, serverIds, usersList, channelsList } =
    useConversationInfo("Dm");

  const mapDmConversations = useMemo(
    () =>
      usersList.map((users, i) => {
        if (users.length != 2) {
          toast.error("DM servers should have only 2 members");
          return null;
        }

        return (
          <Conversation
            key={servers[i].server_id}
            users={users}
            server={servers[i]}
            channel={channelsList[i][0]}
          />
        );
      }),
    [usersList, channelsList, servers],
  );

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
