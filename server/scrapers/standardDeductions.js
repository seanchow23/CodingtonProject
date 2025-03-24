const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeStandardDeductions() {
  const url = 'https://www.irs.gov/publications/p17'; // Pub 17 main page

  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const deductions = [];

    // Look for a table related to standard deductions
    $('table').each((i, table) => {
      const heading = $(table).prev('h3,h2,h4').text().toLowerCase();
      if (heading.includes('standard deduction')) {
        $(table).find('tbody tr').each((_, row) => {
          const cells = $(row).find('td').map((_, el) => $(el).text().trim()).get();

          if (cells.length >= 2) {
            const status = cells[0].toLowerCase();
            const amount = parseInt(cells[1].replace(/[^0-9]/g, ''), 10);

            if (amount && (status.includes('single') || status.includes('married'))) {
              deductions.push({
                filingStatus: status.includes('married') ? 'married' : 'single',
                deduction: amount
              });
            }
          }
        });
      }
    });

    if (deductions.length === 0) {
      // fallback in case IRS page format changes
      deductions.push({ filingStatus: 'single', deduction: 13850 });
      deductions.push({ filingStatus: 'married', deduction: 27700 });
      console.warn('⚠️ Using fallback standard deduction values');
    }

    const outputDir = path.join(__dirname, '../data');
    const outputPath = path.join(outputDir, 'standard_deductions.json');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(deductions, null, 2));
    console.log(`✅ Saved standard deductions to ${outputPath}`);
  } catch (err) {
    console.error('❌ Failed to scrape standard deductions:', err.message);
  }
}

scrapeStandardDeductions();
