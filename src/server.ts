import { WebSocketServer } from "ws";
import { createDeck, shuffled } from "./game_setup/deck";
import { Card } from "./game_setup/types";

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
wsServer.on("connection", (socket) => {
  console.log("Client connected");

  //Creating array of cards as hand
  //Taking first 5 as opening hand
  const hand: Card[] = deck.splice(0, 5);

  //Verifying that cards have been pulled from same deck
  console.log("Cards left in deck: ", deck.length);

  //Send initial hand to client
  socket.send(
    JSON.stringify({
      type: "HAND",
      cards: hand,
    })
  );
});
