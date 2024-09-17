import { RiArrowDropDownLine } from "react-icons/ri";
import { usePopupContext } from "../../popups/PopupContext";
import useServer from "../../../zustand/useServer";

const ServerHeader = () => {
  const { toggleServerDropdown } = usePopupContext();
  const selectedServer = useServer((state) => state.selectedServer);
  const handleClick = (event) => {
    event.stopPropagation();
    toggleServerDropdown();
  };
  return (
    <header className="px-2">
      <div
        onClick={handleClick}
        className="flex h-10 cursor-pointer items-center justify-between rounded-md bg-red-500 px-4 py-2 font-semibold text-neutral-200"
      >
        <h2 className="truncate">{selectedServer.server_name}</h2>
        <RiArrowDropDownLine className="flex-shrink-0" size={32} />
      </div>
    </header>
  );
};

export default ServerHeader;
