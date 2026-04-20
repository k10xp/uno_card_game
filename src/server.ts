import { WebSocketServer } from "ws";
import { Game } from "./game/game";

const wsServer = new WebSocketServer({ port: 3000 });
const game = new Game();

wsServer.on("connection", (socket) => {
  // Add new player
  const player = game.addPlayer(socket);

  if (!player) {
    // This could happen if max 4 players reached; treat as spectator
    console.log("No available player slot, added as spectator");
    return;
  }

  socket.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      console.log("Invalid JSON received");
      return;
    }

    console.log("MESSAGE RECEIVED:", msg);

    if (msg.type === "START_GAME") {
      game.start();
    } else if (msg.type === "PLAY_CARD") {
      game.playCard(player.id, msg.card);
    } else if (msg.type === "DRAW_CARD") {
      game.drawCard(player.id);
    } else if (msg.type === "FORCE_WIN") {
      // Only for testing
      game.forceWin(player.id);
    } else if (msg.type === "REJOIN_LOBBY") {
      // Only allow rejoin if player exists
      game.rejoinLobby(player.id);
    } else if (msg.type === "CHOOSE_COLOR") {
      game.chooseColor(player.id, msg.color);
    } else {
      console.log("Unknown message type:", msg.type);
    }
  });

  socket.on("close", () => {
    console.log("Socket closed for player", player.id);
    game.removePlayerBySocket(socket);
  });
});

console.log("WebSocket server running on ws://localhost:3000");
