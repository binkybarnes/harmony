import PropTypes from "prop-types";
import useServer from "../../../zustand/useServer";
import { useAuthContext } from "../../../context/AuthContext";

// conversation is a Server that is type DM or GroupChat, and they have only 1 channel
const Conversation = ({ conversation }) => {
  const { server, channel, users } = conversation;

  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);
  const selectedServer = useServer((state) => state.selectedServer);

  const serverId = server.server_id;
  const isSelected = selectedServer?.server_id === serverId;

  const { authUser } = useAuthContext();
  const user_id = authUser.user_id;
  const otherUsers = users.filter((user) => user.user_id !== user_id);
  const conversationName = otherUsers
    .map((user) => user.display_username)
    .join(", ");

  const handleClick = () => {
    setSelectedServer(server);
    // rename channel_name with the other user
    // also dms and groupchats only have 1 channel
    setSelectedChannel({ ...channel, channel_name: conversationName });
  };

  // temporary hard coded profile picture
  return (
    <div
      onClick={handleClick}
      className={`mb-1 flex h-[52px] items-center gap-2 rounded-md bg-base-100 p-1.5 hover:cursor-pointer hover:bg-neutral-700 hover:text-neutral-300 active:bg-neutral-600 active:text-neutral-200 ${isSelected ? "bg-neutral-600 text-neutral-200" : ""} `}
    >
      <img
        className="h-10 w-10 rounded-md bg-red-500"
        src={`https://robohash.org/${conversationName}`}
      />
      <p className="truncate font-medium">{conversationName}</p>
    </div>
  );
};

Conversation.propTypes = {
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
