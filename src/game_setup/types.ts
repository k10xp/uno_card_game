//create type, still need define values in function
export type Color = "red" | "yellow" | "green" | "blue" | "wild";

export type Value =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "skip"
  | "reverse"
  | "draw2"
  | "wild"
  | "wild_draw4";

export interface Card {
  color: Color; // 'wild' for wild cards
  value: Value;
}

export interface GameState {
  discardTop: Card;
  currentColor: Color; // active color after wilds
  nextPlayerCardCount: number;
  playersCount: number;
  direction: 1 | -1; //1 = forward, -1 = reverse
}

export interface Move {
  type: "play" | "draw";
  card?: Card;
}

export type Strategy = (hand: Card[], state: GameState) => Move;
