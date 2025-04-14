const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

function sanitize(str) {
  // Improved sanitization to handle different formats
  return str.replace(/[$,%]/g, '').replace(/\s+/g, ' ').trim();
}

async function scrapeStandardDeductions() {
  const url = process.env.STANDARD_DEDUCTIONS_URL || 'https://www.irs.gov/publications/p17#en_US_2024_publink1000283782';
  console.log(`Fetching data from: ${url}`);
  
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    const $ = cheerio.load(html);
    const results = [];
    
    // Find the element containing "Table 10-1" text and locate the table
    let targetTable;
    
    // First approach: Look for the table caption or heading
    $('h4, h3, h2, p, caption').each((i, element) => {
      const text = $(element).text().trim();
      if (text.includes('Table 10-1') && text.includes('Standard Deduction')) {
        targetTable = $(element).next('table');
        if (!targetTable.length) {
          // Try looking for the table within parent elements
          targetTable = $(element).closest('div, section').find('table').first();
        }
        if (targetTable.length) {
          console.log(`Found Table 10-1 using heading/caption`);
          return false; // break the loop
        }
      }
    });
    
    // Second approach: Try finding the table by its content
    if (!targetTable || !targetTable.length) {
      $('table').each((i, table) => {
        const tableText = $(table).text();
        if (
          tableText.includes('Filing Status') && 
          tableText.includes('Standard Deduction') &&
          (tableText.includes('Single') || tableText.includes('Married'))
        ) {
          targetTable = $(table);
          console.log(`Found Standard Deduction table by content`);
          return false; // break the loop
        }
      });
    }
    
    if (targetTable && targetTable.length) {
      // Process the table
      $(targetTable).find('tr').each((i, row) => {
        // Skip header row
        if (i === 0) return;
        
        const cells = $(row).find('td, th');
        if (cells.length >= 2) {
          const status = sanitize($(cells[0]).text());
          const deductionText = sanitize($(cells[1]).text());
          
          // Convert the deduction text to a number
          let deduction;
          if (deductionText.match(/^\d+$/)) {
            deduction = parseInt(deductionText, 10);
          } else {
            // Handle potential text variations
            const match = deductionText.match(/(\d+)/);
            deduction = match ? parseInt(match[1], 10) : NaN;
          }
          
          if (status && !isNaN(deduction)) {
            results.push({
              filingStatus: status,
              standardDeduction: deduction,
            });
          }
        }
      });
    } else {
      console.log('⚠️ Could not find the Standard Deduction table');
      
      // Fallback: Extract data from any table that might contain standard deductions
      console.log('Attempting fallback extraction...');
      $('table').each((i, table) => {
        const tableHtml = $(table).html();
        const tableText = $(table).text();
        
        if (tableText.includes('Filing Status') || tableText.includes('Single') || tableText.includes('Married')) {
          console.log(`Checking table ${i+1}...`);
          
          $(table).find('tr').each((j, row) => {
            const cells = $(row).find('td, th');
            if (cells.length >= 2) {
              const status = sanitize($(cells[0]).text());
              const deductionText = sanitize($(cells[1]).text());
              
              // Skip headers or empty rows
              if (!status || status === 'Filing Status') return;
              
              // Try to extract a number
              const match = deductionText.match(/(\d+)/);
              const deduction = match ? parseInt(match[1], 10) : NaN;
              
              if (status && !isNaN(deduction)) {
                results.push({
                  filingStatus: status,
                  standardDeduction: deduction,
                });
              }
            }
          });
        }
      });
    }
    
    if (results.length === 0) {
      console.log('⚠️ No standard deduction data found. Check the HTML structure:');
      // Log table structures for debugging
      $('table').each((i, table) => {
        console.log(`Table ${i+1} structure:`, $(table).find('tr:first-child').text().trim());
      });
    } else {
      console.log(`Found ${results.length} standard deduction entries`);
    }
    
    const outputDir = path.join(__dirname, '../data');
    const outputPath = path.join(outputDir, 'standard_deductions.json');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\nSaved ${results.length} entries to ${outputPath}`);
    
    results.forEach((entry) => {
      console.log(`${entry.filingStatus}: $${entry.standardDeduction}`);
    });
    
    return results;
  } catch (err) {
    console.error('Error scraping standard deductions:', err.message);
    console.error(err.stack);
    throw err;
  }
}

// Run the scraper if executed directly
if (require.main === module) {
  scrapeStandardDeductions().catch(console.error);
}

module.exports = scrapeStandardDeductions;