import express, { json } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running!' });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
