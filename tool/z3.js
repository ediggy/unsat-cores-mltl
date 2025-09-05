const { parseFormula } = require("./parser.js")
const { init } = require("z3-solver");

async function checkSat(formulas) {
    const astFormulas = formulas.map(parseFormula);

    const { Context } = await init();
    const ctx = new Context('main');
    const solver = new ctx.Solver();

    const vars = {};

    function translate(tree, t=0) {
      if (typeof tree === 'string') {
        if (!(tree in vars)) vars[tree] = ctx.Bool.const(tree);
        return vars[tree];
      }

      const [op, ...args] = tree;

      switch (op) {
          case '!': return ctx.Not(translate(args[0],t));
          case '&': return ctx.And(translate(args[0],t), translate(args[1],t));
          case '|': return ctx.Or(translate(args[0],t), translate(args[1],t));
          case "F":{
            const [low, high, sub] = args;
            const end = high; // When we have a trace: truncate to trace length
            let disj = translate(sub, low);
            for (let k = low+1; k <=end; k++) {
              disj = ctx.Or(disj, translate(sub, k));
            }
            return disj;
          }

          case "G": {
            const [low, high, sub] = args;
            const end = Math.min(high, T-1);
            let conj = translate(sub, low);
            for (let k = low+1; k <= end; k++){
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

  result = await checkSat(["F[0,1](a)","F[0,1](!a)"]);
  console.log(result)
}
main();

