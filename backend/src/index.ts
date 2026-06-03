import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db';
import workEntriesRouter from './routes/workEntries';
import workTypesRouter from './routes/workTypes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.use('/api/work-entries', workEntriesRouter);
app.use('/api/work-types', workTypesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  let retries = 10;
  while (retries > 0) {
    try {
      await initializeDatabase();
      break;
    } catch (err) {
      retries--;
      console.log(`DB not ready, retrying... (${retries} left)`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
