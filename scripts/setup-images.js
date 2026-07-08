const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\Sandesh\\.gemini\\antigravity-ide\\brain\\73e5ed8d-e312-4120-89ff-cb617632f55f';
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const WEB_UPLOADS_DIR = path.join(__dirname, '../website/uploads');
const DB_PATH = path.join(__dirname, '../database/db.json');

const imageMappings = [
  { srcName: 'hero_gantry_1783486340971.png', destName: 'hero-gantry.png' },
  { srcName: 'about_factory_1783486350743.png', destName: 'about-factory.png' },
  { srcName: 'cnc_cutting_1783486360692.png', destName: 'cnc-cutting.png' },
  { srcName: 'robotic_welding_1783486372003.png', destName: 'robotic-welding.png' },
  { srcName: 'hydraulic_forming_1783486390938.png', destName: 'hydraulic-forming.png' },
  { srcName: 'crane_handling_1783486401196.png', destName: 'crane-handling.png' },
  { srcName: 'metro_viaduct_1783486410884.png', destName: 'metro-viaduct.png' },
  { srcName: 'river_bridge_1783486420515.png', destName: 'river-bridge.png' }
];

function setupImages() {
  console.log('🔄 Setting up local industrial images...');
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.mkdirSync(WEB_UPLOADS_DIR, { recursive: true });

  for (const map of imageMappings) {
    const srcPath = path.join(ARTIFACTS_DIR, map.srcName);
    const destPath1 = path.join(UPLOADS_DIR, map.destName);
    const destPath2 = path.join(WEB_UPLOADS_DIR, map.destName);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath1);
      fs.copyFileSync(srcPath, destPath2);
      console.log(`✅ Copied ${map.destName}`);
    } else {
      console.error(`❌ Source not found: ${srcPath}`);
    }
  }

  // Now update database/db.json to use these local images!
  if (fs.existsSync(DB_PATH)) {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

    if (db.hero) db.hero.bgImage = 'uploads/hero-gantry.png';
    if (db.about) db.about.image = 'uploads/about-factory.png';

    if (db.facilities) {
      db.facilities.forEach(f => {
        if (f.id === 'fac-1') f.image = 'uploads/cnc-cutting.png';
        if (f.id === 'fac-2') f.image = 'uploads/hydraulic-forming.png';
        if (f.id === 'fac-3') f.image = 'uploads/crane-handling.png';
        if (f.id === 'fac-4') f.image = 'uploads/robotic-welding.png';
        if (f.id === 'fac-5') f.image = 'uploads/about-factory.png';
      });
    }

    if (db.projects) {
      db.projects.forEach(p => {
        if (p.id === 'proj-1') p.image = 'uploads/metro-viaduct.png';
        if (p.id === 'proj-2') p.image = 'uploads/river-bridge.png';
        if (p.id === 'proj-3') p.image = 'uploads/crane-handling.png';
        if (p.id === 'proj-4') p.image = 'uploads/metro-viaduct.png';
        if (p.id === 'proj-5') p.image = 'uploads/river-bridge.png';
        if (p.id === 'proj-6') p.image = 'uploads/hero-gantry.png';
      });
    }

    if (db.products) {
      db.products.forEach(p => {
        if (p.id === 'prod-1') p.image = 'uploads/hero-gantry.png';
        if (p.id === 'prod-2') p.image = 'uploads/river-bridge.png';
        if (p.id === 'prod-3') p.image = 'uploads/hydraulic-forming.png';
        if (p.id === 'prod-4') p.image = 'uploads/metro-viaduct.png';
        if (p.id === 'prod-5') p.image = 'uploads/robotic-welding.png';
        if (p.id === 'prod-6') p.image = 'uploads/crane-handling.png';
      });
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log('✅ Updated database/db.json with local industrial image paths!');
  }
}

setupImages();
