import type { Card, GameState } from "../game_setup/types";
import { chooseUnoMove } from "../game_setup/utils";

//play wildcards whenever possible
//hand intentionally unused in scoreCardAggressive
//used in chooseUnoMoveAggressive
export const scoreCardAggressive = (
  card: Card,
  _hand: Card[],
  state: GameState
): number => {
  //scores arbitrary, change if needed
  let score = 0;

  if (card.color === state.currentColor) score += 2;

  if (card.value === "skip" || card.value === "reverse") score += 6;
  if (card.value === "draw2") score += 7;
  if (card.value === "wild") score += 5;
  if (card.value === "wild_draw4") score += 9;

  if (state.nextPlayerCardCount <= 2) {
    if (card.value === "skip" || card.value === "reverse") score += 3;
    if (card.value === "draw2" || card.value === "wild_draw4") score += 4;
  }

  if (["draw2", "reverse", "skip"].includes(card.value)) score += 2;
  if (["wild", "wild_draw4"].includes(card.value)) score += 3;

  return score;
};

export const chooseUnoMoveAggressive = (hand: Card[], state: GameState) =>
  chooseUnoMove(hand, state, scoreCardAggressive);
