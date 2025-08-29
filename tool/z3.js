import { init } from "z3-solver";

export async function checkSat(constraints) {
    const z3 = await init();
    const ctx = new z3.Context("main");
    const solver = new ctx.Solver();

    // Step 1: collect variable names
    const varNames = new Set();
    constraints.forEach(expr =>
        expr.match(/[a-zA-Z]+/g)?.forEach(v => varNames.add(v))
    );

    // Step 2: create boolean vars in ctx
    const vars = {};
    for (const v of varNames) {
        vars[v] = ctx.Bool.const(v);
    }

    // Step 3: convert constraint strings to Z3 expressions
    function parseExpr(expr) {
        // Handle NOT
        if (expr.startsWith("!")) {
            return vars[expr.slice(1)].not();
        }

        // Handle OR
        if (expr.includes("||")) {
            const [left, right] = expr.split("||");
            return parseExpr(left).or(parseExpr(right));
        }

        // Handle AND
        if (expr.includes("&&")) {
            const [left, right] = expr.split("&&");
            return parseExpr(left).and(parseExpr(right));
        }

        // Base case: just a variable
        return vars[expr];
    }

    const exprs = constraints.map(parseExpr);

    // Step 4: add to solver
    solver.add(...exprs);

    // Step 5: check satisfiability
    const result = await solver.check();

    if (result.toString() === "sat"){
        return true
    } else {
        return false
    }
}

