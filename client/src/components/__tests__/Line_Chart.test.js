import React from 'react';
import { render } from '@testing-library/react';
import Line_Chart from '../line_chart'; // adjust path as needed
import '@testing-library/jest-dom';

// Mock Plotly if needed
jest.mock('react-plotly.js', () => (props) => {
  return (
    <div data-testid="plotly-chart">
      Mock Plotly Chart
    </div>
  );
});

describe('Line_Chart', () => {
  const testData = [
    [true, true, false, true, true],
    [true, false, false, true, false],
    [true, true, true, true, true],
    [false, true, true, false, true],
    [true, true, false, false, true],
  ];

  test('renders Line_Chart with Plotly', () => {
    const { getByTestId } = render(<Line_Chart data={testData} />);
    expect(getByTestId('plotly-chart')).toBeInTheDocument();
  });
});
