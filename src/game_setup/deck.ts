import type { Card, Color, Value } from "./types";

export function createDeck(): Card[] {
  const colors: Color[] = ["red", "green", "blue", "yellow"]; //define values
  const deck: Card[] = [];

  for (const color of colors) {
    deck.push({ color, value: "0" });

    for (let i = 1; i <= 9; i++) {
      const v = i.toString() as Value;
      deck.push({ color, value: v });
      deck.push({ color, value: v });
    }

    (["skip", "reverse", "draw2"] as Value[]).forEach((value) => {
      deck.push({ color, value });
      deck.push({ color, value });
    });
  }

  for (let i = 0; i < 4; i++) {
    deck.push({ color: "wild", value: "wild" });
    deck.push({ color: "wild", value: "wild_draw4" });
  }

  return deck;
}

//Fisher Yates shuffle
//<T> means this function works with any array type
export function shuffled<T>(array: T[]): T[] {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
