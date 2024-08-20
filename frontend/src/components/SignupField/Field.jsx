import PropTypes from "prop-types";

const Field = ({ name }) => {
  return (
    <div className="mt-5">
      <h2 className="text-sm font-semibold">{name}</h2>
      <input
        type="text"
        className="mt-2 h-10 w-full rounded-md bg-neutral-700 p-2"
      />
    </div>
  );
};

Field.propTypes = {
  name: PropTypes.string,
};
export default Field;
