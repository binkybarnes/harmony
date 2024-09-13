import PropTypes from "prop-types";
import { TbBrandAmongUs } from "react-icons/tb";
import useServer from "../../zustand/useServer";

const Channel = ({ channel }) => {
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);

  const handleClick = () => {
    setSelectedChannel(channel);
  };

  return (
    <a
      onClick={handleClick}
      className="mb-1 flex items-center gap-2 rounded-md bg-base-100 p-1.5 hover:cursor-pointer hover:bg-neutral-700 hover:text-neutral-300 active:bg-neutral-600 active:text-neutral-200"
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
