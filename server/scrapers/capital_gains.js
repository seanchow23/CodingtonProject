const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');


/**
 * Remove unwanted characters from the string
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
function sanitize(str) {
  return str.replace(/[$,%]/g, '').trim();
}

/**
 * Scrape capital gains tax rates from the IRS website
 */
async function scrapeCapitalGains() {
  // Get URL from environment variable
  const url = process.env.CAPITAL_GAINS_URL;
  console.log(`Fetching data from: ${url}`);
  
  try {
    // Fetch the page content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    console.log(`Successfully fetched page with status code: ${response.status}`);
    
    // Load the HTML with cheerio
    const $ = cheerio.load(response.data);
    
    // Print the page title for verification
    const pageTitle = $('title').text();
    console.log(`Page title: ${pageTitle}`);

    
    // Define filing statuses and their patterns
    const statuses = {
      'single': /single/i,
      'married': /married filing jointly|qualifying widow(?:er)?s?/i,
      'married_separately': /married filing separately/i,
      'head_of_household': /head of household/i
    };
    
    // Define rate patterns
    const ratePatterns = {
      0.0: /(0%|zero percent).*capital gain/i,
      0.15: /(15%|fifteen percent).*capital gain/i,
      0.2: /(20%|twenty percent).*capital gain/i
    };
    
    let results = [];
    
    // Find the main content
    const contentText = $('#block-irs-theme-content').text() || $('body').text();
    const paragraphs = contentText.split(/\n{2,}/).map(p => p.trim()).filter(p => p);
    
    console.log(`\nLooking for capital gains rate information...`);
    console.log(`Split content into ${paragraphs.length} paragraphs`);
    
    // First approach: Find paragraphs with rate information
    const rateParagraphs = [];
    
    paragraphs.forEach((paragraph, i) => {
      for (const [rate, pattern] of Object.entries(ratePatterns)) {
        if (pattern.test(paragraph)) {
          console.log(`\nFound ${parseFloat(rate) * 100}% rate information in paragraph ${i}`);
          console.log(`Excerpt: ${paragraph.substring(0, 150)}...`);
          rateParagraphs.push({ rate: parseFloat(rate), paragraph });
        }
      }
    });
    
    console.log(`Found ${rateParagraphs.length} paragraphs with rate information`);
    
    // Process rate paragraphs to extract filing status thresholds
    rateParagraphs.forEach(({ rate, paragraph }) => {
      console.log(`\nProcessing ${rate * 100}% rate paragraph...`);
      
      for (const [statusKey, statusPattern] of Object.entries(statuses)) {
        // Look for patterns like "single: $44,625"
        const statusMatch = paragraph.match(statusPattern);
        if (statusMatch) {
          // Look for a dollar amount in the same paragraph
          const amountMatches = paragraph.match(/\$([0-9,]+)/g);
          if (amountMatches) {
            // For each dollar amount found, check if it's in the right context
            for (const amountMatch of amountMatches) {
              const amount = parseInt(sanitize(amountMatch));
              if (!isNaN(amount)) {
                // Context check: Is the dollar amount close to the status?
                const statusPos = paragraph.search(statusPattern);
                const amountPos = paragraph.indexOf(amountMatch);
                
                // Consider it related if within 150 characters
                if (Math.abs(statusPos - amountPos) < 150) {
                  results.push({
                    filingStatus: statusKey,
                    incomeThreshold: amount,
                    rate: rate
                  });
                  console.log(`Extracted: ${statusKey}, $${amount}, Rate: ${rate}`);
                }
              }
            }
          }
        }
      }
    });
    
    // Second approach: Check tables
    if (results.length === 0) {
      console.log('\nTrying to find tables with tax rate information...');
      const tables = $('table');
      console.log(`Found ${tables.length} tables`);
      
      tables.each((i, table) => {
        console.log(`Analyzing table ${i+1}`);
        
        $(table).find('tr').each((j, row) => {
          const rowText = $(row).text().trim();
          console.log(`Row text: ${rowText.substring(0, 80)}...`);
          
          // Check if row contains rate information
          [0.0, 0.15, 0.2].forEach(rate => {
            const rateText = `${Math.round(rate * 100)}%`;
            if (rowText.includes(rateText)) {
              console.log(`Found ${rateText} rate in table row`);
              
              // Check for filing statuses
              for (const [statusKey, statusPattern] of Object.entries(statuses)) {
                if (statusPattern.test(rowText)) {
                  // Try to extract a dollar amount
                  const amountMatches = rowText.match(/\$([0-9,]+)/g);
                  if (amountMatches) {
                    for (const amountMatch of amountMatches) {
                      const amount = parseInt(sanitize(amountMatch));
                      if (!isNaN(amount)) {
                        results.push({
                          filingStatus: statusKey,
                          incomeThreshold: amount,
                          rate: rate
                        });
                        console.log(`Extracted from table: ${statusKey}, $${amount}, Rate: ${rate}`);
                      }
                    }
                  }
                }
              }
            }
          });
        });
      });
    }
    
    // Third approach: Look at page text and scan for patterns
    if (results.length === 0) {
      console.log('\nTrying final pattern scanning approach...');
      
      // Try to directly identify tax brackets from raw text
      [0.0, 0.15, 0.2].forEach(rate => {
        const rateText = `${Math.round(rate * 100)}%`;
        const rateRegex = new RegExp(`${rateText}`, 'g');
        let match;
        
        // Find all instances of the rate
        while ((match = rateRegex.exec(contentText)) !== null) {
          const contextStart = Math.max(0, match.index - 300);
          const contextEnd = Math.min(contentText.length, match.index + 300);
          const context = contentText.substring(contextStart, contextEnd);
          
          console.log(`\nAnalyzing context around ${rateText} mention:`);
          console.log(`Context excerpt: ${context.substring(0, 150)}...`);
          
          // Check for filing statuses in this context
          for (const [statusKey, statusPattern] of Object.entries(statuses)) {
            if (statusPattern.test(context)) {
              console.log(`Found ${statusKey} in context`);
              
              // Try to find dollar amounts
              const dollarRegex = /\$([0-9,]+)/g;
              let dollarMatch;
              
              while ((dollarMatch = dollarRegex.exec(context)) !== null) {
                const amount = parseInt(sanitize(dollarMatch[0]));
                if (!isNaN(amount) && amount >= 10000 && amount <= 1000000) {
                  results.push({
                    filingStatus: statusKey,
                    incomeThreshold: amount,
                    rate: rate
                  });
                  console.log(`Extracted from context: ${statusKey}, $${amount}, Rate: ${rate}`);
                }
              }
            }
          }
        }
      });
    }
    
    
    
    // Remove duplicates while preserving order
    const seen = new Set();
    const uniqueResults = results.filter(item => {
      const key = `${item.filingStatus}-${item.incomeThreshold}-${item.rate}`;
      if (!seen.has(key)) {
        seen.add(key);
        return true;
      }
      return false;
    });
    
    // Sort results by filing status and threshold
    uniqueResults.sort((a, b) => {
      if (a.filingStatus !== b.filingStatus) {
        return a.filingStatus.localeCompare(b.filingStatus);
      }
      return a.incomeThreshold - b.incomeThreshold;
    });
    
    // Save results to JSON file
    const outputDir = path.join(__dirname, '../data');
    const outputPath = path.join(outputDir, 'capital_gains.json');
    
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(uniqueResults, null, 2));
    
    console.log(`\n Saved ${uniqueResults.length} capital gains entries to ${outputPath}`);
    
    // Print the content for verification
    console.log('\nContent of capital_gains.json:');
    uniqueResults.forEach(item => {
      console.log(`${item.filingStatus}: $${item.incomeThreshold} at ${item.rate * 100}% rate`);
    });
    
    return uniqueResults;
  } catch (error) {
    console.error('Error during scraping:', error);
    
    // Return fallback values on error
    
    // Save fallback results
    const outputDir = path.join(__dirname, '../data');
    const outputPath = path.join(outputDir, 'capital_gains.json');
    
   
  }
}

// Run the scraper if executed directly
if (require.main === module) {
  scrapeCapitalGains().catch(console.error);
}

module.exports = scrapeCapitalGains;