function validateCNF(input) {
    // Split at '&' to get clauses
    const clauseStrings = input.split('&').map(clause => clause.trim());

    for (let clause of clauseStrings) {
        // Clause must start and end with parentheses
        if (!clause.startsWith('(') || !clause.endsWith(')')) {
            return false;
        }

        // Remove outer parentheses and split by '|'
        const inner = clause.slice(1, -1).trim();
        if (inner.length === 0) return false;

        const literals = inner.split('|').map(l => l.trim());

        // Check each literal is valid (e.g., variable or !variable)
        for (let lit of literals) {
            if (!/^!?[a-zA-Z][a-zA-Z0-9]*$/.test(lit)) {
                return false;
            }
        }
    }

    return true;
}


function parseFormula(input) {
    const clauseStrings = input.split('&').map(clause => clause.trim());
    const parsedClauses = clauseStrings.map(clause => {
        return clause
            .replace(/^\(|\)$/g, '') // Remove parentheses
            .split('|')
            .map(lit => lit.trim());
    });

    return { clauseStrings, parsedClauses };
}

function getVariables(clauses) {
    const vars = new Set();
    clauses.flat().forEach(lit => {
        vars.add(lit.replace('!', ''));
    });
    return Array.from(vars);
}


function generateAllAssignments(variables) {
    const assignments = [];
    const n = variables.length;
    const total = 1 << n; // 2^n combinations

    for (let i = 0; i < total; i++) {
        const assignment = {};
        for (let j = 0; j < n; j++) {
            const varName = variables[j];
            // Flip slower for the earlier (leftmost) variables
            const bitIndex = n - j - 1;
            assignment[varName] = !!(i & (1 << bitIndex));
        }
        assignments.push(assignment);
    }
    return assignments;
}

function evaluateClause(clause, assignment) {
    return clause.some(lit => {
      const isNegated = lit.startsWith('!');
      const varName = isNegated ? lit.slice(1) : lit;
      const value = assignment[varName];
      return isNegated ? !value : value;
    });
  }

  function findUnsatCore(clauses, clauseStrings, variables) {
    const powerset = (arr) => {
        const results = [];
        const total = 1 << arr.length;
        for (let i = 1; i < total; i++) {
            const subset = [];
            for (let j = 0; j < arr.length; j++) {
                if (i & (1 << j)) {
                    subset.push(j); // store index
                }
            }
            results.push(subset);
        }
        return results;
    };

    const clauseSubsets = powerset(clauses);
    let minimalCore = null;

    for (const subsetIndices of clauseSubsets) {
        const subClauses = subsetIndices.map(i => clauses[i]);

        const allAssignments = generateAllAssignments(variables);
        const isUnsat = allAssignments.every(assignment =>
            subClauses.some(clause => !evaluateClause(clause, assignment))
        );

        if (isUnsat) {
            if (
                minimalCore === null ||
                subsetIndices.length < minimalCore.length
            ) {
                minimalCore = subsetIndices;
            }
        }
    }

    return minimalCore;
}



function solveSAT(formula){
    if (!validateCNF(formula)){
        return{
            error: 'Invalid CNF format. Use (&)-separated clauses with (|)-separated literals inside parentheses. Example: (a | b) & (!a | c)',
            variables: [],
            result: 'Error',
            core: [],
        };
    }


    const {clauseStrings, parsedClauses} = parseFormula(formula);
    const variables = getVariables(parsedClauses);

    if (variables.length > 3) {
        return {
            error: 'Too many variables. Please limit your formula to 3 variables or fewer.',
            variables: variables,
            result: 'Error. Too many variables. Please limit your formula to 3 variables or fewer.',
            core: [],
        };
    }

    const assignments = generateAllAssignments(variables);
    const truthTable = []
    let isSatisfiable = false;
    let satisfyingAssignment = null;

    for (const assignment of assignments) {
        const clauseResults = parsedClauses.map(clause =>
            evaluateClause(clause, assignment)
        );
        const allClausesSatisfied = clauseResults.every(Boolean);
        
        truthTable.push({
            assignment,
            clauseResults,
            satisfiesFormula: allClausesSatisfied
        });

        if (allClausesSatisfied && !isSatisfiable){
            isSatisfiable = true;
            satisfyingAssignment = assignment;
        }
    }

    if (!isSatisfiable) {
        const unsatCore = findUnsatCore(parsedClauses, clauseStrings, variables);
        return {
            variables,
            result: 'UNSAT',
            truthTable,
            clauses: clauseStrings,
            core: unsatCore.map(index => clauseStrings[index]),
        };
    }


    return{
        variables: variables,
        clauses: clauseStrings,
        result: isSatisfiable ? 'SAT' : 'UNSAT',
        truthTable: truthTable, 
        satisfyingAssignment,
        core: isSatisfiable? [] : ['not implemented'],
    };

}

module.exports = {solveSAT};

