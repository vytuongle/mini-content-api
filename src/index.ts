import express from 'express';
import path from 'path';
import entriesRouter from './routes/entries';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve the UI from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/entries', entriesRouter);

// JSON 404 for unmatched API routes only
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

export default app;
