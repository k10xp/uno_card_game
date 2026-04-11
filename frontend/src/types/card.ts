export type CardColor = "red" | "blue" | "green" | "yellow" | "wild";

export interface Card {
  color: CardColor;
  value: string;
}