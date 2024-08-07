"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
//createOffer
//createAnswer
wss.on("connection", (ws) => {
    ws.on("message", (data) => {
        const message = JSON.parse(data);
        if (message.type == "sender") {
            senderSocket = ws;
            console.log("sender set");
        }
        else if (message.type == "receiver") {
            receiverSocket = ws;
            console.log("receiver set");
        }
        else if (message.type == "createOffer") {
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: "createOffer", sdp: message.sdp }));
            console.log("offer created and sent to receiver");
        }
        else if (message.type == "createAnswer") {
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: "createAnswer", sdp: message.sdp }));
            console.log("answer created and sent to sender");
        }
        else if (message.type == "iceCandidate") {
            if (ws == senderSocket) {
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
                console.log("ice candidate sent to receiver");
            }
            else if (ws == receiverSocket) {
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
                console.log("ice candidate sent to sender");
            }
        }
    });
    ws.on("close", () => {
        if (ws === senderSocket) {
            senderSocket = null;
            console.log("Sender disconnected");
        }
        else if (ws === receiverSocket) {
            receiverSocket = null;
            console.log("Receiver disconnected");
        }
    });
});
