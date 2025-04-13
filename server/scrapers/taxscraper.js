const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeTaxBrackets() {
  const url = 'https://www.irs.gov/filing/federal-income-tax-rates-and-brackets';
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);
  const results = [];

  $('table tbody tr').each((i, row) => {
    const cells = $(row).find('td').map((i, el) => $(el).text().trim()).get();

    if (cells.length >= 3) {
      results.push({
        filingStatus: sanitize(cells[0]),
        incomeRange: sanitize(cells[1]),
        taxRate: sanitize(cells[2]),
      });
    }
  });

  const outputDir = path.join(__dirname, '../data');
  const outputPath = path.join(outputDir, 'federal_tax_brackets.json');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`✅ Saved ${results.length} cleaned tax brackets to ${outputPath}`);
}

// Helper function to remove $, %, and commas from a string
function sanitize(str) {
  return str.replace(/[\$,%,]/g, '').trim();
}

scrapeTaxBrackets().catch(console.error);
