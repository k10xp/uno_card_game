import { Card } from "../game_setup/types";
import { WebSocket } from "ws";

export type PlayerRole = "player" | "spectator";

export class Player {
  id: string; //Unique ID (1-4 for players, spectator-<timestamp> for spectators)
  socket: WebSocket; //Player connection
  hand: Card[]; //Player cards
  role: PlayerRole; //Player/Spectator
  name: string = "Player";

  constructor(
    id: string,
    socket: WebSocket,
    hand: Card[],
    role: PlayerRole = "player",
    name: string = "Player"
  ) {
    this.id = id;
    this.socket = socket;
    this.hand = hand;
    this.role = role;
    this.name = name;
  }
}
