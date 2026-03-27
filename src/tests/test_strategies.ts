import { createDeck, shuffled } from "../game_setup/deck";
import { Card, GameState, Move } from "../game_setup/types";

//separate strategies
import { chooseUnoMoveAggressive } from "../strategies/aggressive";
import { chooseUnoMoveConservative } from "../strategies/conservative";

//TODO: move into game_setup/deck.ts
function drawCards(
  deck: Card[],
  count: number
): { hand: Card[]; rest: Card[] } {
  return {
    hand: deck.slice(0, count),
    rest: deck.slice(count),
  };
}

//TODO: simulate many times, store results in file
function main() {
  const deck = shuffled(createDeck());
  const { hand, rest } = drawCards(deck, 7);

  //minimal game state
  const state: GameState = {
    discardTop: rest[0], //pretend current active card is next card in deck
    currentColor: rest[0].color,
    nextPlayerCardCount: 3, //placeholder
    playersCount: 4, //placeholder
    //TODO: setup so 1 = forward, -1 = reverse
    direction: 1,
  };

  console.log("Hand:");
  hand.forEach((c, i) => {
    //i+1 to handle index vs count
    console.log(`${i + 1}: ${c.color} ${c.value}`);
  });

  console.log("Discard top:", state.discardTop.color, state.discardTop.value);
  console.log("Current color:", state.currentColor, "\n");

  //aggressive AI choice
  const agroMove: Move = chooseUnoMoveAggressive(hand, state);
  if (agroMove.type === "draw" || !agroMove.card) {
    console.log("AI chooses to draw a card.\n");
  } else {
    console.log(
      "Agressive strategy plays:",
      agroMove.card.color,
      agroMove.card.value,
      "\n"
    );
  }

  //conservative AI choice
  const consMove: Move = chooseUnoMoveConservative(hand, state);
  if (consMove.type === "draw" || !consMove.card) {
    console.log("AI chooses to draw a card.\n");
  } else {
    console.log(
      "Conservative strategy plays:",
      consMove.card.color,
      consMove.card.value,
      "\n"
    );
  }
}

main();
