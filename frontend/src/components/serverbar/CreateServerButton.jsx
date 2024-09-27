import PropTypes from "prop-types";
import { usePopupContext } from "../popups/PopupContext";
import useServer from "../../zustand/useServer";
import { IoIosAddCircle } from "react-icons/io";

const CreateServerButton = () => {
  const { handleServerHover, setServerMenuVisible, setModalOverlayVisible } =
    usePopupContext();

  const name = "Create a Server";
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleServerHover(true, name, rect);
  };
  const handleMouseLeave = () => {
    handleServerHover(false, name, {});
  };
  const handleClick = (event) => {
    event.stopPropagation();
    setModalOverlayVisible(true);
    setServerMenuVisible(true);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="flex h-12 w-12 items-center justify-center rounded-md bg-primary p-0.5 transition-all duration-200 hover:cursor-pointer hover:rounded-[1.2rem] active:translate-y-[2px]"
    >
      <IoIosAddCircle size="40" color="#dbdee1" />
    </div>
  );
};

CreateServerButton.propTypes = {
  setDiscoverServersVisible: PropTypes.func,
};

export default CreateServerButton;
