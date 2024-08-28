import useGetServers from "../../hooks/useGetServers";
import Conversation from "./Conversation";
const Conversations = () => {
  const { loading, servers } = useGetServers("Dm");
  console.log(servers);
  return (
    <nav className="scrollbar-sidebar flex-1 overflow-y-scroll pl-2">
      {servers.map((conversation) => (
        <Conversation
          key={conversation.server_id}
          conversation={conversation}
        />
      ))}
      {loading && <span className="loading loading-spinner" />}
    </nav>
  );
};

export default Conversations;
