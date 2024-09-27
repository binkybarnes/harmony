import useGetMessages from "../../hooks/useGetMessages";
import MessagesSkeleton from "../skeletons/MessagesSkeleton/MessagesSkeleton";
import Message from "./Message";
import useServer from "../../zustand/useServer";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePopupContext } from "../popups/PopupContext";

const Messages = () => {
  const {
    loading,
    messages: fetchedMessages,
    users: fetchedUsers,
  } = useGetMessages();

  const messages = useServer((state) => state.messages);
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

  // TODO: put functions outside with the mapper
  // TODO: fix the handle submit functions by just adding the event parameter with it
  // TODO: use cursor based pagination to load only a subset of messages at a time
  const { setUserMenu, setModalOverlayVisible } = usePopupContext();

  const handleClick = useCallback(
    (event, user_id, display_username, s3_icon_key) => {
      event.stopPropagation();
      setModalOverlayVisible(true);
      setUserMenu({
        visible: true,
        user: {
          user_id,
          display_username,
          s3_icon_key,
        },
      });
    },
    [setModalOverlayVisible, setUserMenu],
  );

  const mapMessages = useMemo(
    () =>
      messages.map((message) => {
        return (
          <Message
            message={message}
            key={message.message_id}
            handleClick={(event) =>
              handleClick(
                event,
                message.user_id,
                message.display_username,
                message.s3_icon_key,
              )
            }
          />
        );
      }),
    [messages, handleClick],
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
    <div className="scrollbar-messages flex flex-1 flex-col overflow-x-auto overflow-y-scroll rounded-md bg-base-100 px-2">
      <div className="flex-1"></div>
      {loading ? <MessagesSkeleton /> : mapMessages}

      <div ref={messagesEndRef} className="min-h-4 w-[1px]"></div>
    </div>
  );
};

export default Messages;
