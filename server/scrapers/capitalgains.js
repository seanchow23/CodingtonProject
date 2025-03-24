const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeCapitalGains() {
  const url = 'https://www.irs.gov/taxtopics/tc409';

  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    // Normalize and flatten all main text content
    const fullText = $('main').text().replace(/\s+/g, ' ').toLowerCase();

    const gains = [];

    // === 0% Bracket ===
    const zeroMatch = fullText.match(/0% rate applies[^$]*\$([\d,]+)[^$]*\$([\d,]+)[^$]*\$([\d,]+)/i);
    if (zeroMatch) {
      gains.push(
        { filingStatus: 'Single', incomeRange: `Up to $${zeroMatch[1]}`, taxRate: '0%' },
        { filingStatus: 'Married Filing Jointly', incomeRange: `Up to $${zeroMatch[2]}`, taxRate: '0%' }
      );
    } else {
      console.warn('⚠️ Could not extract 0% capital gains thresholds');
    }

    // === 15% Bracket ===
    const fifteenMatch = fullText.match(/15% rate applies[^$]*\$([\d,]+)[^$]*\$([\d,]+)[^$]*\$([\d,]+)/i);
    if (fifteenMatch) {
      const lower = "Over $47,025"; // mentioned earlier
      gains.push(
        { filingStatus: 'Single', incomeRange: `${lower} to $${fifteenMatch[1]}`, taxRate: '15%' },
        { filingStatus: 'Married Filing Jointly', incomeRange: `${lower} to $${fifteenMatch[2]}`, taxRate: '15%' }
      );
    } else {
      console.warn('⚠️ Could not extract 15% capital gains thresholds');
    }

    // === 20% Bracket ===
    const twentyMatch = fullText.match(/20% rate applies[^$]*exceeds \$([\d,]+)[^$]*exceeds \$([\d,]+)/i);
    if (twentyMatch) {
      gains.push(
        { filingStatus: 'Single', incomeRange: `Over $${twentyMatch[1]}`, taxRate: '20%' },
        { filingStatus: 'Married Filing Jointly', incomeRange: `Over $${twentyMatch[2]}`, taxRate: '20%' }
      );
    } else {
      console.warn('⚠️ Could not extract 20% capital gains thresholds');
    }

    if (!gains.length) throw new Error('No capital gains data found');

    const outDir = path.join(__dirname, '../data');
    const outPath = path.join(outDir, 'capital_gains.json');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(outPath, JSON.stringify(gains, null, 2));
    console.log(`✅ Scraped and saved ${gains.length} capital gains brackets to ${outPath}`);
  } catch (err) {
    console.error('❌ Failed to scrape capital gains data from IRS:', err.message);
  }
}

scrapeCapitalGains();
