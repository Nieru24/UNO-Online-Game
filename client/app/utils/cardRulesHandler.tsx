type CardRuleResult = {
    code?: string;
    message: string;
    requiresColor?: boolean;
    type?: string;
    color?: string;
    number?: string;
};

export default function cardRulesHandler(
    code: string,
    currentType: string,
    currentColor: string,
    currentNumber: string,
    drawCardPlayed: boolean 
): CardRuleResult {
    const color = code.slice(-1);
    const number = code.slice(-2, -1);
    const type = code.slice(0, -2);

    switch (true) {
        case (drawCardPlayed === false) && ((type === "NORM" && currentType === "NORM" && color === currentColor) || (type === "NORM" && currentType === "NORM" && number === currentNumber) || (type !== "DRAW" && color === currentColor && number !== "_")):
            return { code, message: "Normal Color Card Played", type, color, number };
        case (drawCardPlayed === false) && ((type === "SKIP" && currentType === "SKIP") || (color === currentColor && number == "_")):
            return { code, message: "Skip Card Played", type, color, number };
        case (drawCardPlayed === false) && ((type === "REVS" && currentType === "REVS") || (color === currentColor && number == "_")):
            return { code, message: "Reverse Card Played", type, color, number };
        case ((type === "DRAW" && currentType === "DRAW" && number === "2") || (type === "DRAW" && color === currentColor && number === "2")):
            return { code, message: "Draw 2 Card Played", type, color, number };
        case ((type === "DRAW" && number === "4" && color === "W")):
            return { code, message: "Draw 4 Card Played", requiresColor: true, type, color, number };
        case (drawCardPlayed === false) && (type === "WILD"):
            return { code, message: "Wild Card Played", requiresColor: true, type, color, number };
        default:
            return {
                message: `Unknown Card Played\nCurrent: ${currentType}, ${currentNumber}, ${currentColor}\nPlayed: ${type}, ${number}, ${color}`
            };
    }
}