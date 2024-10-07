import { IoCall } from "react-icons/io5";
import useWebRTC from "../../hooks/webRTC/useWebRTC";
import { useEffect, useRef } from "react";
const CallButton = ({ user_id }) => {
  const { localStream, remoteStream, initiateCall } = useWebRTC(user_id);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  console.log(remoteStream);
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream; // Display local stream
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream; // Display remote stream
    }
  }, [remoteStream]);
  return (
    <div>
      <button onClick={initiateCall}>
        <IoCall className="text-button" size="24" />
      </button>
      <video
        className="border-8 border-solid border-red-500"
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
      />
      <video ref={remoteVideoRef} autoPlay playsInline />
    </div>
  );
};

export default CallButton;
