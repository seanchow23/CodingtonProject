// ✅ Polyfill for structuredClone
global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import OneDExplorePage from '../oneDExplorePage';
import { useNavigate, useLocation } from 'react-router-dom';

// ✅ Mock router
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe('OneDExplorePage Tests (without htmlFor linking)', () => {
  const mockNavigate = jest.fn();

  const mockScenario = {
    _id: 's123',
    name: 'Scenario X',
    events: [
      {
        name: 'Job Start',
        type: 'income',
        startYear: 2025,
        duration: 5,
        amount: 50000,
      },
      {
        name: 'Retire',
        type: 'invest',
        startYear: 2050,
        duration: 1,
        assetAllocation: [{ percentage: 50 }, { percentage: 50 }],
      },
    ],
    rothOptimizer: false,
  };

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ state: { scenario: mockScenario } });
    jest.clearAllMocks();
  });

  test('renders and allows interaction without relying on htmlFor', () => {
    const { getByText, container } = render(<OneDExplorePage />);

    expect(getByText(/Explore a Scenario Parameter/i)).toBeInTheDocument();

    // Get the first <select> (parameter type selector)
    const selects = container.querySelectorAll('select');
    const paramSelect = selects[0];
    fireEvent.change(paramSelect, { target: { value: 'event-0-startYear' } });

    // Get numeric inputs by order
    const inputs = container.querySelectorAll('input[type="number"]');
    const lowerInput = inputs[0];
    const upperInput = inputs[1];
    const stepInput = inputs[2];

    fireEvent.change(lowerInput, { target: { value: '2020' } });
    expect(lowerInput.value).toBe('2020');

    fireEvent.change(stepInput, { target: { value: '2' } });
    expect(stepInput.value).toBe('2');
  });

  test('clicking run navigates with correct data (manual select/input lookup)', () => {
    const { getByText, container } = render(<OneDExplorePage />);

    // Select parameter type
    const paramSelect = container.querySelectorAll('select')[0];
    fireEvent.change(paramSelect, { target: { value: 'event-0-startYear' } });

    // Update numeric range
    const inputs = container.querySelectorAll('input[type="number"]');
    fireEvent.change(inputs[0], { target: { value: '2020' } }); // lower
    fireEvent.change(inputs[1], { target: { value: '2022' } }); // upper
    fireEvent.change(inputs[2], { target: { value: '1' } });    // step

    // Trigger button
    const runButton = getByText(/Run One-Dimensional Exploration/i);
    fireEvent.click(runButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/simulation/'),
      expect.objectContaining({
        state: expect.objectContaining({
          oneDResults: expect.any(Array),
          oneDParam: expect.objectContaining({
            key: 'event-0-startYear',
            values: [2020, 2021, 2022],
          }),
        }),
      })
    );
  });
});
