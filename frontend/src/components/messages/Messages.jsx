import useGetMessages from "../../hooks/useGetMessages";
import MessagesSkeleton from "../skeletons/MessagesSkeleton/MessagesSkeleton";
import Message from "./Message";
import useServer from "../../zustand/useServer";
import { useEffect, useMemo, useRef } from "react";
import useGetUsers from "../../hooks/useGetUsers";
import { formatTime } from "../../utils/formatTime";
import useListenMessages from "../../hooks/websocketListeners/useListenMessages";

const Messages = () => {
  const {
    loading,
    messages: fetchedMessages,
    users: fetchedUsers,
  } = useGetMessages();

  const messages = useServer((state) => state.messages);
  const users = useServer((state) => state.users);
  const setMessages = useServer((state) => state.setMessages);
  const setUsers = useServer((state) => state.setUsers);
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
    if (fetchedUsers) {
      setUsers(fetchedUsers);
    }
  }, [fetchedMessages, fetchedUsers, setMessages, setUsers]);

  useListenMessages();

  // const usersMap = useMemo(
  //   () =>
  //     users.reduce((acc, user) => {
  //       acc[user.user_id] = user;
  //       return acc;
  //     }, {}),
  //   [users],
  // );

  // const messagesWithUsers = useMemo(() => {
  //   return messages.map((message) => {
  //     const formatted_date = formatTime(message.timestamp);

  //     const { display_username, profile_picture } = usersMap[message.user_id];
  //     return {
  //       ...message,
  //       display_username,
  //       profile_picture,
  //       formatted_date,
  //     };
  //   });
  // }, [usersMap, messages]);

  // dont render messages if loading, cause it would be the previous channel's messages
  // maybe add message cacheing

  const mapMessages = useMemo(
    () =>
      messages.map((message) => {
        return <Message message={message} key={message.message_id} />;
      }),
    [messages],
  );

  // scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  };

  return (
    <div className="scrollbar-messages flex flex-1 flex-col overflow-x-auto overflow-y-scroll rounded-md bg-cyan-400">
      <div className="flex-1 bg-cyan-300"></div>
      {loading ? <MessagesSkeleton /> : mapMessages}

      <div ref={messagesEndRef} className="min-h-4 w-[1px]"></div>
    </div>
  );
};

export default Messages;
