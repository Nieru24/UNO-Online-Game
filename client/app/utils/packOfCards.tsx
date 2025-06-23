{
  /*
pack of 108 cards 
R = red
G = green
B = blue
Y = yellow
W = wild(change color)
skip = skip
_ = reverse
D2 = plus 2
D4W = plus 4 with change color
*/
}

type Color = "R" | "G" | "B" | "Y";
type Wild = "W"; // or 'BLACK'

interface CardRule {
  name: string;
  colors: Color[] | "wild"; // 'wild' for W, D4W, etc.
  countPerColor?: number; // how many copies per color
  countTotal?: number; // total for wilds
  double?: boolean; // for cards like 1-9 that appear twice
}

// Classic cards
const cardRules: CardRule[] = [
  { name: "NORM0", colors: ["R", "G", "B", "Y"], countPerColor: 1 },
  { name: "NORM1", colors: ["R", "G", "B", "Y"], countPerColor: 2 },
  { name: "NORM2", colors: ["R", "G", "B", "Y"], countPerColor: 2 },
  { name: "NORM3", colors: ["R", "G", "B", "Y"], countPerColor: 2 },
  { name: "NORM4", colors: ["R", "G", "B", "Y"], countPerColor: 2 },
  { name: "NORM5", colors: ["R", "G", "B", "Y"], countPerColor: 2 },
  { name: "NORM6", colors: ["R", "G", "B", "Y"], countPerColor: 2 },
  { name: "NORM7", colors: ["R", "G", "B", "Y"], countPerColor: 2 },
  { name: "NORM8", colors: ["R", "G", "B", "Y"], countPerColor: 2 },
  { name: "NORM9", colors: ["R", "G", "B", "Y"], countPerColor: 2 },
  { name: "SKIP_", colors: ["R", "G", "B", "Y"], countPerColor: 2 }, // skip cards
  { name: "REVS_", colors: ["R", "G", "B", "Y"], countPerColor: 2 }, // reverse card
  { name: "DRAW2", colors: ["R", "G", "B", "Y"], countPerColor: 2 },
  { name: "WILD_W", colors: "wild", countTotal: 4 },
  { name: "DRAW4W", colors: "wild", countTotal: 4 },

];

// Later
// function generateDeck(mode: "classic" | "custom" = "classic"): string[] {


export default function packOfCards(): string[] {
  const deck: string[] = [];

// Later for custom cards
// if (includeCustomCards) {
//     cardRules.push({ name: 'D6', colors: ['R', 'G', 'B', 'Y'], countPerColor: 1 });
//     cardRules.push({ name: 'swap', colors: 'wild', countTotal: 2 });
//   }

  for (const rule of cardRules) {
    if (rule.colors === "wild") {
      for (let i = 0; i < (rule.countTotal || 0); i++) {
        deck.push(rule.name);
      }
    } else {
      for (const color of rule.colors) {
        const count = rule.countPerColor || 1;
        for (let i = 0; i < count; i++) {
          deck.push(`${rule.name}${color}`);
        }
      }
    }
  }

  return deck;
}
