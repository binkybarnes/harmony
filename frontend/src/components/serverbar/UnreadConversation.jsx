import PropTypes from "prop-types";
import { usePopupContext } from "../popups/PopupContext";
import useServer from "../../zustand/useServer";
import { useMemo } from "react";
import { useAuthContext } from "../../context/AuthContext";

const UnreadConversation = ({ conversation, handleClick }) => {
  const { handleServerHover } = usePopupContext();

  const selectedConversation = useServer((state) => state.selectedConversation);

  const { authUser } = useAuthContext();
  const user_id = authUser.user_id;
  const otherUser = conversation.users.filter(
    (user) => user.user_id !== user_id,
  )[0];
  const serverName = otherUser.display_username;

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleServerHover(true, serverName, rect);
  };

  const handleMouseLeave = () => {
    handleServerHover(false, serverName, {});
  };
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => handleClick(conversation)}
      className="group mb-2"
    >
      <div className="relative group-hover:cursor-pointer">
        <div
          className={`overflow-hidden bg-primary transition-all duration-100 group-hover:rounded-[1.2rem] group-active:translate-y-[1.5px] ${
            selectedConversation?.server.server_id ===
            conversation.server.server_id
              ? "rounded-[1.2rem]"
              : "rounded-md"
          }`}
        >
          {otherUser.s3_icon_key ? (
            <img
              draggable={false}
              className="h-[48px] w-[48px]"
              src={`https://${import.meta.env.VITE_CLOUDFRONT_IMAGE_URL}/user-icons/${otherUser.s3_icon_key}`}
            />
          ) : (
            <img
              className="h-[48px] w-[48px]"
              src={`https://robohash.org/${otherUser.display_username}`}
            />
          )}
        </div>

        <div
          style={{
            width: `${conversation.server.unread_messages < 10 ? "24px" : conversation.server.unread_messages < 100 ? "30px" : "38px"}`,
          }}
          className="absolute bottom-0 right-0 h-6 translate-x-1 translate-y-1 rounded-xl bg-base-400"
        ></div>
        <div
          style={{
            width: `${conversation.server.unread_messages < 10 ? "16px" : conversation.server.unread_messages < 100 ? "22px" : "30px"}`,
          }}
          className="absolute bottom-0 right-0 flex w-[30px] items-center justify-center rounded-lg bg-error text-xs font-bold text-white"
        >
          {conversation.server.unread_messages < 1000
            ? conversation.server.unread_messages
            : "1K+"}
        </div>
      </div>
      {/* <div
        className={`overflow-hidden ${
          selectedServer?.server_id === server.server_id
            ? "rounded-[1.2rem] bg-primary"
            : "rounded-md bg-base-100"
        } transition-all duration-100 hover:bg-primary group-hover:cursor-pointer group-hover:rounded-[1.2rem] group-active:translate-y-[1.5px]`}
      >
        
      </div> */}
    </div>
  );
};

UnreadConversation.propTypes = {
  conversation: PropTypes.shape({
    users: PropTypes.arrayOf(
      PropTypes.shape({
        date_joined: PropTypes.string,
        display_username: PropTypes.string,
        profile_picture: PropTypes.string,
        user_id: PropTypes.number,
      }),
    ),
    server: PropTypes.shape({
      server_id: PropTypes.number,
      server_type: PropTypes.string,
      members: PropTypes.number,
      server_name: PropTypes.string,
      unread_messages: PropTypes.number,
    }),
    channel: PropTypes.shape({
      channel_id: PropTypes.number,
      server_id: PropTypes.number,
      channel_name: PropTypes.string,
    }),
  }),
  handleClick: PropTypes.func,
};

export default UnreadConversation;
