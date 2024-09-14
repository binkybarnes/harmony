import { useState } from "react";
import useGetChannels from "../../../hooks/useGetChannels";
import useServer from "../../../zustand/useServer";
import Channel from "./Channel";
import CreateChannelButton from "./CreateChannelButton";
import CreateChannelMenu from "../../popups/createChannel/CreateChannelMenu";
import { useAuthContext } from "../../../context/AuthContext";

const Channels = () => {
  const { authUser } = useAuthContext();
  const selectedServer = useServer((state) => state.selectedServer);
  const { loading, channels } = useGetChannels(selectedServer.server_id);
  const { createChannelVisible, setCreateChannelVisible } = useState(false);

  const mapChannels = channels.map((channel) => (
    <Channel key={channel.channel_id} channel={channel} />
  ));

  return (
    <div className="scrollbar-sidebar relative flex-1 overflow-y-scroll pl-2">
      <div className="group flex h-[32px] items-center justify-between px-1.5 pt-2 text-sm">
        <div className="group-hover:text-yellow-200">TEXT CHANNELS</div>
        {selectedServer.admins.includes(authUser.user_id) ? (
          <CreateChannelButton />
        ) : null}
      </div>
      {mapChannels}
    </div>
  );
};

export default Channels;
