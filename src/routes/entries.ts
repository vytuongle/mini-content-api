import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createEntrySchema, updateEntrySchema } from '../lib/validation';

const router = Router();

// GET /entries — list all
router.get('/', async (_req: Request, res: Response) => {
  const entries = await prisma.entry.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ data: entries });
});

// GET /entries/:id — get one
router.get('/:id', async (req: Request, res: Response) => {
  const entry = await prisma.entry.findUnique({
    where: { id: req.params.id },
  });
  if (!entry) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  res.json({ data: entry });
});

// POST /entries — create
router.post('/', async (req: Request, res: Response) => {
  const parsed = createEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    });
  }
  const entry = await prisma.entry.create({
    data: parsed.data,
  });
  res.status(201).json({ data: entry });
});

// PUT /entries/:id — update (snapshots previous version)
router.put('/:id', async (req: Request, res: Response) => {
  const parsed = updateEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    });
  }

  const existing = await prisma.entry.findUnique({
    where: { id: req.params.id },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  await prisma.entryVersion.create({
    data: {
      entryId: existing.id,
      title: existing.title,
      body: existing.body,
      version: existing.version,
    },
  });

  const updated = await prisma.entry.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      version: existing.version + 1,
    },
  });

  res.json({ data: updated });
});

// DELETE /entries/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const existing = await prisma.entry.findUnique({
    where: { id: req.params.id },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  await prisma.entry.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// GET /entries/:id/versions — version history
router.get('/:id/versions', async (req: Request, res: Response) => {
  const versions = await prisma.entryVersion.findMany({
    where: { entryId: req.params.id },
    orderBy: { version: 'desc' },
  });
  res.json({ data: versions });
});

export default router;
