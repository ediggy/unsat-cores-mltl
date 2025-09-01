const { parseFormula } = require("./parser.js")
const { init } = require("z3-solver");

async function checkSat(formulas) {
    const astFormulas = formulas.map(parseFormula);

    const { Context } = await init();
    const ctx = new Context('main');
    const solver = new ctx.Solver();

    const vars = {};

    function translate(tree) {
        if (typeof tree === 'string') {
        if (!(tree in vars)) vars[tree] = ctx.Bool.const(tree);
        return vars[tree];
    }
    const [op, a, b] = tree;
    switch (op) {
        case '!': return ctx.Not(translate(a));
        case '&': return ctx.And(translate(a), translate(b));
        case '|': return ctx.Or(translate(a), translate(b));
        default: throw new Error('Unknown op: ' + op);
    }
  }

    for (const tree of astFormulas) {
    solver.add(translate(tree))
  }

    const result = await solver.check();
    return result.toString() === "sat"; //true for sat, false for unsat
}

module.exports = { checkSat }
