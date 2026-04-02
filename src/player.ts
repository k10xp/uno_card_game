import {Card} from "./deck";
import { WebSocket } from "ws";

export class Player {
    id: string;
    socket: WebSocket;
    hand: Card[];

    constructor(id: string, socket: WebSocket, hand: Card[]){
        this.id = id;
        this.socket = socket;
        this.hand = hand;
    }
}