import { WebSocket } from "ws";
import { Player } from "../game_setup/player";
import { createDeck, shuffled } from "../game_setup/deck";
import { Card, Color } from "../game_setup/types";

//Manages the full game state and rules for a UNO-like game
export class Game {
  private players: Player[] = [];
  private deck: Card[] = [];
  private discardPile: Card[] = [];

  private currentPlayerIndex = 0;
  private direction: 1 | -1 = 1;
  private currentColor: Color = "red";

  private started = false;

  //Player Management
  //Adds a new player if there is room (max 4 players)
  //Assigns the lowest available numeric ID as a string
  addPlayer(socket: WebSocket): Player | null {
    const id = this.getNextPlayerId();

    if (!id) {
      socket.send(JSON.stringify({ type: "ERROR", message: "Game full" }));
      socket.close();
      return null;
    }

    const player = new Player(id, socket, []);
    this.players.push(player);

    this.sendLobbyState();
    return player;
  }

  //Removes a player by ID and updates lobby state
  removePlayer(id: string) {
    const index = this.players.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.players.splice(index, 1);
      this.sendLobbyState();
    }
  }

  //Returns the next available player ID ("1"–"4")
  private getNextPlayerId(): string | undefined {
    for (let i = 1; i <= 4; i++) {
      if (!this.players.find((p) => p.id === i.toString())) {
        return i.toString();
      }
    }
    return undefined;
  }

  //Game Start
  //Game can start if there are minimum 2 players, this could be changed later on
  start() {
    if (this.started || this.players.length < 2) return;

    this.started = true;
    this.deck = shuffled(createDeck());

    //Deal cards
    for (const player of this.players) {
      player.hand = this.deck.splice(0, 7);
    }

    //Initialize discard pile
    //TODO handle special cards
    const firstCard = this.deck.pop()!;
    this.discardPile = [firstCard];
    this.currentColor = firstCard.color;

    this.currentPlayerIndex = 0;
    this.direction = 1;

    this.sendGameState();
  }

  //Game Actions
  playCard(playerId: string, card: Card) {
    //Validation
    const player = this.players.find((p) => p.id === playerId);
    //Check if player exist
    if (!player) return;
    //Check if its players turn
    if (!this.isPlayersTurn(playerId)) return;
    //Check if the play is valid
    if (!this.isValidMove(card)) return;

    //Find matching card in player hand
    const index = player.hand.findIndex(
      (c) => c.color === card.color && c.value === card.value
    );

    if (index === -1) return;

    // Remove card from hand
    player.hand.splice(index, 1);

    // Add card to discard
    this.discardPile.push(card);

    // Update color
    if (card.color !== "wild") {
      this.currentColor = card.color;
    }

    // Win condition player has no card left in hand
    if (player.hand.length === 0) {
      this.broadcast({
        type: "GAME_OVER",
        winner: player.id,
      });
      this.started = false;
      return;
    }

    this.nextTurn();
    this.sendGameState();
  }

  //Draw one card from deck and end player turn
  drawCard(playerId: string) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    if (!this.isPlayersTurn(playerId)) return;

    const card = this.deck.pop();
    if (!card) return;

    player.hand.push(card);

    this.nextTurn();
    this.sendGameState();
  }

  //Helpers
  //Check if its players turn
  private isPlayersTurn(playerId: string): boolean {
    return this.players[this.currentPlayerIndex]?.id === playerId;
  }

  //Check card play is valid
  private isValidMove(card: Card): boolean {
    const top = this.discardPile[this.discardPile.length - 1];

    return (
      card.color === this.currentColor ||
      card.value === top.value ||
      card.color === "wild"
    );
  }

  //Advances one turn, direction can be either 1(clockwise) or -1(counterclokWise)
  private nextTurn() {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + this.direction + this.players.length) %
      this.players.length;
  }

  //Communication
  //Lobbystate for players before game start
  private sendLobbyState() {
    const data = {
      type: "LOBBY",
      playerCount: this.players.length,
    };

    this.broadcast(data);
  }

  //Send each player their personalized game state
  //Each player hand, opponents card count, top discard card (value/color) and if its their turn
  //Added drawPileCount and discardPileCount
  private sendGameState() {
    const topCard = this.discardPile[this.discardPile.length - 1];

    for (const player of this.players) {
      const opponents = this.players
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
          topCard,
          currentColor: this.currentColor,
          yourTurn: this.isPlayersTurn(player.id),
          drawPileCount: this.deck.length,
          discardPileCount: this.discardPile.length,
        })
      );
    }
  }

  //Send message to all connected players
  private broadcast(data: any) {
    for (const p of this.players) {
      p.socket.send(JSON.stringify(data));
    }
  }
}
