import React, { useState } from 'react';
import './index.css';
import config from './config';

function App(){
  const [inputFormula, setInputFormula] = useState('');
  const[submittedFormula, setSubmittedFormula] = useState('');
  const [backendResponse, setBackendResponse] = useState(null);

  const handleInputChange = (event) => {
    setInputFormula(event.target.value);
  };

  const handleSubmit = async (e) => {
    console.log(`Fetching from: ${config.backendURL}/solve`);
    e.preventDefault();
    setSubmittedFormula(inputFormula);

    const response = await fetch(`${config.backendURL}/solve`, {
      method: 'POST',
      headers:{'Content-Type': 'application/json'},
      body: JSON.stringify({formula: inputFormula}),
    });

    const data = await response.json();
    console.log(data);
    setBackendResponse(data);
  };

  return(
    <div style = {{padding: '2rem', fontFamily: 'sans-serif'}}>
      <h1>Mini SAT Solver</h1>
      <p>This is a proof of concept only! That means there are current restrictions:</p>
      <p>No more than 3 variables (the sat solver is brute force, and will take forever if you use more)</p>
      <p>Only Conjunctive Normal Form (a|b) & (b|c) is accepted for now</p>

      <form onSubmit={handleSubmit}>
        <label>Enter your CNF formula: 
          <input 
            type="text"  
            value={inputFormula}
            onChange={handleInputChange}
            style={{ marginLeft: '1rem', padding: '0.5rem', width: '60%' }}
            />
        </label>

        <button type="submit" style={{ marginLeft: '1rem', padding: '0.5rem' }}>
          Submit
        </button> 
      </form>
      {/* Below only renders if a formula has been submitted */}
      {submittedFormula && (
        <div style={{marginTop: '2rem'}}>
          <h2>Submitted Formula:</h2>
          <p>{submittedFormula}</p>
        </div>
      )}

      {backendResponse && (
        <div>
          <h2>Result from Backend:</h2>
          <p>Variables: {backendResponse.variables.join(', ')}</p>
          {backendResponse.error ? (
          <p style={{ color: 'red' }}> Error: {backendResponse.error}</p>
            ):(
            <>
              <p>Result: {backendResponse.result}</p>
              <p>Unsat Core: {backendResponse.core.join(', ')}</p>
            </>
          )}
        </div>
      )}

{backendResponse?.truthTable && backendResponse.truthTable.length > 0 && (
  <div style={{ marginTop: '2rem' }}>
    <h2>Truth Table</h2>
    <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th colSpan={backendResponse.variables.length} className="section-header">Variables</th>
        <th colSpan={backendResponse.clauses.length}>Clauses</th>
        <th className="section-header">Satisfiability</th>
      </tr>
      
      <tr>
        {backendResponse.variables.map((v) => (
          <th key={v} className="section-header">{v}</th>
        ))}
        {backendResponse.clauses?.map((clauseStr, i) => (
          <th key={`C${i}`} className={backendResponse.core.includes(clauseStr) ? 'unsat-core' : ''}>{clauseStr}</th>
        ))}
        <th className="section-header">{submittedFormula}</th>
      </tr>
    </thead>

      <tbody>
        {backendResponse.truthTable.map((row, idx) => (
          <tr key={idx}>
            {backendResponse.variables.map((v) => (
              <td key={v} className="variable-column">{row.assignment[v] ? 'T' : 'F'}</td>
            ))}
            {row.clauseResults.map((res, i) => (
              <td key={`C${i}`}>{res ? 'T' : 'F'}</td>
            ))}
             <td className="satisfiable-column">{row.satisfiesFormula ? '✅ Yes' : '❌ No'}</td>
          </tr>
          
        ))}
      </tbody>
    </table>
  </div>
)}
      
    </div>
  );
  
}

export default App;
