import express from 'express';
import cors from 'cors';
import { main as quickXplain } from './quickxplain.js';


const app = express();
app.use(cors());
app.use(express.json());

/**
 * POST /check
 * Body: { formulas: ["aR[0,2]b", "F[0,1]a", ...] }
 */
app.post('/check', async (req, res) => {
  try {
    const formulas = req.body.formulas;
    const core = await quickXplain(formulas);
    res.json({core});
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MLTL Unsat Core backend running at http://localhost:${PORT}`);
});
