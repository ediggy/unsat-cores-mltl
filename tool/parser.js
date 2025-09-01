/**
 * Parser where & and | have the same precedence
 * and are evaluated strictly left-to-right.
 */
function parseFormula(input) {
    let i = 0;

    function peek() {
        return input[i];
    }

    function consume() {
        return input[i++];
    }

    function skipSpaces() {
        while (/\s/.test(peek())) consume();
    }

    // Parse variable or parenthesized expression
    function parseAtom() {
        skipSpaces();

        if (peek() === "(") {
            consume(); // "("
            const expr = parseExpr();
            skipSpaces();
            
            if (consume() !== ")") {
                throw new Error("Missing closing parenthesis");
            }
            return expr;
        }

        if (/[A-Za-z]/.test(peek())) {
            return consume();
        }

        throw new Error("Unexpected character: " + peek());
    }

    // Handle negation
    function parseNot() {
        skipSpaces();

        if (peek() === "!") {
            consume();
            return ["!", parseNot()];
        }

        return parseAtom();
    }

    /**
    * Parse left-to-right operators (& and |).
    */
    function parseExpr() {
        let left = parseNot();
        skipSpaces();

        while (peek() === "&" || peek() === "|") {
            const op = consume(); // either & or |
            const right = parseNot();
            left = [op, left, right]; // build tree left-to-right
            skipSpaces();
        }

        return left;
    }

    const result = parseExpr();
    skipSpaces();
    
    if (i < input.length) {
        throw new Error("Unexpected extra input: " + input.slice(i));
    }

    return result;
}

module.exports = { parseFormula }


// console.log(parseFormula("A | B & C"));
// // ["&", ["|", "A", "B"], "C"]

// console.log(parseFormula("A & B | C & D"));
// // ["&", ["|", ["&", "A", "B"], "C"], "D"]

// console.log(parseFormula("!(A | B) & C"));
// // ["&", ["!", ["|", "A", "B"]], "C"]