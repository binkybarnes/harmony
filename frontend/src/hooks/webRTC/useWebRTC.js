import { useState, useEffect, useRef } from "react";

import { useWebsocketContext } from "../../context/WebsocketContext";
import { useAuthContext } from "../../context/AuthContext";

const useWebRTC = (toUserId) => {
  const { authUser } = useAuthContext(); // Authenticated user's info
  const { websocket } = useWebsocketContext(); // Access WebSocket
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      // Get the user's local media (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
    };

    init();
  }, []);

  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection();

    // Add local stream to the peer connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log(event);
      setRemoteStream(event.streams[0]); // Set the incoming remote stream
    };

    // Send ICE candidates to the remote peer via WebSocket
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && websocket) {
        const iceCandidate = {
          event_type: "IceCandidate",
          data: {
            candidate: event.candidate.candidate, // ICE candidate
            sdp_mid: event.candidate.sdpMid, // SDP mid
            sdp_mline_index: event.candidate.sdpMLineIndex, // SDP m-line index
            to: toUserId, // Receiver's user ID
            from: authUser.user_id, // Sender's user ID
          },
        };
        console.log(iceCandidate);
        websocket.send(JSON.stringify(iceCandidate));
      }
    };

    return peerConnection;
  };

  // Initiate a WebRTC call (Offer)
  const initiateCall = async () => {
    const peerConnection = createPeerConnection();
    peerConnectionRef.current = peerConnection;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Send the offer to the remote peer via WebSocket
    const offerMessage = {
      event_type: "Offer",
      data: {
        sdp: offer.sdp,
        to: toUserId, // Send to the other user
        from: authUser.user_id, // Your user ID
      },
    };
    websocket.send(JSON.stringify(offerMessage));
  };

  // Handle incoming WebSocket messages for signaling
  useEffect(() => {
    if (!websocket) return;

    websocket.onmessage = async (event) => {
      console.log(event);
      const message = JSON.parse(event.data);

      if (
        message.event_type === "Offer" &&
        message.data.to === authUser.user_id
      ) {
        const peerConnection = createPeerConnection();
        peerConnectionRef.current = peerConnection;

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({ type: "offer", sdp: message.data.sdp }),
        );

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        // Send the answer back to the remote peer via WebSocket
        const answerMessage = {
          event_type: "Answer",
          data: {
            sdp: answer.sdp,
            to: message.data.from, // Respond back to the caller
            from: authUser.user_id, // Your user ID
          },
        };
        websocket.send(JSON.stringify(answerMessage));
      } else if (
        message.event_type === "Answer" &&
        message.data.to === authUser.user_id
      ) {
        // Set the remote description to complete the connection
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription({ type: "answer", sdp: message.data.sdp }),
        );
      } else if (
        message.event_type === "IceCandidate" &&
        message.data.to === authUser.user_id
      ) {
        console.log("Received ICE Candidate:", message.data);
        try {
          // Construct a full ICE candidate with candidate, sdpMid, and sdpMLineIndex
          const candidate = new RTCIceCandidate({
            candidate: message.data.candidate,
            sdpMid: message.data.sdp_mid,
            sdpMLineIndex: message.data.sdp_mline_index,
          });

          // Add the ICE candidate to the peer connection
          await peerConnectionRef.current.addIceCandidate(candidate);
        } catch (error) {
          console.error("Failed to add ICE candidate", error);
        }
      }
    };
  }, [websocket, authUser.user_id]);

  return { localStream, remoteStream, initiateCall };
};

export default useWebRTC;
