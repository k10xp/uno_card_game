import { Card } from "../game_setup/types";
import { WebSocket } from "ws";

export type PlayerRole = "player" | "spectator";

export class Player {
  id: string; //Unique ID (1-4 for players, spectator-<timestamp> for spectators)
  socket: WebSocket; //Player connection
  hand: Card[]; //Player cards
  role: PlayerRole; //Player/Spectator

  constructor(
    id: string,
    socket: WebSocket,
    hand: Card[],
    role: PlayerRole = "player"
  ) {
    this.id = id;
    this.socket = socket;
    this.hand = hand;
    this.role = role;
  }
}
