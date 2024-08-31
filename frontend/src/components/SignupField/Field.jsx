import PropTypes from "prop-types";

const Field = ({ name, header, handleOnChange }) => {
  return (
    <div className="mt-5">
      <h2 className="text-sm font-semibold">{header}</h2>
      <input
        name={name}
        value="RAAAAA"
        onChange={handleOnChange}
        type="text"
        className="mt-2 h-10 w-full rounded-md bg-neutral-700 p-2"
      />
    </div>
  );
};

Field.propTypes = {
  name: PropTypes.string,
  header: PropTypes.string,
  handleOnChange: PropTypes.func,
};
export default Field;
