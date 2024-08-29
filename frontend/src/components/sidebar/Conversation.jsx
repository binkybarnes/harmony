import PropTypes from "prop-types";
import useServer from "../../zustand/useServer";
const Conversation = ({ otherUser, server }) => {
  const { selectedServer, setSelectedServer, setSelectedChannel } = useServer();
  const isSelected = selectedServer?.server_id === server.server_id;
  // temporary hard coded profile picture
  return (
    <div
      onClick={() => {
        setSelectedServer(server);
        // setSelectedChannel()
      }}
      className={`mb-1 flex items-center gap-2 rounded-md bg-base-100 p-1.5 hover:cursor-pointer hover:bg-neutral-700 hover:text-neutral-300 active:bg-neutral-600 active:text-neutral-200 ${isSelected ? "bg-neutral-600 text-neutral-200" : ""} `}
    >
      <div className="w-10 rounded-md object-contain">
        <img src={`https://robohash.org/${otherUser.display_username}`} />
      </div>
      <p className="truncate font-medium">{otherUser.display_username}</p>
    </div>
  );
};

Conversation.propTypes = {
  otherUser: PropTypes.shape({
    date_joined: PropTypes.string,
    display_username: PropTypes.string,
    profile_picture: PropTypes.string,
    user_id: PropTypes.number,
  }),
  server: PropTypes.shape({
    server_id: PropTypes.number,
    server_type: PropTypes.string,
    members: PropTypes.number,
  }),
};
export default Conversation;
