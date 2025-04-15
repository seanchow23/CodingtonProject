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
  
});
