import type { Card, GameState, Move } from "../game_setup/types";
import { isPlayable } from "../game_setup/utils";

export type CheaterStrategy = (
  aiHand: Card[],
  state: GameState,
  opponentHandCounts: number[],
  opponentSeenCards?: Card[] //subset of cards AI can see from opponent's hand
) => Move;

//cheating AI
//aggressively targets player with lowest card count to deal maximum damage
export const scoreCardCheater = (
  card: Card,
  aiHand: Card[],
  state: GameState,
  opponentHandCounts: number[],
  opponentSeenCards?: Card[]
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

  //bonus when opponent is close to winning
  if (minOpponent <= 2) {
    if (card.value === "skip" || card.value === "reverse") score += 4;
    if (card.value === "draw2") score += 5;
    if (card.value === "wild_draw4") score += 6;
  }
  if (minOpponent === 1) {
    if (card.value === "skip" || card.value === "draw2") score += 6;
    if (card.value === "wild_draw4") score += 8;
  }

  //wildcard target color opponent weakest in
  if (card.value === "wild" || card.value === "wild_draw4") {
    const counts = countColorsExcludingWilds(aiHand);
    const bestColor = chooseBestColorFromCounts(counts);
    if (bestColor === state.currentColor) score += 1;

    //emphasize scarce color
    if (opponentSeenCards && opponentSeenCards.length > 0) {
      const colorProfile = { red: 0, yellow: 0, green: 0, blue: 0 };
      for (const c of opponentSeenCards) {
        if (c.color !== "wild") colorProfile[c.color]++;
      }
      const scarceColor = Object.entries(colorProfile).reduce(
        (a, b) => (a[1] < b[1] ? a : b),
        ["red", 100]
      )[0] as "red" | "yellow" | "green" | "blue";

      if (bestColor === scarceColor) {
        score += 2; //force them to play scarce color
      }
    }
  }

  //bonus for changing color
  if (!playableSameColor && isAction) score += 1;

  //attempt minimize opponent defensive cards
  if (opponentSeenCards && opponentSeenCards.length > 0) {
    const knownSkips = opponentSeenCards.filter((c) => c.value === "skip");
    const knownReverses = opponentSeenCards.filter(
      (c) => c.value === "reverse"
    );
    const knownWilds = opponentSeenCards.filter(
      (c) => c.value === "wild" || c.value === "wild_draw4"
    );
    const knownDraws = opponentSeenCards.filter((c) => c.value === "draw2");
    const defensiveCards =
      knownSkips.length + knownReverses.length + knownWilds.length;

    if (card.value === "skip" || card.value === "reverse") {
      if (defensiveCards === 0) score += 3; //can’t skip back
    }
    if (card.value === "draw2" || card.value === "wild_draw4") {
      if (knownDraws.length === 0) score += 4; //can’t stack
    }
  }

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
  aiHand: Card[],
  state: GameState,
  opponentHandCounts: number[],
  opponentSeenCards?: Card[]
): Move => {
  const playable = aiHand.filter((c) => isPlayable(c, state));
  if (playable.length === 0) return { type: "draw" };

  let best: Card | null = null;
  let bestScore = -Infinity;

  for (const card of playable) {
    const score = scoreCardCheater(
      card,
      aiHand,
      state,
      opponentHandCounts,
      opponentSeenCards
    );
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }

  return best ? { type: "play", card: best } : { type: "draw" };
};
