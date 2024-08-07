import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;
//createOffer
//createAnswer

wss.on("connection", (ws) => {
  ws.on("message", (data: any) => {
    const message = JSON.parse(data);

    if (message.type == "sender") {
      senderSocket = ws;
      console.log("sender set");
    } else if (message.type == "receiver") {
      receiverSocket = ws;
      console.log("receiver set");
    } else if (message.type == "createOffer") {
      receiverSocket?.send(
        JSON.stringify({ type: "createOffer", sdp: message.sdp })
      );
      console.log("offer created and sent to receiver");
    } else if (message.type == "createAnswer") {
      senderSocket?.send(
        JSON.stringify({ type: "createAnswer", sdp: message.sdp })
      );
      console.log("answer created and sent to sender");
    } else if (message.type == "iceCandidate") {
      if (ws == senderSocket) {
        receiverSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
        console.log("ice candidate sent to receiver");
      } else if (ws == receiverSocket) {
        senderSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
        console.log("ice candidate sent to sender");
      }
    }
  });
  ws.on("close", () => {
    if (ws === senderSocket) {
      senderSocket = null;
      console.log("Sender disconnected");
    } else if (ws === receiverSocket) {
      receiverSocket = null;
      console.log("Receiver disconnected");
    }
  });
});
