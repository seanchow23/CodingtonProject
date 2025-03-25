// client/src/components/TaxInfo.js

import React, { useEffect, useState } from "react";

export default function TaxInfo() {
  const [brackets, setBrackets] = useState([]);
  const [deductions, setDeductions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/tax/federal")
      .then(res => res.json())
      .then(data => setBrackets(data))
      .catch(err => console.error("❌ Failed to fetch tax brackets:", err));

    fetch("http://localhost:5000/api/tax/deductions")
      .then(res => res.json())
      .then(data => setDeductions(data))
      .catch(err => console.error("❌ Failed to fetch standard deductions:", err));
  }, []);

  return (
    // this code was generated via chatgpt, we prompted "how can we display the table data from our JSON files in our tax and deduciton scrapers"
    <div className="tax-info" style={{ padding: "2rem" }}>
      <h2>📊 Federal Income Tax Brackets</h2>
      <table border="1" cellPadding="8" style={{ marginBottom: "2rem" }}>
        <thead>
          <tr>
            <th>Filing Status</th>
            <th>Income Range</th>
            <th>Tax Rate</th>
          </tr>
        </thead>
        <tbody>
          {brackets.map((row, i) => (
            <tr key={i}>
              <td>{row.filingStatus}</td>
              <td>{row.incomeRange}</td>
              <td>{row.taxRate}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>💸 Standard Deductions</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Filing Status</th>
            <th>Deduction Amount</th>
          </tr>
        </thead>
        <tbody>
          {deductions.map((row, i) => (
            <tr key={i}>
              <td>{row.filingStatus}</td>
              <td>${row.deduction.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
