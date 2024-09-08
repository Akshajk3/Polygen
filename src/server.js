const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 5000;
const wss = new WebSocket.WebSocketServer({ noServer: true});

app.use(bodyParser.json());

let sockets = [];

wss.on("connection", (ws) => {
    console.log("Client connected via WebSocket");
    sockets.push(ws);

    ws.on("close", () => {
        sockets = sockets.filter((socket) => socket !== ws);
        console.log("Client disconnected");
    });
});

app.post("/webhook", (req, res) => {
    const { user_id, model_ready, model_url } = req.body;

    sockets.forEach((socket) => {
        socket.send(JSON.stringify({ user_id, model_ready, model_url }));
    });

    console.log("Webhook received: ", req.body);
    res.status(200).send("Webhook received");
});

const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    });
});