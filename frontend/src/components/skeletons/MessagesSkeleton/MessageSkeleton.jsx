import PropTypes from "prop-types";

const MessageSkeleton = ({ numBlobs }) => {
  return (
    <div className="relative mt-4 rounded-md pl-16">
      <div className="absolute left-4 select-none">
        <div className="h-10 w-10 rounded-md bg-content-muted-100 object-contain"></div>
      </div>
      <h3 className="h-5">
        <div className="message-skeleton w-32 bg-content-muted-100"></div>
      </h3>

      <div className="h-5">
        {[...Array(numBlobs)].map((_, i) => (
          <div
            key={i}
            style={{ width: `${Math.floor(Math.random() * 10 + 4)}rem` }}
            className="message-skeleton bg-content-muted-100"
          ></div>
        ))}
        {/* <div className="message-skeleton w-[3rem] bg-gray-500"></div>
        <div className="message-skeleton w-32 bg-gray-500"></div>
        <div className="message-skeleton w-24 bg-gray-500"></div> */}
      </div>
    </div>
  );
};

MessageSkeleton.propTypes = {
  numBlobs: PropTypes.number,
};

export default MessageSkeleton;
