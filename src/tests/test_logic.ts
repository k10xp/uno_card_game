import type { Card, Move } from "../game_setup/types";

export function drawCards(
  deck: Card[],
  count: number
): { hand: Card[]; rest: Card[] } {
  return {
    hand: deck.slice(0, count),
    rest: deck.slice(count),
  };
}

export function moveToString(move: Move): string {
  if (move.type === "draw" || !move.card) return "draw";
  return `${move.card.color} ${move.card.value}`;
}

export function handToString(hand: Card[]): string {
  return hand.map((c) => `${c.color} ${c.value}`).join(", ");
}
