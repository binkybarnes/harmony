import { usePopupContext } from "../../popups/PopupContext";
import { IoIosAdd } from "react-icons/io";
const CreateChannelButton = () => {
  const { handleInfoHover, setChannelMenuVisible, setModalOverlayVisible } =
    usePopupContext();

  const handleMouseEnter = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    handleInfoHover(true, "Create Channel", rect);
  };
  const handleMouseLeave = () => {
    handleInfoHover(false, "Create Channel", {});
  };

  const handleClick = (event) => {
    event.stopPropagation();
    setModalOverlayVisible(true);
    setChannelMenuVisible(true);
  };

  return (
    <IoIosAdd
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="hover:text-yellow-400 active:text-cyan-300"
      size={24}
    />
  );
};

export default CreateChannelButton;
