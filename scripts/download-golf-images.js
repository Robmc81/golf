const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
  {
    url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&h=800&fit=crop',
    filename: 'east-lake.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&h=800&fit=crop',
    filename: 'atlanta-athletic.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&h=800&fit=crop',
    filename: 'bobby-jones.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&h=800&fit=crop',
    filename: 'tpc-sugarloaf.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&h=800&fit=crop',
    filename: 'chastain-park.jpg'
  }
];

const outputDir = path.join(__dirname, '../assets/images/golf-courses');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

images.forEach(({ url, filename }) => {
  const outputPath = path.join(outputDir, filename);
  
  https.get(url, (response) => {
    if (response.statusCode === 200) {
      response.pipe(fs.createWriteStream(outputPath));
      console.log(`Downloaded: ${filename}`);
    } else {
      console.error(`Failed to download ${filename}: ${response.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${filename}:`, err);
  });
}); 