import { IoSend } from "react-icons/io5";

import { useCallback, useEffect, useRef, useState } from "react";
import useSendMessage from "../../hooks/useSendMessage.js";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { usePopupContext } from "../popups/PopupContext.jsx";
import toast from "react-hot-toast";
const MessageInput = () => {
  const { loading, sendMessage } = useSendMessage();
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  const formRef = useRef(null);
  const { authUser } = useAuthContext();
  const { popupActive } = usePopupContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.length >= 600) {
      toast.error("Message longer than 600 characters");
    } else if (message) {
      await sendMessage(
        message,
        authUser.display_username,
        authUser.s3_icon_key,
      );
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current.requestSubmit();
    }
  };

  // adjust height to text content height
  useEffect(() => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [message]);

  useEffect(() => {
    const focusTextarea = () => {
      textareaRef.current.focus();
    };

    if (popupActive) {
      document.removeEventListener("keydown", focusTextarea);
    } else {
      document.addEventListener("keydown", focusTextarea);
    }

    return () => {
      document.removeEventListener("keydown", focusTextarea);
    };
  }, [popupActive]);

  return (
    <form ref={formRef} className="px-2" onSubmit={handleSubmit}>
      <div className="scrollbar-sidebar bg-base-50 mb-6 flex max-h-[50vh] w-full select-none overflow-y-scroll rounded-md pl-2">
        <div className="flex flex-1">
          <textarea
            className="text-content-normal w-full resize-none bg-transparent py-[11px] leading-[1.375rem] outline-none"
            rows={1}
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          ></textarea>
        </div>
        {/* 
        <input
          type="text"
          placeholder="Message Username"
          className="flex-1 bg-red-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        /> */}

        <div className="text-button sticky top-0 flex h-[44px] items-center pl-2">
          <button type="submit">
            <div className="flex h-[36px] w-[36px] items-center justify-center transition-transform duration-75 hover:text-red-400 active:translate-y-[1.5px]">
              <IoSend size={"20px"} />
            </div>
          </button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
