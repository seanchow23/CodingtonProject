// Mock axios before importing the API
jest.mock('axios');

// Access default export if necessary (for compatibility)
const axios = require('axios');
const mockedAxios = axios.default || axios;

// Setup mock functions for axios instance methods
const mockPost = jest.fn();
const mockGet = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

// Mock the axios instance that scenarioApi.js creates
mockedAxios.create = jest.fn(() => ({
  post: mockPost,
  get: mockGet,
  put: mockPut,
  delete: mockDelete,
}));

// Import the API only AFTER mocking
const scenarioApi = require('../../api/scenarioApi');

describe('scenarioApi', () => {
  const mockScenario = {
    name: 'Test Plan',
    married: false,
    birthYearUser: 1990,
    lifeExpectancyUser: 85,
    inflation: 0.03,
    annualLimit: 22000,
    financialGoal: 400000,
    state: 'CA',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createScenario → POST /', async () => {
    mockPost.mockResolvedValue({ data: mockScenario });
    const res = await scenarioApi.createScenario(mockScenario);
    expect(mockPost).toHaveBeenCalledWith('/', mockScenario);
    expect(res.data).toEqual(mockScenario);
  });

  test('getScenario → GET /:id', async () => {
    mockGet.mockResolvedValue({ data: mockScenario });
    const res = await scenarioApi.getScenario('123');
    expect(mockGet).toHaveBeenCalledWith('/123');
    expect(res.data).toEqual(mockScenario);
  });

  test('updateScenario → PUT /:id', async () => {
    const updated = { ...mockScenario, financialGoal: 999999 };
    mockPut.mockResolvedValue({ data: updated });
    const res = await scenarioApi.updateScenario('123', updated);
    expect(mockPut).toHaveBeenCalledWith('/123', updated);
    expect(res.data.financialGoal).toBe(999999);
  });

  test('deleteScenario → DELETE /:id', async () => {
    mockDelete.mockResolvedValue({ data: { message: 'Deleted' } });
    const res = await scenarioApi.deleteScenario('123');
    expect(mockDelete).toHaveBeenCalledWith('/123');
    expect(res.data.message).toBe('Deleted');
  });

  test('getAllScenarios → GET /', async () => {
    mockGet.mockResolvedValue({ data: [mockScenario] });
    const res = await scenarioApi.getAllScenarios();
    expect(mockGet).toHaveBeenCalledWith('/');
    expect(res.data).toHaveLength(1);
  });
});
