import type { Card } from "@/types/card.ts";

//replace text with images here
export function getCardAsset(card: Card): string {
  // For now: text fallback
  return `${card.color}-${card.value}`;

  // When we have real card images replace the above with:
  // return new URL(
  // `../assets/cards/${card.color}_${card.value}.png`,
  // import.meta.url
  // ).href;
}