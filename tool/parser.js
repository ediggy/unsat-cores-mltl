/**
 * MLTL Parser (subset: !, &, |, F[i,j], G[i,j])
 * 
 * This parser converts a string like:
 *      "F[0,3](a | !b)"
 * into an abstract syntax tree (AST) like:
 *      ["F",0,3,["|","a", ["!","b"]]]
 * 
 * Design:
 * - Recursive descent parser
 * - Operators "&" and "|" have same precedence
 * - Evaluation is strictly left to right
 * - Negation is higher precidence than conjunction and disjunction
 * - Temporal operators "F" and "G" take an interval and a subformula
 */


function parseFormula(input) {
    let i = 0; // current position in the input string

    /** Look at the current character without consuming it */
    function peek() {
        return input[i];
    }

    /** Retrun the current character and advance one position */
    function consume() {
        return input[i++];
    }

    /** Skip over any white space */
    function skipSpaces() {
        while (/\s/.test(peek())) consume();
    }

    /**
     * Parse an "atom":
     * - A parenthesized espression: (...)
     * - A temporal operator: F[i,j](...) or G[i,j](...)
     * - A variable (single letter, like 'a', 'B')
     */
    function parseAtom() {
        skipSpaces();

        // Case 1: Parenthesized expression
        if (peek() === "(") {
            consume(); // consume "("
            const expr = parseExpr(); // recursively parse inside
            skipSpaces();
            
            if (consume() !== ")") {
                throw new Error("Missing closing parenthesis");
            }
            return expr; // return whatever was inside (already an AST)
        }

        // Case 2: Temporal operators F[i,j] or G[i,j]
        if (peek() === "F" || peek() === "G") {
            const op = consume(); // save operator ("F" or "G")
            skipSpaces();

            // Expect interval: [low,high]
            if (consume() !== "[") throw new Error(`Expected [ after ${op}`);
            
            // Collect characters until "]"
            let numStr = "";
            while (peek() !== "]") {
                numStr += consume();
                if (i >= input.length) throw new Error("Unclosed interval");
            }
            consume(); // consume "]"

            // Split on comma, turn into numbers
            const [low, high] = numStr.split(",").map(Number);

            // Recursively parse the subformula after interval (can be another temporal op, parens, or atom)
            const sub = parseAtom();

            // Return AST: e.g. ["F",0,3,subformula]
            return [op, low, high, sub];
        }

        // Case 3: Atomic variable (single letter)
        if (/[A-Za-z]/.test(peek())) {
            return consume();
        }

        // If we reach here, input was invalid
        throw new Error("Unexpected character: " + peek());
    }

    /**
     * Parse negation("!")
     * - If we see a "!", build ["!",subformula]
     * - Otherwise, parse as a atom 
     */
    function parseNot() {
        skipSpaces();

        if (peek() === "!") {
            consume();
            return ["!", parseNot()]; // chain negations if needed
        }

        return parseAtom();
    }

    /**
    * Parse left-to-right binary operators (& and |).
    * 
    * Example: "a & b | c"
    * - Force left to right parsing when no parentheses clarify
    * - result: ((a & b) | c)
    */
    function parseExpr() {
        let left = parseNot(); // start with something (possibly negated)
        skipSpaces();

        // Keep extending tree while there are more binary operators
        while (peek() === "&" || peek() === "|") {
            const op = consume(); // either & or |
            const right = parseNot();
            left = [op, left, right]; // build new subtree
            skipSpaces();
        }

        return left;
    }

    /** Entry point: parse an expression, then check for leftover input */
    const result = parseExpr();
    skipSpaces();
    
    if (i < input.length) {
        throw new Error("Unexpected extra input: " + input.slice(i));
    }

    return result; // abstract syntax tree
}

module.exports = { parseFormula }

// console.log(parseFormula("F[0,5](G[0,5]a)"));
// // ["F", 0, 5, ["G", 0, 5, "a"]]

// console.log(parseFormula("G[1,3](a & !b) | c"));
// // ["|", ["G", 1, 3, ["&", "a", ["!", "b"]]], "c"]

// console.log(parseFormula("!(F[0,2]A) & B"));