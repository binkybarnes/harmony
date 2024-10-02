import PropTypes from "prop-types";
import { memo } from "react";

const FieldComponent = ({ name, header, handleOnChange, type }) => {
  return (
    <div className="mt-5">
      <h2 className="text-xs font-bold text-button">{header}</h2>
      <input
        name={name}
        onChange={handleOnChange}
        type={type}
        className="mt-2 h-10 w-full rounded-md bg-base-400 p-2 text-content-normal"
      />
    </div>
  );
};

FieldComponent.propTypes = {
  name: PropTypes.string,
  header: PropTypes.string,
  handleOnChange: PropTypes.func,
  type: PropTypes.string,
};

const Field = memo(FieldComponent);

export default Field;
