jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
      ...actual,
      useNavigate: jest.fn(),
    };
  });
  
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ScenarioList from '../scenario_list';
import * as router from 'react-router-dom';

describe('ScenarioList Component', () => {
  const mockScenarios = [
    { _id: 1, name: 'Retirement Plan' },
    { _id: 2, name: 'College Fund' },
  ];

  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockReturnValue(mockNavigate);
  });

  test('renders scenario list and buttons', () => {
    render(<ScenarioList scenarios={mockScenarios} />);
    expect(screen.getByText('Scenarios')).toBeInTheDocument();
    expect(screen.getByText('Retirement Plan')).toBeInTheDocument();
    expect(screen.getByText('College Fund')).toBeInTheDocument();
    expect(screen.getByText('+ Create Scenario')).toBeInTheDocument();
  });

  test('clicking a scenario navigates to its detail page', () => {
    render(<ScenarioList scenarios={mockScenarios} />);

    const card = screen.getByText('Retirement Plan');
    fireEvent.click(card);

    console.log('Navigate calls:', mockNavigate.mock.calls);

    expect(mockNavigate).toHaveBeenCalledWith('/scenario/1', {
      state: { scenario: mockScenarios[0] },
    });
  });

  test('clicking create button navigates to /scenario/create', () => {
    render(<ScenarioList scenarios={mockScenarios} />);
    fireEvent.click(screen.getByText('+ Create Scenario'));

    console.log('Navigate calls:', mockNavigate.mock.calls);

    expect(mockNavigate).toHaveBeenCalledWith('/scenario/create');
  });
});
