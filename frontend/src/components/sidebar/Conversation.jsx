import PropTypes from "prop-types";
import useServer from "../../zustand/useServer";
import useGetChannels from "../../hooks/useGetChannels";

// conversation is a Server that is type DM or GroupChat, and they have only 1 channel
const Conversation = ({ otherUsers, server }) => {
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);
  const selectedServer = useServer((state) => state.selectedServer);

  const serverId = server.server_id;
  const isSelected = selectedServer?.server_id === serverId;
  const { channels } = useGetChannels(serverId);

  const conversationName = otherUsers
    .map((user) => user.display_username)
    .join(", ");

  const handleClick = () => {
    setSelectedServer(server);
    // rename channel_name with the other user
    // also dms and groupchats only have 1 channel
    setSelectedChannel({ ...channels[0], channel_name: conversationName });
  };

  // temporary hard coded profile picture
  return (
    <div
      onClick={handleClick}
      className={`mb-1 flex items-center gap-2 rounded-md bg-base-100 p-1.5 hover:cursor-pointer hover:bg-neutral-700 hover:text-neutral-300 active:bg-neutral-600 active:text-neutral-200 ${isSelected ? "bg-neutral-600 text-neutral-200" : ""} `}
    >
      <div className="w-10 rounded-md object-contain">
        <img src={`https://robohash.org/${conversationName}`} />
      </div>
      <p className="truncate font-medium">{conversationName}</p>
    </div>
  );
};

Conversation.propTypes = {
  otherUsers: PropTypes.arrayOf(
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
  }),
};
export default Conversation;
