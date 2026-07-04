const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const generateStaticSite = require('./scripts/generate');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'database/db.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve Admin UI at /admin
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve Static Frontend Website at root (checking both root index.html and website/ index.html)
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'website')));

// Helper to read database
function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Helper to write database
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ==========================================
// REST API ENDPOINTS FOR LOCAL ADMIN CMS
// ==========================================

// GET master database
app.get('/api/data', (req, res) => {
  try {
    const db = readDB();
    res.json(db);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read database' });
  }
});

// POST to update entire database or trigger static generation
app.post('/api/data', (req, res) => {
  try {
    writeDB(req.body);
    // Auto-generate static files whenever data is saved
    generateStaticSite();
    res.json({ success: true, message: 'Database saved and static files regenerated successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save database' });
  }
});

// POST endpoint specifically to trigger static generator script
app.post('/api/generate', (req, res) => {
  try {
    const success = generateStaticSite();
    if (success) {
      res.json({ success: true, message: 'Static HTML/JS data files regenerated successfully!' });
    } else {
      res.status(500).json({ success: false, message: 'Generation failed during compilation.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start local server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🌐 Winsteel CMS Server Running at: http://localhost:${PORT}`);
  console.log(`🎛️  Admin Portal URL           : http://localhost:${PORT}/admin`);
  console.log(`📄 Public Static Site Preview  : http://localhost:${PORT}`);
  console.log('====================================================');
  
  // Run initial static generation on server startup
  generateStaticSite();
});
