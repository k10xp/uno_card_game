import { WebSocketServer, WebSocket } from "ws";
import { createDeck, shuffled } from "./game_setup/deck";
import { Card } from "./game_setup/types";
import { Player } from "./game_setup/player";

const wsServer = new WebSocketServer({ port: 3000 });
console.log("WebSocket server running on port 3000");

const players: Player[] = [];
let deck: Card[] = [];
let gameStarted = false;

// ---- Lobby ----
function sendLobbyState() {
  const info = {
    type: "LOBBY",
    playerCount: players.length,
  };
  for (const p of players) {
    p.socket.send(JSON.stringify(info));
  }
}

// ---- Game logic ----
function startGame() {
  if (gameStarted) return;

  gameStarted = true;
  deck = shuffled(createDeck());

  for (const player of players) {
    player.hand = deck.splice(0, 7); // 7 cards like PR1
  }

  sendGameState();
}

function sendGameState() {
  for (const player of players) {
    const opponents = players
      .filter((p) => p.id !== player.id)
      .map((p) => ({ id: p.id, cardCount: p.hand.length }));

    player.socket.send(
      JSON.stringify({
        type: "GAME_STATE",
        hand: player.hand,
        opponents,
      })
    );
  }
}

function getNextPlayerId(): string | undefined {
  for (let i = 1; i <= 4; i++) {
    if (!players.find((p) => p.id === i.toString())) return i.toString();
  }
  return undefined;
}

// ---- WebSocket connections ----
wsServer.on("connection", (socket: WebSocket) => {
  const id = getNextPlayerId();

  if (!id) {
    console.log("A fifth player tried to join, rejecting connection");
    try {
      socket.send(JSON.stringify({ type: "ERROR", message: "Game full" }));
    } catch (err) {
      console.error("Failed to send error to client:", err);
    }
    socket.close(1000, "Game full");
    return;
  }

  const player = new Player(id, socket, []);
  players.push(player);
  console.log(`Player ${id} joined`);
  sendLobbyState();

  socket.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch (err) {
      console.error("Invalid JSON from client:", err);
      return;
    }

    if (msg.type === "START_GAME") {
      console.log(`Player ${id} requested to start the game`);
      startGame();
    }
  });

  socket.on("close", () => {
    const index = players.findIndex((p) => p.id === id);
    if (index !== -1) {
      console.log(`Player ${id} disconnected`);
      players.splice(index, 1);
      sendLobbyState();
    }
  });
});
