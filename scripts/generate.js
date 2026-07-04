const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/db.json');
const OUTPUT_JS_PATH = path.join(__dirname, '../js/data.js');
const OUTPUT_JSON_PATH = path.join(__dirname, '../data/winsteel.json');

// Also keep a copy in website/ folder just in case
const ALT_JS_PATH = path.join(__dirname, '../website/js/data.js');
const ALT_JSON_PATH = path.join(__dirname, '../website/data/winsteel.json');

function generateStaticData() {
  console.log('🔄 Starting Winsteel Static Website Generation...');

  try {
    const rawData = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(rawData);

    // Create target directories if not present
    fs.mkdirSync(path.dirname(OUTPUT_JS_PATH), { recursive: true });
    fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
    try {
      fs.mkdirSync(path.dirname(ALT_JS_PATH), { recursive: true });
      fs.mkdirSync(path.dirname(ALT_JSON_PATH), { recursive: true });
    } catch (e) {}

    const jsContent = `/**
 * AUTO-GENERATED STATIC DATA BUNDLE FOR WINSTEEL WEBSITE
 * Generated on: ${new Date().toISOString()}
 * This file allows the HTML/CSS/JS frontend to run 100% offline without live API servers.
 */
window.WINSTEEL_DATA = ${JSON.stringify(db, null, 2)};
`;

    // Write to root js folder
    fs.writeFileSync(OUTPUT_JS_PATH, jsContent, 'utf-8');
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(db, null, 2), 'utf-8');

    // Write to alternate folder
    try {
      fs.writeFileSync(ALT_JS_PATH, jsContent, 'utf-8');
      fs.writeFileSync(ALT_JSON_PATH, JSON.stringify(db, null, 2), 'utf-8');
    } catch (e) {}

    console.log('✅ Successfully compiled master database into static site!');
    console.log(`📁 JS Bundle Output: ${OUTPUT_JS_PATH}`);
    console.log(`📊 Generated Statistics:`);
    console.log(`   - Projects: ${db.projects ? db.projects.length : 0}`);
    console.log(`   - Products: ${db.products ? db.products.length : 0}`);
    console.log(`   - News Articles: ${db.news ? db.news.length : 0}`);
    console.log(`   - Facilities: ${db.facilities ? db.facilities.length : 0}`);
    console.log('🚀 Your static website is ready for deployment without any API dependencies!');
    return true;
  } catch (error) {
    console.error('❌ Error generating static data:', error.message);
    return false;
  }
}

if (require.main === module) {
  generateStaticData();
}

module.exports = generateStaticData;
