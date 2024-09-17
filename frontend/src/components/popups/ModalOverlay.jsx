import { CSSTransition } from "react-transition-group";
import { usePopupContext } from "./PopupContext";
import { useRef } from "react";

const ModalOverlay = () => {
  const { modalOverlay } = usePopupContext();
  const modalRef = useRef(null);
  return (
    <CSSTransition
      in={modalOverlay.visible}
      nodeRef={modalRef}
      timeout={200}
      classNames="modal-overlay"
      unmountOnExit
    >
      <div
        ref={modalRef}
        className="fixed left-0 top-0 h-screen w-screen bg-black opacity-65"
      ></div>
    </CSSTransition>
  );
};

export default ModalOverlay;
