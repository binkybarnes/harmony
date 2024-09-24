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
  const setSelectedServer = useServer((state) => state.setSelectedServer);
  const setSelectedChannel = useServer((state) => state.setSelectedChannel);
  const addServer = useServer((state) => state.addServer);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const { createServer } = useCreateServer();
  const { serverMenu, setServerMenuVisible, setModalOverlayVisible } =
    usePopupContext();

  const { authUser } = useAuthContext();
  const inputRef = useRef(null);

  const [serverName, setServerName] = useState("");
  const [serverIcon, setServerIcon] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleInputChange = useCallback((event) => {
    setServerName(event.target.value);
  }, []);

  const onClose = useCallback(() => {
    setServerMenuVisible(false);
    setModalOverlayVisible(false);
  }, [setServerMenuVisible, setModalOverlayVisible]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
      // apparently focusing on another inputref prevents the messageinput from listening
      inputRef.current?.focus();
    };
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    if (!serverMenu.visible) {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, serverMenu.visible]);

  const submit = async () => {
    if (!serverName || serverName.length > 30) {
      toast.error("Server name too long");
    } else {
      const { server: newServer, channel: newChannel } = await createServer(
        serverName,
        serverIcon,
        [],
        "Server",
      );
      if (newServer) {
        addServer(newServer);
        setSelectedServer(newServer);
        setSelectedChannel(newChannel);
      }
      onClose();
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    await submit();
  };

  const handleInputKeyDown = async (event) => {
    // for some reason enter submits the form
    if (event.key === "Enter") {
      event.preventDefault();
      await submit();
    }
  };

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
    }
  }, []);

  return (
    <CSSTransition
      in={serverMenu.visible}
      nodeRef={menuRef}
      timeout={200}
      classNames="modal-menu"
      unmountOnExit
      onEntering={() => {
        setButtonsDisabled(true);
        setServerIcon(null);
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
                  {serverIcon ? (
                    <img
                      src={previewUrl}
                      className="h-[80px] w-[80px] rounded-md"
                    />
                  ) : (
                    <UploadImageIcon />
                  )}

                  <input
                    onChange={handleFileChange}
                    style={{ fontSize: "0px" }}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    className="absolute left-0 top-0 h-full w-full opacity-0 hover:cursor-pointer"
                  />
                </div>
              </div>
              <div className="mb-8">
                <h2 className="mb-2 text-xs font-bold">SERVER NAME</h2>
                <div className="h-10 rounded-md bg-base-100 pl-2">
                  <input
                    onKeyDown={handleInputKeyDown}
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
