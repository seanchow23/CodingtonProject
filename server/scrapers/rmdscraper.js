const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeRMDUniformTable() {
  const url = 'https://www.irs.gov/publications/p590b';
  console.log(`📥 Fetching IRS page: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    console.log('✅ Page loaded.');

    let rmdTable = [];

    const targetTable = $('table[summary*="Uniform Lifetime Table"]');

    if (targetTable.length === 0) {
      console.warn('⚠️ Could not find Uniform Lifetime Table.');
    } else {
      console.log(`✅ Found Uniform Lifetime Table.`);

      targetTable.find('tr').each((i, row) => {
        const cols = $(row).find('td');

        // Need at least 4 columns for Age/Divisor + Age/Divisor
        if (cols.length >= 4) {
          // Left side
          const ageLeft = parseInt($(cols[0]).text().trim());
          const divisorLeft = parseFloat($(cols[1]).text().trim());

          if (!isNaN(ageLeft) && !isNaN(divisorLeft)) {
            rmdTable.push({ age: ageLeft, divisor: divisorLeft });
            console.log(`📄 Left: Age ${ageLeft} - Divisor ${divisorLeft}`);
          }

          // Right side
          const ageRight = parseInt($(cols[2]).text().trim());
          const divisorRight = parseFloat($(cols[3]).text().trim());

          if (!isNaN(ageRight) && !isNaN(divisorRight)) {
            rmdTable.push({ age: ageRight, divisor: divisorRight });
            console.log(`📄 Right: Age ${ageRight} - Divisor ${divisorRight}`);
          }
        }
      });
    }

    if (rmdTable.length > 0) {
      const outputPath = path.join(__dirname, '../data/rmd_uniform_table.json');
      fs.writeFileSync(outputPath, JSON.stringify(rmdTable, null, 2));
      console.log(`✅ Saved RMD table to ${outputPath}`);
    } else {
      console.warn('⚠️ No RMD data extracted. Nothing saved.');
    }

    return rmdTable;

  } catch (error) {
    console.error('❌ Error scraping RMD table:', error.message);
  }
}

// Auto-run if called directly
if (require.main === module) {
  scrapeRMDUniformTable().catch(console.error);
}

module.exports = scrapeRMDUniformTable;
