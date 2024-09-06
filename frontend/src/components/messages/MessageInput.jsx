import { IoSend } from "react-icons/io5";

import { useCallback, useEffect, useRef, useState } from "react";
import useSendMessage from "../../hooks/useSendMessage.js";
const MessageInput = () => {
  const { loading, sendMessage } = useSendMessage();
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message) {
      await sendMessage(message);
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

    window.addEventListener("keydown", focusTextarea);

    return () => {
      window.removeEventListener("keydown", focusTextarea);
    };
  }, []);

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="scrollbar-sidebar mb-6 flex max-h-[50vh] w-full select-none overflow-y-scroll rounded-md bg-green-400 pl-2 text-neutral-200">
        <div className="flex flex-1">
          <textarea
            className="w-full resize-none bg-red-500 py-[11px] leading-[1.375rem] outline-none"
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

        <div className="sticky top-0 flex h-[44px] items-center pl-2">
          <button type="submit">
            <div className="flex h-[36px] w-[36px] items-center justify-center bg-purple-500 transition-transform duration-75 hover:text-red-400 active:translate-y-[1.5px]">
              <IoSend size={"20px"} />
            </div>
          </button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
