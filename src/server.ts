import {WebSocketServer} from "ws";
import {createDeck, shuffled, Card} from "./deck";

const wsServer = new WebSocketServer({port: 3000});
console.log("WebSocket server running on ws://localhost:3000");

//Shared state, without this all users would have their own deck
const players: any[] = [];
const deck: Card[] = shuffled(createDeck());

//Listen for client connection
wsServer.on("connection", (socket) => {
    console.log("Client connected");

    //Creating array of cards as hand
    //Taking first 5 as opening hand
    const hand: Card[] = deck.splice(0, 5);

    //Verifying that cards have been pulled from same deck
    console.log("Cards left in deck: ", deck.length);

    //Send initial hand to client
    socket.send(JSON.stringify({
        type: "HAND",
        cards: hand
    }));
});