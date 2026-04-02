import type { Card, GameState } from "../game_setup/types";
import { chooseUnoMove, countColors } from "../game_setup/utils";

//save wildcards for later, plays same color or number first
export const scoreCardConservative = (
  card: Card,
  hand: Card[],
  state: GameState
): number => {
  let score = 0;

  const counts = countColors(hand);
  const remainingSameColor = Math.max(counts[card.color] - 1, 0);
  const totalNonWild = counts.red + counts.yellow + counts.green + counts.blue;

  if (card.color === state.currentColor) score += 3;

  const isNumber = (
    ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as Card["value"][]
  ).includes(card.value);
  if (isNumber) score += 3;

  if (card.value === "skip" || card.value === "reverse") score += 2;
  if (card.value === "draw2") score += 3;

  if (card.value === "wild") score -= 2;
  if (card.value === "wild_draw4") score -= 4;

  if (state.nextPlayerCardCount <= 2) {
    if (card.value === "skip" || card.value === "reverse") score += 5;
    if (card.value === "draw2" || card.value === "wild_draw4") score += 7;
  }

  if (totalNonWild > 0) {
    const ratio = remainingSameColor / totalNonWild;
    score -= ratio * 3;
  }

  return score;
};

export const chooseUnoMoveConservative = (hand: Card[], state: GameState) =>
  chooseUnoMove(hand, state, scoreCardConservative);
