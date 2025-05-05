const fs = require('fs');
const path = require('path');

function getLogFilenames(user) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
  const base = `${user}_${timestamp}`;
  const dir = path.join(__dirname, 'logs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  return {
    csv: path.join(dir, `${base}.csv`),
    log: path.join(dir, `${base}.log`)
  };
}

class CsvLogger {
  constructor(filename) {
    this.filename = filename;
    this.rows = [];
  }

  logYear(year, values) {
    this.rows.push([year, ...values]);
  }

  flush(values) {
    const headerLine = ['Year', ...values].join(',') + '\n';
    const dataLines = this.rows.map(row => row.join(',')).join('\n') + '\n';
    fs.writeFileSync(this.filename, headerLine + dataLines);
  }
}

class EventLogger {
  constructor(filename) {
    this.filename = filename;
    fs.writeFileSync(this.filename, `Simulation Event Log\n\n`);
  }

  logEvent(year, type, amount, name) {
    const line = `Year: ${year}, Type: ${type}, Amount: ${amount}, Name: ${name}\n`;
    fs.appendFileSync(this.filename, line);
  }
}

module.exports = { CsvLogger, EventLogger, getLogFilenames };