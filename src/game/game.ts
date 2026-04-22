import { WebSocket } from "ws";
import { Player, PlayerRole } from "../game_setup/player";
import { createDeck, shuffled } from "../game_setup/deck";
import { Card, Color } from "../game_setup/types";

export class Game {
  private players: Player[] = []; //All connected players (players and spectators)
  private deck: Card[] = []; //Draw pile
  private discardPile: Card[] = []; //Played cards pile
  private currentPlayerIndex = 0; //Index in currentGamePlayers
  private direction: 1 | -1 = 1; //1 = Clockwise, -1 = the otherway
  private currentColor: Color = "red"; //Current playable color
  private started = false; //Is game in progress
  private inGameOver: Set<string> = new Set(); //Tracks players who finished the game
  private currentGamePlayers: Player[] = []; //Active players for current round
  private pendingWild: { playerId: string; card: Card } | null = null; //Holds a temporaru state when a wild card is played

  // -----------------------
  // Player Management
  // -----------------------
  addPlayer(socket: WebSocket): Player {
    // Remove disconnected players
    this.players = this.players.filter(
      (p) => p.socket.readyState === WebSocket.OPEN
    );

    // Assign an ID for new player
    const id = this.getNextPlayerId();

    let role: PlayerRole = "spectator";
    if (id) {
      // Up to 4 players can be active else assign spectator
      role =
        this.players.filter((p) => p.role === "player").length < 4
          ? "player"
          : "spectator";
    }

    const playerId = id ?? `spectator-${Date.now()}`;
    const newPlayer = new Player(playerId, socket, [], role);
    this.players.push(newPlayer);

    this.sendLobbyState();
    return newPlayer;
  }

  removePlayerBySocket(socket: WebSocket) {
    this.players = this.players.filter((p) => p.socket !== socket);
    this.sendLobbyState();
  }

  private getNextPlayerId(): string | undefined {
    //Assigns first available number ID 1-4
    for (let i = 1; i <= 4; i++) {
      if (!this.players.find((p) => p.id === i.toString())) return i.toString();
    }
    return undefined;
  }

  // -----------------------
  // Game Start / Reset
  // -----------------------
  start() {
    if (this.started) return;

    //Select only active players (ignore spectators, disconnected players)
    this.currentGamePlayers = this.players.filter(
      (p) =>
        p.role === "player" &&
        !this.inGameOver.has(p.id) &&
        p.socket.readyState === WebSocket.OPEN
    );

    //Need atleast 2 players to start
    if (this.currentGamePlayers.length < 2) {
      this.sendLobbyState();
      return;
    }

    this.resetGame();

    this.started = true;
    this.deck = shuffled(createDeck());
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.direction = 1;

    // Deal 7 cards to each active player
    for (const player of this.currentGamePlayers) {
      player.hand = this.deck.splice(0, 7);
    }

    //First card on discard pile, any card except wild cards
    let firstCard: Card | undefined;
    while (this.deck.length > 0) {
      const card = this.deck.pop();
      if (!card) break;
      // Accept only non-wild cards
      if (card.color !== "wild") {
        firstCard = card;
        break;
      }
      // Put wild cards back into the deck
      this.deck.unshift(card);
    }
    if (!firstCard) return;
    this.discardPile = [firstCard];
    this.currentColor = firstCard.color;

    // Ensure spectators never have cards
    for (const player of this.players) {
      if (player.role === "spectator") player.hand = [];
    }

    this.sendGameState(); //Send initial state to all clients
  }

  // -----------------------
  // Game Actions
  // -----------------------
  playCard(playerId: string, card: Card) {
    //Safe guard reventing actions if wild card is in progress
    if (this.pendingWild) return;

    const player = this.players.find((p) => p.id === playerId);
    if (!player || !this.currentGamePlayers.includes(player)) return;

    if (!this.isPlayersTurn(playerId)) return; //Not players turn
    if (!this.isValidMove(card)) return; //Invalid card

    const index = player.hand.findIndex(
      (c) => c.color === card.color && c.value === card.value
    );
    if (index === -1) return; //Card not in hand

    player.hand.splice(index, 1); //Remove played card
    this.discardPile.push(card);

    // Handle special cards (non-wild)
    if (card.color !== "wild") {
      switch (card.value) {
        case "skip":
          this.handleSkip();
          break;

        case "reverse":
          this.handleReverse();
          break;

        case "draw2":
          this.applyDrawPenalty(2);
          break;
      }
    }

    //If wild is played wait for color choise
    if (card.color === "wild") {
      //Store who played the wild card and which card it was
      this.pendingWild = { playerId, card };
      //Notify all clients that this player is choosing color
      this.broadcast({
        type: "CHOOSE_COLOR",
        playerId,
      });

      return; // STOP here until color is chosen
    }

    //Check if game over
    if (player.hand.length === 0) {
      this.endGame(player.id);
      return;
    }

    //Normal cards advance turn here, wild and special is handled further down
    if (card.value !== "skip" && card.value !== "draw2") {
      this.nextTurn();
    }
    this.sendGameState(); //Broadcast updated state
  }

  drawCard(playerId: string) {
    //Safe guard reventing actions if wild card is in progress
    if (this.pendingWild) return;

    const player = this.players.find((p) => p.id === playerId);
    if (!player || !this.currentGamePlayers.includes(player)) return;
    if (!this.isPlayersTurn(playerId)) return;

    const card = this.deck.pop();
    if (!card) return; //TODO: handle empty deck, as in resuffle

    player.hand.push(card);
    this.nextTurn();
    this.sendGameState();
  }

