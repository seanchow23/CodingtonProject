import React from "react"
import Line_Chart from "./line_chart";
import Shaded_Chart from "./shaded_chart";
import Stacked_Chart from "./stacked_chart";
import { useNavigate } from 'react-router-dom';

export default function ChartTest() {
  return(
    <div>
  <Line_Chart></Line_Chart>
  <Shaded_Chart></Shaded_Chart>
  <Stacked_Chart></Stacked_Chart>
  </div>
  );
}