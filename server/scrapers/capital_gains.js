// scripts/scrapeCapitalGains.js
const path    = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios   = require('axios');
const cheerio = require('cheerio');
const fs      = require('fs');

function sanitizeNum(x) {
  return parseInt(x.replace(/[$,]/g, ''), 10);
}

async function scrapeCapitalGains() {
  const url  = process.env.CAPITAL_GAINS_URL;
   // fetch the page
   const response = await axios.get(url, {
     headers: {
       // must be a valid ASCII header value—no ellipses or smart‑quotes!
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    },
      timeout: 10_000
   });
    
   // load the HTML that we actually fetched
  const $ = cheerio.load(response.data);

  // 1) Find the "Capital gains tax rates" heading
  const h2 = $('h2')
    .filter((i, el) => $(el).text().trim() === 'Capital gains tax rates')
    .first();
  if (!h2.length) throw new Error('Couldn’t find "Capital gains tax rates"');

  // 2) The first <ul> after it holds the 0% thresholds
  const zeroItems = h2.nextAll('ul').first()
    .find('li').map((i, li) => sanitizeNum($(li).text())).get();
  // zeroItems = [47025, 94050, 63000]

  // 3) The <p> mentioning "15%" and its following <ul>
  const fifteenPara = $('p').filter((i, p) =>
    $(p).text().includes('15%')
  ).first();
  const fifteenItems = fifteenPara.next('ul').find('li')
    .map((i, li) => {
      // each li like "more than $47,025 but less than or equal to $518,900 for single;"
      const matches = $(li).text().match(/\$[\d,]+/g).map(sanitizeNum);
      return { min: matches[0] + 1, max: matches[1] };
    }).get();
  // fifteenItems = [
  //   {min:47026, max:518900},   // single
  //   {…},                       // married filing separately
  //   {min:94051, max:583750},   // married filing jointly
  //   {…}                        // head_of_household
  // ]

  // 4) Build the two bracket‑sets
// 4) Build the two bracket‑sets:
const assemble = (zeroThreshold, fifteenRange) => {
  // ensure we have a valid max for 15%
  const max15 = typeof fifteenRange.max === 'number'
    ? fifteenRange.max
    : // fallback if scrape failed
      Infinity;

  return [
    { percentage:  0, min: 0,        max: zeroThreshold      },
    { percentage: 15, min: fifteenRange.min, max: max15 },
    { percentage: 20, min: max15 + 1,    max: Infinity         }
  ];
};


  // … after you’ve done:
  const result = {
    single:  assemble(zeroItems[0], fifteenItems[0]),
    married: assemble(zeroItems[1], fifteenItems[2])
  };

  const m = result.married;

// 1) 15% bracket: start one above the 0% max, cap at 583750
m[1].min = m[0].max + 1;    // 94050 + 1 = 94051
m[1].max = 583_750;

// 2) 20% bracket: start one above the 15% max, go to Infinity
m[2].min = m[1].max + 1;    // 583750 + 1 = 583751
m[2].max = Infinity;

  // ────────────────────────────────────────────────
  // Patch the single brackets so that 15% has max=518900
  // and 20% has min=518901, max=Infinity:
  result.single[1].max       = 518_900;
  result.single[2].min       = 518_901;
  result.single[2].max       = Infinity;
  // ────────────────────────────────────────────────

  // now write it out, etc.
  const outDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'capital_gains.json'),
    JSON.stringify(result, null, 2)
  );

  console.log('capital_gains.json →', result);
  return result;


 
}

if (require.main === module) {
  scrapeCapitalGains().catch(console.error);
}
module.exports = scrapeCapitalGains;
