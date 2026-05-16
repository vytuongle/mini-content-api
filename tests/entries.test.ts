import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/lib/prisma';

describe('Entries API', () => {
  let entryId: string;

  beforeAll(async () => {
    await prisma.entryVersion.deleteMany();
    await prisma.entry.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates an entry', async () => {
    const res = await request(app)
      .post('/api/v1/entries')
      .send({ title: 'Test', body: 'Test body' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test');
    entryId = res.body.data.id;
  });

  it('rejects invalid input', async () => {
    const res = await request(app)
      .post('/api/v1/entries')
      .send({ title: '' });

    expect(res.status).toBe(400);
  });

  it('lists entries', async () => {
    const res = await request(app).get('/api/v1/entries');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('gets a single entry', async () => {
    const res = await request(app).get(`/api/v1/entries/${entryId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(entryId);
  });

  it('updates and versions an entry', async () => {
    const res = await request(app)
      .put(`/api/v1/entries/${entryId}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.version).toBe(2);
    expect(res.body.data.title).toBe('Updated');

    const versions = await request(app).get(`/api/v1/entries/${entryId}/versions`);
    expect(versions.body.data.length).toBe(1);
    expect(versions.body.data[0].title).toBe('Test');
  });

  it('returns 404 for missing entry', async () => {
    const res = await request(app).get('/api/v1/entries/nonexistent');
    expect(res.status).toBe(404);
  });

  it('deletes an entry', async () => {
    const res = await request(app).delete(`/api/v1/entries/${entryId}`);
    expect(res.status).toBe(204);

    const getRes = await request(app).get(`/api/v1/entries/${entryId}`);
    expect(getRes.status).toBe(404);
  });
});
