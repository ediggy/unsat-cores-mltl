// TODO: Look up Explainability Certificate in model checking (Kind2) and make this tool a first stab at an explainability certificate :)
// Case study in "what is useful" - make this a section in related work


import { checkSat } from "./z3.js";


// QX procedure: entry point
async function QX(A) {
    if (A.length === 0) {
        return [];
    }
    if (await checkSat(A)) {
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




export async function main(formulas){

    const result = await QX(formulas);
    console.log(result)
    return result;

}
