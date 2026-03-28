import type { Card, GameState, Move } from "../game_setup/types";
import { isPlayable } from "../game_setup/utils";

export type CheaterStrategy = (
  aiHand: Card[],
  state: GameState,
  opponentHandCounts: number[]
) => Move;

//cheating AI
//aggressively targets player with lowest card count to deal maximum damage
export const scoreCardCheater = (
  card: Card,
  aiHand: Card[],
  state: GameState,
  opponentHandCounts: number[]
): number => {
  let score = 0;

  const minOpponent = opponentHandCounts.length
    ? Math.min(...opponentHandCounts)
    : Infinity;

  const playableSameColor =
    card.color === state.currentColor || card.color === state.discardTop.color;
  const isAction =
    card.value === "skip" ||
    card.value === "reverse" ||
    card.value === "draw2" ||
    card.value === "wild" ||
    card.value === "wild_draw4";

  if (card.color === state.currentColor) score += 2;
  if (card.value === state.discardTop.value) score += 2;

  if (card.value === "skip" || card.value === "reverse") score += 6;
  if (card.value === "draw2") score += 8;
  if (card.value === "wild") score += 5;
  if (card.value === "wild_draw4") score += 10;

  if (minOpponent <= 2) {
    if (card.value === "skip" || card.value === "reverse") score += 4;
    if (card.value === "draw2") score += 5;
    if (card.value === "wild_draw4") score += 6;
  }

  if (minOpponent === 1) {
    if (card.value === "skip" || card.value === "draw2") score += 6;
    if (card.value === "wild_draw4") score += 8;
  }

  if (card.value === "wild" || card.value === "wild_draw4") {
    const counts = countColorsExcludingWilds(aiHand);
    const bestColor = chooseBestColorFromCounts(counts);
    if (bestColor === state.currentColor) score += 1;
  }

  if (!playableSameColor && isAction) score += 1;

  return score;
};

function countColorsExcludingWilds(hand: Card[]) {
  return {
    red: hand.filter((c) => c.color === "red").length,
    yellow: hand.filter((c) => c.color === "yellow").length,
    green: hand.filter((c) => c.color === "green").length,
    blue: hand.filter((c) => c.color === "blue").length,
  };
}

function chooseBestColorFromCounts(counts: {
  red: number;
  yellow: number;
  green: number;
  blue: number;
}): "red" | "yellow" | "green" | "blue" {
  let best: "red" | "yellow" | "green" | "blue" = "red";
  let bestCount = -1;

  for (const color of ["red", "yellow", "green", "blue"] as const) {
    if (counts[color] > bestCount) {
      best = color;
      bestCount = counts[color];
    }
  }

  return best;
}

export const chooseUnoMoveCheater = (
  hand: Card[],
  state: GameState,
  opponentHandCounts: number[]
): Move => {
  const playable = hand.filter((c) => isPlayable(c, state));
  if (playable.length === 0) return { type: "draw" };

  let best: Card | null = null;
  let bestScore = -Infinity;

  for (const card of playable) {
    const score = scoreCardCheater(card, hand, state, opponentHandCounts);
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }

  return best ? { type: "play", card: best } : { type: "draw" };
};
