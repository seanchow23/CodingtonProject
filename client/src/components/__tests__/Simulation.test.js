import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Scenario from '../scenario';
import { useNavigate, useLocation } from 'react-router-dom';

// ✅ Mock router
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
  };
});

describe('Scenario → Run Simulation button', () => {
  const mockNavigate = jest.fn();

  const mockScenario = {
    _id: 'abc123',
    name: 'Test Scenario',
    married: false,
    birthYearUser: 1980,
    lifeExpectancyUser: 2,
    inflation: 2.5,
    annualLimit: 10000,
    rothOptimizer: false,
    rothYears: [2030, 2040],
    sharing: '',
    financialGoal: 500000,
    state: 'CA',
    investments: [
      {
        _id: 'inv1',
        investmentType: { _id: 'type1', name: 'Cash', expectedAnnualReturn: 0.01, expectedAnnualIncome: 0, expenseRatio: 0, taxability: false },
        value: 200000,
        baseValue: 200000,
        taxStatus: 'non-retirement',
      },
    ],
    investmentTypes: [],
    events: [
      {
        _id: 'event1',
        type: 'invest',
        name: 'Invest Event',
        startYear: 2025,
        duration: 1,
        allocations: [],
      },
    ],
    spendingStrategy: [],
    withdrawalStrategy: [],
    rmd: [],
    rothStrategy: []
  };

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ state: { scenario: mockScenario } });
    jest.clearAllMocks();
  });

  test('navigates to simulation page with scenario state when "Run Simulation" is clicked', () => {
    const { getByText } = render(<Scenario />);

    const runBtn = getByText(/Run Simulation/i);
    fireEvent.click(runBtn);

    expect(mockNavigate).toHaveBeenCalledWith(`/simulation/${mockScenario._id}`, {
      state: { scenario: mockScenario },
    });
  });
});
