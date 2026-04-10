import { WebSocketServer } from "ws";
import { Game } from "./game/game";

const wsServer = new WebSocketServer({ port: 3000 });
const game = new Game();

wsServer.on("connection", (socket) => {
  const player = game.addPlayer(socket);
  if (!player) return;

  socket.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.type === "START_GAME") {
      game.start();
    }

    if (msg.type === "PLAY_CARD") {
      game.playCard(player.id, msg.card);
    }

    if (msg.type === "DRAW_CARD") {
      game.drawCard(player.id);
    }
  });

  socket.on("close", () => {
    game.removePlayer(player.id);
  });
});
