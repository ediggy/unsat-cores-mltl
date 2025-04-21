const express = require('express');
const cors = require('cors');
const { solveSAT } = require('./mini-sat-solver');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send('hello from the SAT Solver Backend!');
});

app.post('/solve', (req,res) => {
    const formula = req.body.formula;
    console.log('Recieved formula: ', formula);
   
    
    const response = solveSAT(formula);
    response.formula = formula //add original formula for completeness
    res.json(response);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });