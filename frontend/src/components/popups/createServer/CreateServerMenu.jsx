import { useCallback, useEffect, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { IoIosClose } from "react-icons/io";
import PropTypes from "prop-types";
import { usePopupContext } from "../PopupContext";
import useServer from "../../../zustand/useServer";
import toast from "react-hot-toast";
import { useAuthContext } from "../../../context/AuthContext";
import useCreateServer from "../../../hooks/useCreateServer";
import UploadImageIcon from "./UploadImageIcon";

const CreateServerMenu = () => {
  const menuRef = useRef(null);
  const selectedServer = useServer((state) => state.selectedServer);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const { loading, createServer } = useCreateServer();
  const { serverMenu, setServerMenuVisible, setModalOverlayVisible } =
    usePopupContext();

  const { authUser } = useAuthContext();
  const inputRef = useRef(null);

  const [serverName, setServerName] = useState("");

  const handleInputChange = useCallback((event) => {
    setServerName(event.target.value);
  }, []);

  const onClose = useCallback(() => {
    setServerMenuVisible(false);
    setModalOverlayVisible(false);
  }, [setServerMenuVisible, setModalOverlayVisible]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      event.stopPropagation();
      inputRef.current?.focus();
    };
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (serverName.length > 30) {
      toast.error("Server name too long");
    } else {
      await createServer(serverName);
      onClose();
    }
  };

  return (
    <CSSTransition
      in={serverMenu.visible}
      nodeRef={menuRef}
      timeout={200}
      classNames="channel-menu"
      unmountOnExit
      onEntering={() => {
        setButtonsDisabled(true);
        setServerName(`${authUser.display_username}'s server`);
      }}
      onEntered={() => setButtonsDisabled(false)}
      onExiting={() => setButtonsDisabled(true)}
    >
      <div className="absolute left-0 top-0 flex h-screen w-screen items-center justify-center">
        <form onSubmit={handleSubmit} ref={menuRef}>
          <fieldset disabled={buttonsDisabled}>
            <div className="w-[460px] rounded-md bg-green-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-medium">Create Server</h1>
                <button onClick={onClose} className="hover:text-green-500">
                  <IoIosClose className="flex-shrink-0" size={40} />
                </button>
              </div>
              <div className="mb-4 flex justify-center">
                <div className="relative h-[80px] w-[80px]">
                  <UploadImageIcon />
                  <input
                    style={{ fontSize: "0px" }}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif"
                    className="absolute top-0 h-full w-full opacity-0 hover:cursor-pointer"
                  />
                </div>
              </div>
              <div className="mb-8">
                <h2 className="mb-2 text-xs font-bold">SERVER NAME</h2>
                <div className="h-10 rounded-md bg-base-100 pl-2">
                  <input
                    ref={inputRef}
                    value={serverName}
                    onChange={handleInputChange}
                    type="text"
                    className="h-full w-full bg-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="h-9 rounded-md px-4 hover:underline"
                >
                  Cancel
                </button>
                <button
                  disabled={!serverName || serverName.length > 30}
                  className={`h-9 rounded-md ${!serverName || serverName.length > 30 ? "cursor-not-allowed bg-red-500 text-yellow-500" : "bg-cyan-400 text-lime-400"} px-4`}
                >
                  Create Server
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </CSSTransition>
  );
};

CreateServerMenu.propTypes = {
  setVisible: PropTypes.func,
};
export default CreateServerMenu;
