import type { Card, Color, GameState, Move } from "./types";

export function isPlayable(card: Card, state: GameState): boolean {
  const top = state.discardTop;
  if (card.value === "wild" || card.value === "wild_draw4") return true;
  return (
    card.color === state.currentColor ||
    card.value === top.value ||
    card.color === top.color
  );
}

export function countColors(hand: Card[]): Record<Color, number> {
  const counts: Record<Color, number> = {
    red: 0,
    yellow: 0,
    green: 0,
    blue: 0,
    wild: 0,
  };
  for (const c of hand) {
    if (c.color !== "wild") counts[c.color]++;
    else counts.wild++;
  }
  return counts;
}

export function chooseBestColor(hand: Card[]): Color {
  const counts = countColors(hand);
  const colors: Color[] = ["red", "yellow", "green", "blue"];
  let best: Color = "red";
  let bestCount = -1;
  for (const c of colors) {
    if (counts[c] > bestCount) {
      best = c;
      bestCount = counts[c];
    }
  }
  return best;
}

export function findBestPlayable(
  hand: Card[],
  scoreFn: (c: Card, hand: Card[], state: GameState) => number,
  state: GameState
): Card | null {
  const playable = hand.filter((c) => isPlayable(c, state));
  if (playable.length === 0) return null;

  let best: Card | null = null;
  let bestScore = -Infinity;

  for (const card of playable) {
    const s = scoreFn(card, hand, state);
    if (s > bestScore) {
      bestScore = s;
      best = card;
    }
  }
  return best;
}

export const chooseUnoMove = (
  hand: Card[],
  state: GameState,
  scoreFn: (c: Card, hand: Card[], state: GameState) => number
): Move => {
  const best = findBestPlayable(hand, scoreFn, state);
  if (!best) return { type: "draw" };
  return { type: "play", card: best };
};