  //When wild card is played
  chooseColor(playerId: string, color: Color) {
    //No pending wild return
    if (!this.pendingWild) return;
    //Player who played wild card can choose color
    if (this.pendingWild.playerId !== playerId) return;

    const { card } = this.pendingWild;
    //Set the active color for the game
    this.currentColor = color;
    // Handle special wild effects
    if (card.value === "wild_draw4") {
      this.applyDrawPenalty(4);
    }
    //Clear pending state, game can proceed
    this.pendingWild = null;
    //Move to next player after resolving wild card
    this.nextTurn();
    //Send uppdated state for all players
    this.sendGameState();
  }

  // -----------------------
  // Game Helpers
  // -----------------------

  //Skip next player turn
  private handleSkip() {
    this.nextTurn(); // move to skipped player
    this.nextTurn(); // skip them
  }

  //Change direction
  private handleReverse() {
    this.direction *= -1;
    //If two players, skipping next players turn
    if (this.currentGamePlayers.length === 2) {
      this.nextTurn();
    }
  }

  //Count must be an integer
  private applyDrawPenalty(count: number) {
    //Move to the next player who received penalty
    this.nextTurn();

    const target = this.currentGamePlayers[this.currentPlayerIndex];
    if (!target) return;
    //Draw "count" cards from deck
    for (let i = 0; i < count; i++) {
      const card = this.deck.pop();
      if (card) target.hand.push(card);
    }
    //Player who recieved extra cards will skip their turn
    this.nextTurn();
  }

  private isPlayersTurn(playerId: string) {
    //Returns true if it is players turn
    return this.currentGamePlayers[this.currentPlayerIndex]?.id === playerId;
  }

  private isValidMove(card: Card) {
    const top = this.discardPile[this.discardPile.length - 1];
    if (!top) return false;
    return (
      card.color === this.currentColor ||
      card.value === top.value ||
      card.color === "wild"
    );
  }

  private nextTurn() {
    if (this.currentGamePlayers.length === 0) return;

    //Handles clockwise and not clockwise
    this.currentPlayerIndex =
      (this.currentPlayerIndex +
        this.direction +
        this.currentGamePlayers.length) %
      this.currentGamePlayers.length;
  }

  private endGame(winnerId: string) {
    this.started = false;
    this.deck = [];
    this.discardPile = [];
    this.currentColor = "red";
    this.currentPlayerIndex = 0;
    this.direction = 1;

    //Clear hands of all current players and mark them as finished
    for (const p of this.currentGamePlayers) {
      p.hand = [];
      // Reset role and ID so they can rejoin as player
      p.role = "spectator";
      p.id = `spectator-${p.id}`; // prefix old id
    }

    this.broadcast({ type: "GAME_OVER", winner: winnerId });

    this.currentGamePlayers = [];
    this.sendLobbyState();
  }

  rejoinLobby(playerId: string) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    //Assign a player role if there's space
    if (player.role === "spectator") {
      const nextId = this.getNextPlayerId();
      if (nextId) {
        player.role = "player";
        player.id = nextId; // Give them a proper player ID
      }
    }

    this.sendLobbyState();
  }

  private resetGame() {
    //Reset state for new game
    this.deck = [];
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.direction = 1;
    this.currentColor = "red";
    this.started = false;
    this.pendingWild = null;

    for (const p of this.players) {
      p.hand = []; // Reset all hands
    }
  }

  // -----------------------
  // Communication
  // -----------------------
  private broadcast(data: any) {
    const message = JSON.stringify(data);
    for (const p of this.players) {
      if (p.socket.readyState === WebSocket.OPEN) p.socket.send(message);
    }
  }

  private sendLobbyState() {
    const activeCount = this.players.filter((p) => p.role === "player").length;
    this.broadcast({ type: "LOBBY", playerCount: activeCount });
  }

  private sendGameState() {
    const topCard = this.discardPile[this.discardPile.length - 1];
    const isPendingWild = this.pendingWild !== null;

    for (const player of this.players) {
      if (player.socket.readyState !== WebSocket.OPEN) continue;

      const isActive = this.currentGamePlayers.includes(player);

      const opponents = this.currentGamePlayers
        .filter((p) => p.id !== player.id)
        .map((p) => ({ id: p.id, cardCount: p.hand.length }));

      const isWildPlayer = this.pendingWild?.playerId === player.id;

      player.socket.send(
        JSON.stringify({
          type: "GAME_STATE",
          hand: isActive ? player.hand : [],
          opponents,
          topCard,
          currentColor: this.currentColor,
          yourTurn: isActive && this.isPlayersTurn(player.id),
          drawPileCount: this.deck.length,
          discardPileCount: this.discardPile.length,

          isWaitingForColor: isPendingWild && !isWildPlayer,
          mustChooseColor: isWildPlayer,
          yourId: player.id,
        })
      );
    }
  }

  // -----------------------
  // Force Win (Admin / Debug)
  // -----------------------
  forceWin(playerId: string) {
    const winner = this.players.find((p) => p.id === playerId);
    if (!winner || !this.currentGamePlayers.includes(winner)) return;
    this.endGame(winner.id);
  }
}
