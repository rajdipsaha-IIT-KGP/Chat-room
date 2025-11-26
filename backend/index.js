const express = require("express");
const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ port: 8080 });

let allSockets = []; // { socket, username, room }

wss.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("message", (msg) => {
    const parsedMsg = JSON.parse(msg);

    // --------------------------
    // JOIN ROOM
    // --------------------------
    if (parsedMsg.type === "join") {
      const { username } = parsedMsg;
      const { roomID } = parsedMsg.payload;

      allSockets.push({
        socket,
        username,
        room: roomID,
      });

      console.log(`${username} joined room: ${roomID}`);

      return;
    }

    // --------------------------
    // CHAT MESSAGE
    // --------------------------
    if (parsedMsg.type === "chat") {
      const sender = allSockets.find((u) => u.socket === socket);
      if (!sender) return;

      const room = sender.room;

      allSockets.forEach((user) => {
        if (user.room === room && user.username != sender.username) {
          user.socket.send(
            JSON.stringify({
              type: "message",
              from: sender.username,
              message: parsedMsg.payload.message,
            })
          );
        }
      });
    }
  });

  // --------------------------
  // USER DISCONNECT
  // --------------------------
  socket.on("close", () => {
    allSockets = allSockets.filter((u) => u.socket !== socket);
    console.log("User disconnected");
  });
});
