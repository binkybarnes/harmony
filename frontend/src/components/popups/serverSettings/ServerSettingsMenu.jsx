import { useCallback, useEffect, useRef, useState } from "react";
import { TbBrandAmongUs } from "react-icons/tb";
import { CSSTransition } from "react-transition-group";
import { IoIosClose } from "react-icons/io";
import PropTypes from "prop-types";
import { usePopupContext } from "../PopupContext";
import useCreateChannel from "../../../hooks/useCreateChannel";
import useServer from "../../../zustand/useServer";

import toast from "react-hot-toast";
import useEditServer from "../../../hooks/useEditServer";
const ServerSettingsMenu = () => {
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const selectedServer = useServer((state) => state.selectedServer);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const {
    serverSettingsMenu,
    setServerSettingsMenuVisible,
    setModalOverlayVisible,
  } = usePopupContext();

  const [serverName, setServerName] = useState("");
  const [serverIcon, setServerIcon] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [infoChanged, setInfoChanged] = useState(false);

  const { loading, editServer } = useEditServer();

  const onClose = useCallback(() => {
    setServerSettingsMenuVisible(false);
    setModalOverlayVisible(false);
  }, [setServerSettingsMenuVisible, setModalOverlayVisible]);

  const handleInputChange = useCallback((event) => {
    setServerName(event.target.value);
  }, []);

  useEffect(() => {
    setInfoChanged(serverName !== selectedServer?.server_name);

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

    if (!serverSettingsMenu.visible) {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    onClose,
    serverSettingsMenu.visible,
    serverName,
    selectedServer?.server_name,
  ]);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          const img = new Image();
          img.src = result;

          img.onload = () => {
            const inputWidth = img.naturalWidth;
            const inputHeight = img.naturalHeight;
            // convert to aspect ratio 1
            let outputWidth = inputWidth;
            let outputHeight = inputHeight;
            if (inputWidth > inputHeight) {
              outputWidth = inputHeight;
            } else if (inputHeight > inputWidth) {
              outputHeight = inputWidth;
            }

            const offsetX = (outputWidth - inputWidth) * 0.5;
            const offsetY = (outputHeight - inputHeight) * 0.5;

            const canvas = document.createElement("canvas");
            canvas.width = outputWidth;
            canvas.height = outputHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, offsetX, offsetY);

            // create a second canvas to scale the square image to 512x512
            const scaledCanvas = document.createElement("canvas");
            scaledCanvas.width = 512;
            scaledCanvas.height = 512;

            const scaledCtx = scaledCanvas.getContext("2d");
            scaledCtx.drawImage(canvas, 0, 0, 512, 512);

            scaledCanvas.toBlob(
              (blob) => {
                const resizedImage = new File(
                  [blob],
                  "resized-server-icon.webp",
                  {
                    type: "image/webp",
                  },
                );
                setServerIcon(resizedImage);
                setPreviewUrl(URL.createObjectURL(blob));
              },
              "image/webp",
              1, // Quality maximum (1)
            );
          };
        } else {
          console.error("Result of FileReader is not a string");
        }
      };
      reader.readAsDataURL(file);
      setInfoChanged(true);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (serverName.length > 30) {
      toast.error("Server name too long");
    } else {
      const newServer = await editServer(
        selectedServer.server_id,
        serverName,
        serverIcon,
      );
      if (newServer) {
        // TODO: update the changes
      }
      onClose();
    }
  };

  return (
    <CSSTransition
      in={serverSettingsMenu.visible}
      nodeRef={menuRef}
      timeout={200}
      classNames="modal-menu"
      unmountOnExit
      onEntering={() => {
        setButtonsDisabled(true);
        setServerName(selectedServer.server_name);
        setServerIcon(null);
      }}
      onEntered={() => setButtonsDisabled(false)}
      onExiting={() => setButtonsDisabled(true)}
    >
      <div className="absolute left-0 top-0 flex h-screen w-screen items-center justify-center">
        <form onSubmit={handleSubmit} ref={menuRef}>
          <fieldset disabled={buttonsDisabled}>
            <div className="rounded-md bg-green-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="mb-2.5 text-xl font-semibold text-red-500">
                  Server Settings
                </h1>
                <button onClick={onClose} className="hover:text-green-500">
                  <IoIosClose className="flex-shrink-0" size={40} />
                </button>
              </div>

              <div className="mb-4 flex gap-5">
                <div className="group relative h-[144px] w-[144px] overflow-hidden rounded-md">
                  <img
                    draggable={false}
                    className="h-[144px] w-[144px]"
                    src={
                      serverIcon
                        ? previewUrl
                        : selectedServer && selectedServer.s3_icon_key
                          ? `https://${import.meta.env.VITE_CLOUDFRONT_IMAGE_URL}/${selectedServer.s3_icon_key}`
                          : `https://robohash.org/${serverName}`
                    }
                  />
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
                </div>
                <div>
                  <h3 className="mb-2 flex-1 text-xs font-bold">SERVER ICON</h3>
                  <button className="relative rounded-md border-[1px] border-solid border-base-100 bg-transparent px-2.5 py-2">
                    Upload Image
                    <input
                      onChange={handleFileChange}
                      style={{ fontSize: "0px" }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      className="absolute left-0 top-0 h-full w-full opacity-0 hover:cursor-pointer"
                    />
                  </button>
                </div>

                <div>
                  <h3 className="mb-2 flex-1 text-xs font-bold">SERVER NAME</h3>
                  <div className="rounded-md bg-base-100">
                    <input
                      value={serverName}
                      type="text"
                      onChange={handleInputChange}
                      className="bg-transparent px-2.5 py-2"
                    />
                  </div>
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
                  disabled={
                    !infoChanged || !serverName || serverName.length > 30
                  }
                  className={`h-9 rounded-md ${!infoChanged || !serverName || serverName.length > 30 ? "cursor-not-allowed bg-red-500 text-yellow-500" : "bg-cyan-400 text-lime-400"} px-4`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </CSSTransition>
  );
};

ServerSettingsMenu.propTypes = {
  setVisible: PropTypes.func,
};
export default ServerSettingsMenu;
