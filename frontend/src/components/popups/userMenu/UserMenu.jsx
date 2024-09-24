import { CSSTransition } from "react-transition-group";
import { usePopupContext } from "../PopupContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { RiMessage3Line } from "react-icons/ri";
import { useAuthContext } from "../../../context/AuthContext";
import useCreateServer from "../../../hooks/useCreateServer";
import useServer from "../../../zustand/useServer";
import useConversationInfo from "../../../hooks/useConversationInfo";
import useGetDm from "../../../hooks/useGetDm";

// TODO: Make a factory for this mess
const UserMenu = () => {
  const menuRef = useRef(null);
  const { userMenu, setUserMenu, setModalOverlayVisible } = usePopupContext();
  const { authUser } = useAuthContext();
  const { createServer } = useCreateServer();
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const addConversation = useServer((state) => state.addConversation);
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);

  const { getDm } = useGetDm();

  const onClose = useCallback(() => {
    setUserMenu({ visible: false, user: {} });
    setModalOverlayVisible(false);
  }, [setUserMenu, setModalOverlayVisible]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    if (!userMenu.visible) {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, userMenu.visible]);

  const handleMessageClick = async (event) => {
    event.preventDefault();

    const { server: existingServer = null, channel: existingChannel = null } =
      await getDm(userMenu.user.user_id);

    if (existingServer && existingChannel) {
      setSelectedServer(existingServer);
      setSelectedChannel(existingChannel);
    } else {
      // TODO: decide on how to handle the name?
      const { server: newServer, channel: newChannel } = await createServer(
        "DM SERVER",
        null,
        [userMenu.user.user_id],
        "Dm",
      );
      if (newServer) {
        addConversation(newServer);
        setSelectedServer(newServer);
        setSelectedChannel(newChannel);
      }
    }
    onClose();
  };

  return (
    <CSSTransition
      in={userMenu.visible}
      nodeRef={menuRef}
      timeout={200}
      classNames="modal-menu"
      unmountOnExit
      onEntering={() => {
        setButtonsDisabled(true);
      }}
      onEntered={() => setButtonsDisabled(false)}
      onExiting={() => setButtonsDisabled(true)}
    >
      <div className="absolute left-0 top-0 flex h-screen w-screen items-center justify-center">
        <form ref={menuRef}>
          <fieldset disabled={buttonsDisabled}>
            <div className="w-[460px] rounded-md bg-green-200 p-4">
              <div className="flex justify-between">
                <h1 className="text-2xl font-bold text-white">
                  {userMenu.user.display_username}
                </h1>
                <button onClick={onClose} className="hover:text-green-500">
                  <IoIosClose className="flex-shrink-0" size={40} />
                </button>
              </div>

              <div className="justify-apart flex justify-between">
                <div className="h-[144px] w-[144px] overflow-hidden rounded-md">
                  <div className="h-[144px] w-[144px] bg-red-500">IMAGE</div>
                </div>
                {authUser.user_id !== userMenu.user.user_id ? (
                  <button
                    onClick={handleMessageClick}
                    className="self-end rounded-md bg-red-500 px-2 py-1.5 text-white hover:bg-yellow-500"
                  >
                    <div className="flex items-center gap-2">
                      <RiMessage3Line size="20px" />
                      Message
                    </div>
                  </button>
                ) : null}
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </CSSTransition>
  );
};

export default UserMenu;
