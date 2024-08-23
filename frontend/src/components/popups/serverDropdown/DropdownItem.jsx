import PropTypes from "prop-types";

const LeaveServer = ({ text, icon }) => {
  return (
    <div className="flex items-center justify-between rounded-md bg-transparent px-2 py-1.5 text-accent hover:bg-accent hover:text-neutral-200 active:brightness-95">
      <div className="truncate text-sm">{text}</div>
      {icon}
    </div>
  );
};

LeaveServer.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.element,
};
export default LeaveServer;
