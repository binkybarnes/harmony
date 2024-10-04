import { useCallback, useMemo } from "react";
import useServer from "../../zustand/useServer";
import UnreadConversation from "./UnreadConversation";

const UnreadConversations = () => {
  const conversations = useServer((state) => state.conversations);
  const setSelectedConversation = useServer(
    (state) => state.setSelectedConversation,
  );
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);

  const handleConversationClick = useCallback(
    (conversation) => {
      setSelectedConversation(conversation);
      setSelectedServer(conversation.server);
      // rename channel_name with the other user
      // also dms and groupchats only have 1 channel
      setSelectedChannel(conversation.channel);
    },
    [setSelectedChannel, setSelectedConversation, setSelectedServer],
  );
  // put dms in here only if unread messages
  const mapDmConversations = useMemo(() => {
    return conversations.map((conversation) => {
      if (conversation.server.unread_messages > 0) {
        return (
          <UnreadConversation
            key={conversation.server.server_id}
            conversation={conversation}
            handleClick={handleConversationClick}
          />
        );
      }
    });
  }, [conversations, handleConversationClick]);

  return (
    <div className="scrollbar-none overflow-y-scroll">{mapDmConversations}</div>
  );
};

export default UnreadConversations;
