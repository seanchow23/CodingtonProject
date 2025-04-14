jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
      ...actual,
      useNavigate: jest.fn(),
    };
  });
  
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateScenario from '../create_scenario';
import * as router from 'react-router-dom';

let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockReturnValue(mockNavigate);
  });

describe('CreateScenario Component', () => {
  const mockScenarios = [];

  test('renders the scenario creation form', () => {
    render(<CreateScenario scenarios={mockScenarios} />);

    expect(screen.getByLabelText(/Scenario Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Birth Year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Life Expectancy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Inflation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Annual Contribution Limit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Financial Goal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Roth Optimizer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/State of Residence/i)).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  test('form shows error when a negative value is entered', () => {
    render(<CreateScenario scenarios={mockScenarios} />);

    fireEvent.change(screen.getByLabelText(/Scenario Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Inflation/i), { target: { value: -5 } });

    fireEvent.click(screen.getByText('Submit'));

    expect(screen.getByText(/cannot have a negative value/i)).toBeInTheDocument();
  });

  test('successful form submit navigates to homepage', () => {
    render(<CreateScenario scenarios={mockScenarios} />);

    fireEvent.change(screen.getByLabelText(/Scenario Name/i), { target: { value: 'Retirement' } });
    fireEvent.change(screen.getByLabelText(/Birth Year/i), { target: { value: 1980 } });
    fireEvent.change(screen.getByLabelText(/Life Expectancy/i), { target: { value: 85 } });
    fireEvent.change(screen.getByLabelText(/Inflation/i), { target: { value: 2.5 } });
    fireEvent.change(screen.getByLabelText(/Annual Contribution Limit/i), { target: { value: 6000 } });
    fireEvent.change(screen.getByLabelText(/Financial Goal/i), { target: { value: 1000000 } });
    fireEvent.change(screen.getByLabelText(/State of Residence/i), { target: { value: 'California' } });

    fireEvent.click(screen.getByText('Submit'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
