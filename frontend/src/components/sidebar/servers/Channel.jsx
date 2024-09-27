import PropTypes from "prop-types";
import { TbBrandAmongUs } from "react-icons/tb";
import useServer from "../../../zustand/useServer";

const Channel = ({ channel }) => {
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);
  const selectedChannel = useServer((state) => state.selectedChannel);

  const handleClick = () => {
    setSelectedChannel(channel);
  };
  const isSelected = selectedChannel?.channel_id === channel.channel_id;

  return (
    <a
      onClick={handleClick}
      className={`active:bg-base-50 hover:text-content-muted-50 active:text-content-header mb-1 flex h-8 items-center gap-2 rounded-md p-1.5 hover:cursor-pointer hover:bg-base-100 ${isSelected ? "bg-base-50 text-content-header" : "text-content-muted-100 bg-base-200"} `}
    >
      <TbBrandAmongUs className="flex-shrink-0" size={20} />
      <p className="truncate font-medium">{channel.channel_name}</p>
    </a>
  );
};

Channel.propTypes = {
  channel: PropTypes.shape({
    channel_id: PropTypes.number,
    server_id: PropTypes.number,
    channel_name: PropTypes.string,
  }),
};

export default Channel;
