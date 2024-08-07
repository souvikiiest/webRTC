import { useEffect, useRef, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const stream = useRef<MediaStream | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "sender",
        })
      );
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createAnswer") {
        await pc.current?.setRemoteDescription(message.sdp);
      }
      if (message.type === "iceCandidate") {
        await pc.current?.addIceCandidate(message.candidate);
      }
    };

    setSocket(socket);

    return () => {
      socket.close();
      pc.current?.close();
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const initiateCall = async () => {
    if (!socket) return;
    const peerConnection = new RTCPeerConnection();
    pc.current = peerConnection;

    peerConnection.onnegotiationneeded = async () => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.send(
        JSON.stringify({
          type: "createOffer",
          sdp: peerConnection.localDescription,
        })
      );
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      stream.current = mediaStream;
      mediaStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, mediaStream));
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  return (
    <div>
      Senders page
      <button onClick={initiateCall}>START CALL</button>
    </div>
  );
};
