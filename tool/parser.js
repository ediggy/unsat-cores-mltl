function parseFormula(input) {
    let i = 0; // current position in the input string

    function peek() {
        return input[i];
    }

    function consume() {
        return input[i++];
    }

    function skipSpaces() {
        while (/\s/.test(peek())) consume();
    }

    function parseAtom() {
        skipSpaces();

        if (peek() === "(") {
            consume(); // "("
            const expr = parseExpr();
            skipSpaces();
            if (consume() !== ")") throw new Error("Missing closing parenthesis");
            return expr;
        }

        // F, G as unary temporal operators
        if (peek() === "F" || peek() === "G") {
            const op = consume();
            skipSpaces();

            if (consume() !== "[") throw new Error(`Expected [ after ${op}`);
            let numStr = "";
            while (peek() !== "]") {
                numStr += consume();
                if (i >= input.length) throw new Error("Unclosed interval");
            }
            consume(); // "]"

            const [low, high] = numStr.split(",").map(Number);

            const sub = parseAtom();
            return [op, low, high, sub];
        }

        // Atomic variable
        if (/[A-Za-z]/.test(peek())) {
            return consume();
        }

        throw new Error("Unexpected character: " + peek());
    }

    function parseNot() {
        skipSpaces();
        if (peek() === "!") {
            consume();
            return ["!", parseNot()];
        }
        return parseAtom();
    }

    function parseExpr() {
        let left = parseNot();
        skipSpaces();

        while (peek() === "&" || peek() === "|" || peek() === "U" || peek() === "R") {
            const op = consume(); // &, |, U, or R

            if (op === "U" || op === "R") {
                skipSpaces();
                if (consume() !== "[") throw new Error(`Expected [ after ${op}`);
                let numStr = "";
                while (peek() !== "]") {
                    numStr += consume();
                    if (i >= input.length) throw new Error("Unclosed interval");
                }
                consume(); // "]"
                const [low, high] = numStr.split(",").map(Number);

                const right = parseNot(); // right-hand side subformula
                left = [op, low, high, left, right];
            } else {
                const right = parseNot();
                left = [op, left, right];
            }

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

module.exports = { parseFormula };

// console.log(parseFormula("(F[0,5]a) U[0,3] G[0,5](a|b)"));
// console.log(parseFormula("(F[0,5]a) U[0,3] G[0,5]a|b"));
// console.log(parseFormula("a & b | c"));
// console.log(parseFormula("(F[0,5]a) U[0,3] (G[0,5]a) R[4,3] (!b)"));

