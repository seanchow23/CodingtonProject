const fs = require('fs');
const path = require('path');

function getLogFilenames(user) {
  const timestamp = new Date();

  // Format the timestamp in the desired format
  const formattedTimestamp = timestamp.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Replace colons and spaces for filename compatibility
  const filenameTimestamp = formattedTimestamp
    .replace(/:/g, '')        // Remove colons
    .replace(/ /g, '_')       // Replace spaces with underscores
    .replace(',', '');        // Remove comma

  const base = `${user || 'anonymous'}_${filenameTimestamp}`;
  const dir = path.join(__dirname, 'logs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return {
    csv: path.join(dir, `${base}.csv`),
    log: path.join(dir, `${base}.log`)
  };
}

class CsvLogger {
  constructor(filename) {
    this.filename = filename;
    this.rows = [];

    // Ensure directory exists
    const dir = path.dirname(filename);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  logYear(year, values) {
    this.rows.push([year, ...values]);
  }

  flush(headers) {
    if (!fs.existsSync(this.filename)) {
      const headerLine = ['Year', ...headers].join(',') + '\n';
      const dataLines = this.rows.map(row => row.join(',')).join('\n') + '\n';
      fs.writeFileSync(this.filename, headerLine + dataLines);
    }
  }
}

class EventLogger {
  constructor(filename) {
    this.filename = filename;

    // Ensure directory exists
    const dir = path.dirname(filename);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Initialize file with header if it doesn't exist
    if (!fs.existsSync(this.filename)) {
      fs.writeFileSync(this.filename, `Simulation Event Log\n\n`);
    }
  }

  logEvent(year, type, amount, name) {
    const line = `Year: ${year}, Type: ${type}, Amount: ${amount}, Name: ${name}\n`;
    fs.appendFileSync(this.filename, line);
  }
}

module.exports = { CsvLogger, EventLogger, getLogFilenames };