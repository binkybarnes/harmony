import PropTypes from "prop-types";
import { formatTime } from "../../utils/formatTime";
const Message = ({ message, handleClick }) => {
  const formatted_date = formatTime(message.timestamp);

  return (
    <div className="relative mt-4 rounded-md pl-16">
      <div
        onClick={handleClick}
        className="absolute left-4 w-10 select-none overflow-hidden rounded-md hover:cursor-pointer"
      >
        <img src={`https://robohash.org/${message.display_username}`} />
      </div>
      <h3 className="relative h-5 leading-[1.25rem]">
        <span
          onClick={handleClick}
          className="mr-1 align-baseline font-medium leading-[1.25rem] text-neutral-200 hover:cursor-pointer hover:underline"
        >
          {message.display_username}
        </span>
        {/* <span className="absolute top-1/2 -mt-2 ml-1 text-xs">
          10/10/2000 3:50 PM
        </span> */}
        <span className="align-middle text-xs leading-[1.25rem]">
          {formatted_date}
        </span>
      </h3>
      <div className="whitespace-break-spaces leading-[1.25rem] text-neutral-200">
        <span>{message.message}</span>
      </div>
    </div>
  );
};

Message.propTypes = {
  message: PropTypes.shape({
    profile_picture: PropTypes.string,
    display_username: PropTypes.string,
    message: PropTypes.string,
    timestamp: PropTypes.string,
    user_id: PropTypes.number,
  }),
  handleClick: PropTypes.func,
};
export default Message;
