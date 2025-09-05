// TODO: Look up Explainability Certificate in model checking (Kind2) and make this tool a first stab at an explainability certificate :)
// Case study in "what is useful" - make this a section in related work

const { checkSat } = require("./z3.js");

// QX procedure: entry point
async function QX(A) {
    if (A.length === 0) {
        return [];
    } 
    if (await checkSat(A)) {
        test = await checkSat(A)
        console.log(test)
        return "No conflict set";
    } 
    else {
        return await QXprime([], A, []);
    }
}

// QX' procedure: recursive conflict finding
async function QXprime(d, A, B) {
    if (d.length > 0 && !(await checkSat(B))) {
        return [];
    }
    if (A.length === 1) {
        return A;
    }

    // split A into two parts
    const k = Math.floor(A.length / 2);
    const A1 = A.slice(0, k);
    const A2 = A.slice(k);

    // recursive calls
    const X2 = await QXprime(A1, A2, [...B, ...A1]);
    const X1 = await QXprime(X2, A1, [...B, ...X2]);

    return [...X1, ...X2];
}


async function main(){

    const user_array = ["G[0,2](a)","G[1,3](b)","F[0,2](!a & !b)"]

    // console.log(await checkSat(unsat_array));

    // console.log(QX(sat_array,empty_array))
    const result = await QX(user_array)
    console.log("Final unsat core: ", result)
    // console.log(QX(empty_array,empty_array))

}

main()

