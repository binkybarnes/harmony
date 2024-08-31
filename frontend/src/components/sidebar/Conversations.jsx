import Conversation from "./Conversation";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import useConversationInfo from "../../hooks/useConversationInfo";

const Conversations = () => {
  // TODO: put groupchats in here
  const { loading, servers, serverIds, usersList, channelsList } =
    useConversationInfo("Dm");

  const { authUser } = useAuthContext();
  const user_id = authUser.user_id;

  const mapDmConversations = usersList.map((users, i) => {
    if (users.length != 2) {
      toast.error("DM servers should have only 2 members");
      return null;
    }
    const otherUsers = users.filter((user) => user.user_id !== user_id);

    return (
      <Conversation
        key={serverIds[i]}
        otherUsers={otherUsers}
        server={servers[i]}
        channel={channelsList[i][0]}
      />
    );
  });

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
