import { RiArrowDropDownLine } from "react-icons/ri";
import { usePopupContext } from "../popups/PopupContext";

const ServerHeader = () => {
  const { toggleServerDropdown } = usePopupContext();
  const handleMouseDown = (event) => {
    // important so the clickoutside handler doesnt detect clicks on the button
    event.stopPropagation();
    toggleServerDropdown();
  };
  return (
    <header className="px-2">
      <div
        onMouseDown={handleMouseDown}
        className="flex h-10 cursor-pointer items-center justify-between rounded-md bg-red-500 px-4 py-2 font-semibold text-neutral-200"
      >
        <h2 className="truncate">Server Name</h2>
        <RiArrowDropDownLine className="flex-shrink-0" size={32} />
      </div>
    </header>
  );
};

export default ServerHeader;
