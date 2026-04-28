const verbs = [
  "Happy",
  "Wild",
  "Hungry",
  "Running",
  "Flying",
  "Jumping",
  "Sneaky",
  "Dancing",
  "Rolling",
];

const nouns = [
  "Astronaut",
  "Tiger",
  "Banana",
  "Ninja",
  "Penguin",
  "Robot",
  "Wizard",
];

export function generateName(): string {
  const v = verbs[Math.floor(Math.random() * verbs.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  return `${v}${n}`;
}
