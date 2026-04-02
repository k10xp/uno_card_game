import { WebSocketServer, WebSocket } from "ws";
import { createDeck, shuffled, Card } from "./deck";
import { Player } from "./player";

const wsServer = new WebSocketServer({ port: 3000 });
console.log("WebSocket server running on ws://localhost:3000");

const players: Player[] = [];
let deck: Card[] = [];
let gameStarted = false;

//Lobby before game starts
function sendLobbyState() {
    const info = {
        type: "LOBBY",
        playerCount: players.length
    };

    for (const p of players) {
        p.socket.send(JSON.stringify(info));
    }
}

//Game
function startGame() {
    if (gameStarted){
        return;
    }
    gameStarted = true;
    deck = shuffled(createDeck());

    for (const player of players) {
        player.hand = deck.splice(0, 7);
    }

    sendGameState();
}

//Info to players
function sendGameState() {
  for (const player of players) {
    const opponents = players
      .filter((p) => p.id !== player.id)
      .map((p) => ({
        id: p.id,
        cardCount: p.hand.length,
      }));

    player.socket.send(
      JSON.stringify({
        type: "GAME_STATE",
        hand: player.hand,
        opponents,
      })
    );
  }
}

//Next player id, 1-4
function getNextPlayerId(){
    for(let i = 1; i <= 4; i++){
        if(!players.find(p => p.id === i.toString())){
            return i.toString();
        }
    }
    //If no free ids
    return undefined;
}

//Listen for client connection
wsServer.on("connection", (socket: WebSocket) => {
    // Assign a free ID first
    const id = getNextPlayerId();
    // No available IDs → reject connection gracefully
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

  //Player with empty hand
  const player = new Player(id, socket, []);
  players.push(player);
  console.log(`Player ${id} joined`);
  sendLobbyState();

  //Listen to messages from client in order to start game
  socket.on("message", (data) => {
        let msg;
        try {
            msg = JSON.parse(data.toString());
        } catch (err) {
            console.error("Invalid JSON from client:", err);
            return;
        }

        // Trigger startGame() if client sends START_GAME
        if (msg.type === "START_GAME") {
            console.log(`Player ${id} requested to start the game`);
            startGame();
        }
    });

  //Handling disconnected players
  socket.on("close", () => {
    const index = players.findIndex(p => p.id === id);
    if(index !== -1){
        console.log(`Player ${id} disconnected`);
        //Removing player from lobby
        players.splice(index, 1);
        //updating remaining players
        sendLobbyState();
    }
  })
});


