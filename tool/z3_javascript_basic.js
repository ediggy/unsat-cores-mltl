import {init} from "z3-solver";

async function main(){
    const {Context} = await init();
    const ctx = new Context("main");
    const solver = new ctx.Solver();

    // requirements: x + y = 10, x>0, y>0
    // 1. is it satisfiable?
    // 2. If it is, what is a satisfying assignment for x and y?

    const x = ctx.Int.const("x");
    const y = ctx.Int.const("y");

    solver.add(x.add(y).eq(10));
    solver.add(x.gt(0))
    solver.add(y.gt(0))

    const result = await solver.check();
    console.log("Result: ", result);

    if (result == "sat"){
        const model = solver.model();
        console.log("Model: ", model.toString())
    }

}

main()