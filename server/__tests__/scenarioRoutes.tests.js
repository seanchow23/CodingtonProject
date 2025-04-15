jest.setTimeout(20000); // Increase timeout for slow DB or heavy routes

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user');
const Scenario = require('../models/scenario');

let testUser;
let testScenario;

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test-db');

  // Create test user
  testUser = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword123'
  });

  // Create test scenario
  testScenario = await Scenario.create({
    name: 'Test Plan',
    married: false,
    birthYearUser: 1980,
    lifeExpectancyUser: 85,
    inflation: 0.03,
    annualLimit: 22000,
    financialGoal: 300000,
    state: 'NY'
  });

  console.log('🧪 Created Scenario ID:', testScenario._id);
  console.log('🧪 Created User ID:', testUser._id);
});

afterAll(async () => {
  await User.deleteMany({});
  await Scenario.deleteMany({});
  await mongoose.connection.close();
  await new Promise(resolve => setTimeout(resolve, 100)); // Ensure DB disconnect finishes
});

describe('Scenario + User Sharing Routes', () => {
  test('POST /api/scenarios → should create a new scenario', async () => {
    const res = await request(app).post('/api/scenarios').send({
      name: 'Independent Plan',
      married: true,
      birthYearUser: 1990,
      lifeExpectancyUser: 85,
      inflation: 0.03,
      annualLimit: 21000,
      financialGoal: 400000,
      state: 'CA'
    });

    console.log('🔧 POST /api/scenarios result:', res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Independent Plan');
  });

  test('GET /api/scenarios/:id → should return a scenario', async () => {
    const res = await request(app).get(`/api/scenarios/${testScenario._id}`);
    console.log('📦 GET /api/scenarios/:id response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Plan');
  });

  test('POST /api/users/:id/scenarios/:scenarioId → should add scenario to user', async () => {
    const res = await request(app).post(`/api/users/${testUser._id}/scenarios/${testScenario._id}`);
    console.log('➕ Linked Scenario to User:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.scenarios).toContain(testScenario._id.toString());
  });

  test('GET /api/users/:id/scenarios → should return scenarios for user', async () => {
    const res = await request(app).get(`/api/users/${testUser._id}/scenarios`);
    console.log('📥 Scenarios for User:', res.body);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('PUT /api/scenarios/:id → should update scenario', async () => {
    const res = await request(app)
      .put(`/api/scenarios/${testScenario._id}`)
      .send({ financialGoal: 999999 });

    console.log('✏️ Updated Scenario:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.financialGoal).toBe(999999);
  });

  test('DELETE /api/scenarios/:id → should delete scenario', async () => {
    const res = await request(app).delete(`/api/scenarios/${testScenario._id}`);
    console.log('❌ Deleted Scenario Response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Scenario deleted');
  });
});
