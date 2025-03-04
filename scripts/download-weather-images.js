const https = require('https');
const fs = require('fs');
const path = require('path');

const images = {
  sunny: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
  rainy: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
  cloudy: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
  storm: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
  foggy: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'
};

const weatherDir = path.join(__dirname, '../assets/images/weather');

// Create directory if it doesn't exist
if (!fs.existsSync(weatherDir)) {
  fs.mkdirSync(weatherDir, { recursive: true });
}

// Download each image
Object.entries(images).forEach(([condition, url]) => {
  const filePath = path.join(weatherDir, `${condition}.jpg`);
  
  https.get(url, (response) => {
    if (response.statusCode === 200) {
      response.pipe(fs.createWriteStream(filePath))
        .on('error', (err) => {
          console.error(`Error downloading ${condition} image:`, err);
        })
        .on('finish', () => {
          console.log(`Downloaded ${condition} image`);
        });
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${condition} image:`, err);
  });
}); 