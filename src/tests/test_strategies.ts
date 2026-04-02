import { createDeck, shuffled } from "../game_setup/deck";
import type { Card, GameState } from "../game_setup/types";
import { drawCards, handToString, moveToString } from "./test_logic";

import { chooseUnoMoveAggressive } from "../strategies/aggressive";
import { chooseUnoMoveConservative } from "../strategies/conservative";
import { chooseUnoMoveCheater } from "../strategies/cheater";

//2 players: handA vs handB
function main() {
  const trials = 10;

  for (let t = 0; t < trials; t++) {
    const deck = shuffled(createDeck());

    const { hand: handA, rest: restAfterA } = drawCards(deck, 7);
    const { hand: handB, rest } = drawCards(restAfterA, 7);

    if (rest.length === 0) continue;

    const state: GameState = {
      discardTop: rest[0],
      currentColor: rest[0].color,
      nextPlayerCardCount: handB.length, //handB is opponent
      playersCount: 2,
      direction: 1,
    };

    //handB is handA opponent and vice versa
    const opponentHandCountsA = [handB.length];
    const opponentHandCountsB = [handA.length];

    //cheater sees full opponent hand
    //TODO: each cheater sees subset of opponent hand
    const seenCardsA: Card[] = handB;
    const seenCardsB: Card[] = handA;

    //simulation start
    const aggressiveA = chooseUnoMoveAggressive(handA, state);
    const conservativeA = chooseUnoMoveConservative(handA, state);
    const cheaterA = chooseUnoMoveCheater(
      handA,
      state,
      opponentHandCountsA,
      seenCardsA
    );

    const aggressiveB = chooseUnoMoveAggressive(handB, state);
    const conservativeB = chooseUnoMoveConservative(handB, state);
    const cheaterB = chooseUnoMoveCheater(
      handB,
      state,
      opponentHandCountsB,
      seenCardsB
    );

    console.log(`\nTrial ${t + 1}`);
    console.log("Hand A (player A):", handToString(handA));
    console.log("Hand B (player B/opponent):", handToString(handB));
    console.log(
      "Discard top:",
      `${state.discardTop.color} ${state.discardTop.value}`
    );
    console.log("Current color:", state.currentColor);
    console.log("A opponent count =", opponentHandCountsA[0]);
    console.log("B opponent count =", opponentHandCountsB[0]);

    //cards cheater sees aka makes decision off of
    //NOTE: not needed when cheater sees entire hand
    // console.log(
    //   "A cheater sees:",
    //   seenCardsA.length > 0 ? handToString(seenCardsA) : "(none)"
    // );
    // console.log(
    //   "B cheater sees:",
    //   seenCardsB.length > 0 ? handToString(seenCardsB) : "(none)"
    // );

    console.log(
      "A (Agg/Cons/Cheat):",
      `${moveToString(aggressiveA)} | ${moveToString(conservativeA)} | ${moveToString(cheaterA)}`
    );
    console.log(
      "B (Agg/Cons/Cheat):",
      `${moveToString(aggressiveB)} | ${moveToString(conservativeB)} | ${moveToString(cheaterB)}`
    );
  }
}

main();
