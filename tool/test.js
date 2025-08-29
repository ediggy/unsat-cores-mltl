// test.js
import { checkSat } from "./z3.js"; // your SAT checker
import { QX } from "./quickxplain.js"; // your unsat core function

async function runSatTests() {
    console.log("=== SAT / UNSAT Tests ===");

    const tests = [
        { name: "Trivially SAT", constraints: ["a"], expected: true },
        { name: "Trivially UNSAT", constraints: ["a", "!a"], expected: false },
        { name: "Simple OR, satisfiable", constraints: ["a||b"], expected: true },
        { name: "Simple OR, unsatisfiable", constraints: ["a||b", "!a", "!b"], expected: false },
        { name: "Simple AND, satisfiable", constraints: ["a&&b"], expected: true },
        { name: "Simple AND, unsatisfiable", constraints: ["a&&b", "!a"], expected: false }
    ];

    for (const test of tests) {
        try {
            const result = await checkSat(test.constraints);
            const pass = result === test.expected;
            console.log(`${pass ? "✅" : "❌"} ${test.name}: expected ${test.expected}, got ${result}`);
        } catch (err) {
            console.log(`❌ ${test.name} threw an error:`, err);
        }
    }
}

async function runUnsatCoreTests() {
    console.log("\n=== QuickXplain Unsat Core Tests ===");

    const tests = [
        {
            name: "Simple contradiction",
            constraints: ["a", "!a"],
            expectedCore: ["a", "!a"]
        },
        {
            name: "OR contradiction",
            constraints: ["a||b", "!a", "!b"],
            expectedCore: ["a||b", "!a", "!b"]
        },
        {
            name: "UNSAT with irrelevant clause",
            constraints: ["a||b", "!a", "!b", "c"],
            expectedCore: ["a||b", "!a", "!b"]
        },
        {
            name: "Multiple contradictions",
            constraints: ["a", "!a", "b", "!b"],
            expectedCore: ["a", "!a"] // QuickXplain may pick any minimal unsat core
        },
        {
            name: "Nested OR/AND contradiction",
            constraints: ["a&&b", "!a||!b"],
            expectedCore: ["a&&b", "!a||!b"]
        },
        {
            name: "Complex unsat chain",
            constraints: ["a||b", "!b||c", "!a", "!c"],
            expectedCore: ["a||b", "!b||c", "!a", "!c"]
        },
        {
            name: "SAT case (no core)",
            constraints: ["a||b", "!c"],
            expectedCore: [] // SAT formulas have no unsat core
        }
    ];

    for (const test of tests) {
        try {
            const core = await QX(test.constraints);
            const pass = test.expectedCore.every(c => core.includes(c));
            console.log(`${pass ? "✅" : "❌"} ${test.name}: core = [${core.join(", ")}]`);
        } catch (err) {
            console.log(`❌ ${test.name} threw an error:`, err);
        }
    }
}

async function main() {
    await runSatTests();
    await runUnsatCoreTests();
}

main();
