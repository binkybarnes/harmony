import PropTypes from "prop-types";
import { usePopupContext } from "../popups/PopupContext";
import useServer from "../../zustand/useServer";
import { IoIosAddCircleOutline } from "react-icons/io";

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
      className="h-12 w-12 rounded-md bg-yellow-300 p-0.5 transition-all duration-200 hover:cursor-pointer hover:rounded-[1.2rem] active:translate-y-[2px]"
    >
      <IoIosAddCircleOutline size="100%" color="red" />
    </div>
  );
};

CreateServerButton.propTypes = {
  setDiscoverServersVisible: PropTypes.func,
};

export default CreateServerButton;
