import PropTypes from "prop-types";
import useServer from "../../../zustand/useServer";
import { useAuthContext } from "../../../context/AuthContext";

// conversation is a Server that is type DM or GroupChat, and they have only 1 channel
const Conversation = ({ handleClick, conversation }) => {
  const { server, channel, users } = conversation;

  // const setSelectedConversation = useServer(
  //   (state) => state.setSelectedConversation,
  // );
  // const setSelectedServer = useServer((state) => state.setSelectedServer);
  // const setSelectedChannel = useServer((state) => state.setSelectedChannel);
  const selectedServer = useServer((state) => state.selectedServer);

  const serverId = server.server_id;
  const isSelected = selectedServer?.server_id === serverId;

  const { authUser } = useAuthContext();
  const user_id = authUser.user_id;
  const otherUsers = users.filter((user) => user.user_id !== user_id);
  // handle only dm's rn, handle groupchats later
  const otherUser = otherUsers[0];
  // const conversationName = otherUsers
  //   .map((user) => user.display_username)
  //   .join(", ");

  // const handleClick = () => {
  //   setSelectedConversation(conversation);
  //   setSelectedServer(server);
  //   // rename channel_name with the other user
  //   // also dms and groupchats only have 1 channel
  //   setSelectedChannel(channel);
  // };

  // temporary hard coded profile picture
  return (
    <div
      onClick={handleClick}
      className={`active:bg-base-50 hover:text-content-muted-50 active:text-content-header mb-1 flex h-[52px] items-center gap-2 rounded-md p-1.5 hover:cursor-pointer hover:bg-base-100 ${isSelected ? "bg-base-50 text-content-header" : "text-content-muted-100 bg-base-200"} `}
    >
      <div className="h-10 w-10 overflow-hidden rounded-md bg-primary">
        {otherUser.s3_icon_key ? (
          <img
            draggable={false}
            className="h-10 w-10"
            src={`https://${import.meta.env.VITE_CLOUDFRONT_IMAGE_URL}/user-icons/${otherUser.s3_icon_key}`}
          />
        ) : (
          <img
            className="h-10 w-10"
            src={`https://robohash.org/${otherUser.display_username}`}
          />
        )}
      </div>
      <p className="truncate font-medium">{otherUser.display_username}</p>
    </div>
  );
};

Conversation.propTypes = {
  handleClick: PropTypes.func,
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
    }),
    channel: PropTypes.shape({
      channel_id: PropTypes.number,
      server_id: PropTypes.number,
      channel_name: PropTypes.string,
    }),
  }),
};
export default Conversation;
