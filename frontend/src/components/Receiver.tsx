import { useEffect, useRef, useState } from "react";

export const Receiver = () => {
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createOffer") {
        const peerConnection = new RTCPeerConnection();
        setPc(peerConnection);

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(message.sdp)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: peerConnection.localDescription,
          })
        );

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
          }
        };

        peerConnection.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
          }
        };
      }

      if (message.type === "iceCandidate" && pc) {
        await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    };

    return () => {
      socket.close();
      pc?.close();
    };
  }, [pc]);

  return (
    <div>
      Receiver page
      <video ref={videoRef} autoPlay playsInline></video>
    </div>
  );
};
