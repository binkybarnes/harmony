import { CSSTransition } from "react-transition-group";
import { usePopupContext } from "../PopupContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { RiMessage3Line } from "react-icons/ri";
import { useAuthContext } from "../../../context/AuthContext";
import useCreateServer from "../../../hooks/useCreateServer";
import useServer from "../../../zustand/useServer";
import useGetDm from "../../../hooks/useGetDm";
import useImageUpload from "../../../utils/useImageUpload";
import toast from "react-hot-toast";
import useEditUser from "../../../hooks/useEditUser";

// TODO: Make a factory for this mess
const UserMenu = () => {
  const menuRef = useRef(null);
  const { userMenu, setUserMenu, setModalOverlayVisible } = usePopupContext();
  const { authUser, setLocalStorageAuthUser } = useAuthContext();
  const { createServer } = useCreateServer();
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);

  const {
    icon,
    previewUrl,
    iconChanged,
    setIconChanged,
    handleFileChange,
    setPreviewUrl,
    setIcon,
  } = useImageUpload();
  const { editUser } = useEditUser();
  const isSelf = userMenu.user.user_id === authUser.user_id;

  const { getDm } = useGetDm();

  const onClose = useCallback(() => {
    setUserMenu((prev) => ({ ...prev, visible: false }));
    setIconChanged(false);
    setModalOverlayVisible(false);
  }, [setUserMenu, setModalOverlayVisible, setIconChanged]);

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
      // uselistendm will add it to conversations state
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
        // server added in listen server created
        setSelectedServer(newServer);
        setSelectedChannel(newChannel);
      }
    }
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!iconChanged) {
      toast.error("Server name too long");
    } else {
      const newUser = await editUser(userMenu.user_id, icon);
      if (newUser) {
        setLocalStorageAuthUser(newUser);
      }
      onClose();
    }
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
        setPreviewUrl(null);
        setIcon(null);
      }}
      onEntered={() => setButtonsDisabled(false)}
      onExiting={() => setButtonsDisabled(true)}
    >
      <div className="absolute left-0 top-0 flex h-screen w-screen items-center justify-center">
        <form onSubmit={handleSubmit} ref={menuRef}>
          <fieldset disabled={buttonsDisabled}>
            <div className="w-[460px] rounded-md bg-black p-4">
              <div className="flex justify-between">
                <h1 className="text-2xl font-bold text-content-header">
                  {userMenu.user.display_username}
                </h1>
                <button onClick={onClose} className="hover:text-green-500">
                  <IoIosClose className="flex-shrink-0" size={40} />
                </button>
              </div>

              <div className="justify-apart flex justify-between">
                <div className="group relative h-[144px] w-[144px] overflow-hidden rounded-md bg-primary">
                  {userMenu.user?.s3_icon_key || previewUrl ? (
                    <img
                      draggable={false}
                      className="h-[144px] w-[144px]"
                      src={
                        previewUrl
                          ? previewUrl
                          : `https://${import.meta.env.VITE_CLOUDFRONT_IMAGE_URL}/user-icons/${userMenu.user.s3_icon_key}`
                      }
                    />
                  ) : (
                    <img
                      className="h-[144px] w-[144px]"
                      src={`https://robohash.org/${userMenu.user.display_username}`}
                    />
                  )}

                  {isSelf ? (
                    <>
                      <input
                        onChange={handleFileChange}
                        style={{ fontSize: "0px" }}
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.webp"
                        className="absolute left-0 top-0 h-full w-full opacity-0 hover:cursor-pointer"
                      />
                      <div className="pointer-events-none invisible absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-xs font-bold text-white group-hover:visible">
                        CHANGE ICON
                      </div>
                    </>
                  ) : null}
                </div>

                {!isSelf ? (
                  <button
                    onClick={handleMessageClick}
                    className="self-end rounded-md bg-primary px-2 py-1.5 text-white hover:brightness-110"
                  >
                    <div className="flex items-center gap-2">
                      <RiMessage3Line size="20px" />
                      Message
                    </div>
                  </button>
                ) : null}
              </div>

              {isSelf ? (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="h-9 rounded-md px-4 text-button hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!iconChanged}
                    className={`h-9 rounded-md text-content-normal ${!iconChanged ? "cursor-not-allowed bg-red-500" : "bg-primary"} px-4`}
                  >
                    Save Changes
                  </button>
                </div>
              ) : null}
            </div>
          </fieldset>
        </form>
      </div>
    </CSSTransition>
  );
};

export default UserMenu;
