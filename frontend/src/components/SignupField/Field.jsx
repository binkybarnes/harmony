import PropTypes from "prop-types";
import { memo } from "react";

const FieldComponent = ({ name, header, handleOnChange }) => {
  return (
    <div className="mt-5">
      <h2 className="text-sm font-semibold">{header}</h2>
      <input
        name={name}
        onChange={handleOnChange}
        type="text"
        className="mt-2 h-10 w-full rounded-md bg-neutral-700 p-2"
      />
    </div>
  );
};

FieldComponent.propTypes = {
  name: PropTypes.string,
  header: PropTypes.string,
  handleOnChange: PropTypes.func,
};

const Field = memo(FieldComponent);

export default Field;
