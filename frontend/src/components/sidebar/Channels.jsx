import useGetChannels from "../../hooks/useGetChannels";
import useServer from "../../zustand/useServer";
import { usePopupContext } from "../popups/PopupContext";
import Channel from "./Channel";
import { IoIosAdd } from "react-icons/io";

const Channels = () => {
  const { handleInfoHover } = usePopupContext();
  const selectedServer = useServer((state) => state.selectedServer);
  const { loading, channels } = useGetChannels(selectedServer.server_id);

  const mapChannels = channels.map((channel) => (
    <Channel key={channel.channel_id} channel={channel} />
  ));

  const handleMouseEnter = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    handleInfoHover(true, "Create Channel", rect);
  };
  const handleMouseLeave = () => {
    handleInfoHover(false, "Create Channel", {});
  };

  return (
    <div className="scrollbar-sidebar flex-1 overflow-y-scroll bg-gray-500 pl-2">
      <div className="group flex items-center justify-between px-1.5 pt-4 text-sm">
        <div className="group-hover:text-yellow-200">TEXT CHANNELS</div>
        <IoIosAdd
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="hover:text-yellow-400 active:text-cyan-300"
          size={24}
        />
      </div>
      {mapChannels}
    </div>
  );
};

export default Channels;
