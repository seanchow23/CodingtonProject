global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TwoDExplorePage from '../twoDExplorePage';
import { useNavigate, useLocation } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe('TwoDExplorePage', () => {
  const mockNavigate = jest.fn();
  const mockScenario = {
    _id: 's123',
    name: '2D Scenario',
    events: [
      { name: 'Income A', type: 'income', startYear: 2025, duration: 5, amount: 60000 },
      { name: 'Investment B', type: 'invest', startYear: 2040, duration: 2, assetAllocation: [{}, {}] }
    ]
  };

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ state: { scenario: mockScenario } });
    jest.clearAllMocks();
  });

  test('renders dropdowns and allows value updates', () => {
    const { getByText, getAllByRole, container } = render(<TwoDExplorePage />);

    expect(getByText(/Two-Dimensional Parameter Exploration/i)).toBeInTheDocument();

    const selects = getAllByRole('combobox');
    expect(selects.length).toBe(2);

    fireEvent.change(selects[0], { target: { value: 'event-0-startYear' } });
    fireEvent.change(selects[1], { target: { value: 'event-1-allocation' } });

    const inputs = container.querySelectorAll('input[type="number"]');
    expect(inputs.length).toBe(6);

    fireEvent.change(inputs[0], { target: { value: '2020' } });
    fireEvent.change(inputs[3], { target: { value: '10' } });

    expect(inputs[0].value).toBe('2020');
    expect(inputs[3].value).toBe('10');
  });

  test('clicking run navigates with proper twoDResults and param metadata', () => {
    const { getByText, getAllByRole, container } = render(<TwoDExplorePage />);

    const selects = getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'event-0-amount' } });
    fireEvent.change(selects[1], { target: { value: 'event-1-startYear' } });

    const inputs = container.querySelectorAll('input[type="number"]');

    fireEvent.change(inputs[0], { target: { value: '10000' } }); // X lower
    fireEvent.change(inputs[1], { target: { value: '10020' } }); // X upper
    fireEvent.change(inputs[2], { target: { value: '10' } });    // X step

    fireEvent.change(inputs[3], { target: { value: '2030' } });  // Y lower
    fireEvent.change(inputs[4], { target: { value: '2032' } });  // Y upper
    fireEvent.change(inputs[5], { target: { value: '1' } });     // Y step

    const runButton = getByText(/Run Two-Dimensional Exploration/i);
    fireEvent.click(runButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/simulation/'),
      expect.objectContaining({
        state: expect.objectContaining({
          twoDResults: expect.any(Array),
          twoDParams: expect.objectContaining({
            param1: expect.objectContaining({ values: [10000, 10010, 10020] }),
            param2: expect.objectContaining({ values: [2030, 2031, 2032] }),
          }),
        }),
      })
    );
  });
});
