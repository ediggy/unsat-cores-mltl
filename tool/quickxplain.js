import { checkSat } from "./z3.js"


// QX procedure: entry point
export async function QX(A) {
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
export async function QXprime(d, A, B) {
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




const empty_array = []

const unsat_array = ["c","b","a","!a","!b"]

const sat_array = ["sat"]

// console.log(await checkSat(unsat_array));

// console.log(QX(sat_array,empty_array))
console.log("Final unsat core: ", await QX(unsat_array, empty_array))
// console.log(QX(empty_array,empty_array))
