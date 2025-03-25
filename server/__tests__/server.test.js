// __tests__/server.test.js
const request = require('supertest');
const app = require('../app'); // ✅ uses the real app

describe('Backend Route Tests', () => {
  test('should return a mock user from /auth/user', async () => {
    const res = await request(app).get('/auth/user');
    expect(res.statusCode).toBe(200);
  });

  test('should redirect to homepage on /auth/logout', async () => {
    const res = await request(app).get('/auth/logout');
    expect(res.statusCode).toBe(302);
  });

  test('should return JSON array from /api/tax/federal', async () => {
    const res = await request(app).get('/api/tax/federal');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should return JSON object from /api/tax/deductions', async () => {
    const res = await request(app).get('/api/tax/deductions');
    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  test('should return JSON array from /api/tax/capital-gains', async () => {
    const res = await request(app).get('/api/tax/capital-gains');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
