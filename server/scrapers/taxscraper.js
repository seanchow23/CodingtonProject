const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

function sanitize(str) {
  return str.replace(/[$,%]/g, '').trim();
}

async function scrapeTaxBrackets() {
  const url = process.env.TAX_BRACKETS_URL;
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);
  const results = [];

  $('table tbody tr').each((i, row) => {
    const cells = $(row).find('td').map((i, el) =>
      sanitize($(el).text())
    ).get();

    if (cells.length >= 3) {
      results.push({
        filingStatus: cells[0],
        incomeRange: cells[1],
        taxRate: cells[2],
      });
    }
  });

  const outputDir = path.join(__dirname, '../data');
  const outputPath = path.join(outputDir, 'federal_tax_brackets.json');

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(` Saved ${results.length} sanitized f brackets to ${outputPath}`);
}

scrapeTaxBrackets().catch(console.error);
