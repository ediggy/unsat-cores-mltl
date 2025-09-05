/**
 * Import our MLTL formula parser
 * This takes a "human readable" string like "F[0,1](a&b)"
 * and turns it into a structured abstract syntax tree (AST)
 */
const { parseFormula } = require("./parser.js")

/**
 * Import the Z3 solver (via z3-solver npm package)
 */
const { init } = require("z3-solver");


/**
 * Check satisfiability of one or more MLTL formulas using z3
 * 
 * @async
 * @param {string[]} formulas - Array of MLTL formulas in "human readable" form (e.g. ["F[1,2](a&d)","G[0,2](b|c)"])
 * @returns {Promise<boolean>} - True if the formulas are jointly satisfiable, false if unsatisfiable.
 */
async function checkSat(formulas) {
    // Parse each formula into an AST
    // Example: "F[0,2](a)" -> ["F",0,2,"a"]
    const astFormulas = formulas.map(parseFormula);

    // Initalize a new Z3 context and solver instance.
    const { Context } = await init();
    const ctx = new Context('main');
    const solver = new ctx.Solver();

    // Dictionary to store propositional variables at different timesteps.
    // Key: "a@0","a@1", etc.
    // Value: Corresponding Z3 boolean variable.
    const vars = {};

    /**
     * Recursively translate a parsed AST node into a Z3 expression
     * 
     * @param {Array|string} tree - AST node (string for variable, array for operators)
     * @param {number} [t=0] - Current time step for temporal expansion.
     * @returns 
     */
    function translate(tree, t=0) {
        if (typeof tree === 'string') {
          const key = `${tree}@${t}`;       // unique key per timestep
          if (!(key in vars)) vars[key] = ctx.Bool.const(key);
          return vars[key];
        }

        const [op, ...args] = tree;

        switch(op) {
          case '!': return ctx.Not(translate(args[0], t));
          case '&': return ctx.And(translate(args[0], t), translate(args[1], t));
          case '|': return ctx.Or(translate(args[0], t), translate(args[1], t));

          case "F": {
            const [low, high, sub] = args;
            let disj = translate(sub, low);
            for (let k = low+1; k <= high; k++) {
              disj = ctx.Or(disj, translate(sub, k));
            }
            return disj;
          }

          case "G": {
            const [low, high, sub] = args;
            let conj = translate(sub, low);
            for (let k = low+1; k <= high; k++) {
              conj = ctx.And(conj, translate(sub, k));
            }
            return conj;
          }

          default: throw new Error('Unknown op: ' + op);
        }
      }

    for (const tree of astFormulas) {
      solver.add(translate(tree))
    }

    const result = await solver.check();
    return result.toString() === "sat"; //true for sat, false for unsat
}

module.exports = { checkSat };

async function main(){

  result = await checkSat(["F[1,2](a)","G[0,1](b)"]);
  console.log(result)
}
main();

