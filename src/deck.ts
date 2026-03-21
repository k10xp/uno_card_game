//Defining the type of a card
export type Card = {
  color: "red" | "green" | "blue" | "yellow" | "wild";
  value: string;
};

export function createDeck(): Card[] {
  const colors = ["red", "green", "blue", "yellow"] as const;
  const deck: Card[] = []; //Deck is a array of Card objects

  //Colored cards
  for (const color of colors) {
    //One 0 per color
    deck.push({ color, value: "0" });

    //Two of each 1-9
    for (let i = 1; i <= 9; i++) {
      deck.push({ color, value: i.toString() });
      deck.push({ color, value: i.toString() });
    }

    //Two of each text cards
    ["skip", "reverse", "draw two"].forEach((value) => {
      deck.push({ color, value });
      deck.push({ color, value });
    });
  }

  //Wild cards
  for (let i = 0; i < 4; i++) {
    deck.push({ color: "wild", value: "wild" });
    deck.push({ color: "wild", value: "wild draw four" });
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
