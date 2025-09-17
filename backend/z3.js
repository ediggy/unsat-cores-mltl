/**
 * Import our MLTL formula parser
 * This takes a "human readable" string like "F[0,1](a&b)"
 * and turns it into a structured abstract syntax node (AST)
 */
import { parseFormula } from "./parser.js";


/**
 * Import the Z3 solver (via z3-solver npm package)
 */
import { init } from "z3-solver";




/**
 * Check satisfiability of one or more MLTL formulas using z3
 *
 * @async
 * @param {string[]} formulas - Array of MLTL formulas in "human readable" form (e.g. ["F[1,2](a&d)","G[0,2](b|c)"])
 * @returns {Promise<boolean>} - True if the formulas are jointly satisfiable, false if unsatisfiable.
 */
export async function checkSat(formulas) {
    // Parse each formula into an AST
    // Example: "F[0,2](a)" -> ["F",0,2,"a"]
    const astFormulas = formulas.map(parseFormula);


    // console.log(astFormulas);
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
     * @param {Array|string} node - AST node (string for variable, array for operators)
     * @param {number} [t=0] - Current time step for temporal expansion.
     * @returns {Object} - A Z3 Boolean expression that represents the formula at this time step
     */
    function translate(node, t=0) {
        // If the node is a variable name line "a" or "b"
        if (typeof node === 'string') {
         
          // Make it timestep aware: "a" at t=0 -> "a@0" (unique key per timestep)
          const key = `${node}@${t}`;  
         
          // If this variable doesn't exist yet, create a new Z3 Bool with this key.
          if (!(key in vars)) vars[key] = ctx.Bool.const(key);
         
          // Return the Z3 variable object.
          return vars[key];
        }


        // Otherwise the node is an operator with arguments.
        const [op, ...args] = node;




        switch(op) {
          case '!': return ctx.Not(translate(args[0], t));
          case '&': return ctx.And(translate(args[0], t), translate(args[1], t));
          case '|': return ctx.Or(translate(args[0], t), translate(args[1], t));


          case "F": {
            const [low, high, sub] = args;
            let disj = translate(sub, low);
            for (let k = low+1; k <= high; k++) {
              disj = ctx.Or(disj, translate(sub, t + k));
            }
            return disj;
          }


          case "G": {
            const [low, high, sub] = args;
            let conj = translate(sub, low);
            for (let k = low + 1; k <= high; k++) {
              conj = ctx.And(conj, translate(sub, t + k));
            }
            return conj;
          }


          case "U": {
            // args = [low, high, left, right]
            const [low, high, left, right] = args;

            // start with the first disjunct: k = low
            let disj = (() => {
              // if k == 0 we only need right(t)
              if (low === 0) return translate(right, t);
              // otherwise build a@t ... a@t+(low-1) ∧ b@t+low
              let conj = translate(left, t);
              for (let j = 1; j < low; j++) {
                conj = ctx.And(conj, translate(left, t + j));
              }
              return ctx.And(conj, translate(right, t + low));
            })();


            // add remaining disjuncts: k = low+1 .. high
            for (let k = low + 1; k <= high; k++) {
              // build left(t) ∧ … ∧ left(t + k − 1)
              let conj = translate(left, t);
              for (let j = 1; j < k; j++) {
                conj = ctx.And(conj, translate(left, t + j));
              }
              // add right(t + k)
              conj = ctx.And(conj, translate(right, t + k));
              // accumulate into disjunction
              disj = ctx.Or(disj, conj);
            }


            return disj;
          }


          case "R": {
            // args = [low, high, left, right]
            const [low, high, left, right] = args;


            // Helper: conjunction of right(t + 0) ∧ right(t + 1) ∧ ... ∧ right(t + k)
            function rightsUpTo(k) {
              let conj = translate(right, t);            
              for (let j = 1; j <= k; j++) {
                conj = ctx.And(conj, translate(right, t + j));
              }
              return conj;
            }


            let disj = ctx.And(rightsUpTo(low), translate(left, t + low));


            // ---- remaining k = low+1 .. high ----
            for (let k = low + 1; k <= high; k++) {
              const clause = ctx.And(rightsUpTo(k), translate(left, t + k));
              disj = ctx.Or(disj, clause);
            }


            // ---- final "all-rights" clause: right holds for entire [0..high] ----
            // This covers the case where 'right' holds through the whole interval (no left needed).
            disj = ctx.Or(disj, rightsUpTo(high));


            return disj;
          }


          default: throw new Error('Unknown op: ' + op);
        }
      }
   
    // Add each parsed formula to the Z3 solver we created earlier.
    for (const node of astFormulas) {
      solver.add(translate(node))
    }


    // Ask Z3 whether the formulas are satisfiable
    const result = await solver.check();
    return result.toString() === "sat"; //true for sat, false for unsat
}


// Export the checkSat function for use in other Files



// async function main(){


//   result = await checkSat(["aU[0,1](F[0,2]((a)U[1,3](b)))","G[0,1](!b)"]);
//   console.log(result)
// }
// main();