require('dotenv').config();

const accessToken = process.env.EXPO_PUBLIC_WEBFLOW_ACCESS_TOKEN;
const collectionId = process.env.EXPO_PUBLIC_WEBFLOW_COURSES_COLLECTION_ID;
const siteId = process.env.EXPO_PUBLIC_WEBFLOW_SITE_ID;

console.log('Testing Webflow Integration');
console.log('-------------------------');
console.log('Environment Variables:');
console.log(`Access Token: ${accessToken ? '✓ Present' : '✗ Missing'}`);
console.log(`Site ID: ${siteId ? '✓ Present' : '✗ Missing'}`);
console.log(`Collection ID: ${collectionId ? '✓ Present' : '✗ Missing'}`);

async function test() {
  try {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'accept-version': '2.0.0',
      'Content-Type': 'application/json'
    };

    // Test sites endpoint
    const sitesResponse = await fetch('https://api.webflow.com/v2/sites', { headers });
    console.log('\nSites Response Status:', sitesResponse.status);
    
    if (!sitesResponse.ok) {
      const error = await sitesResponse.text();
      throw new Error(`Sites API Error: ${error}`);
    }

    // Test collections endpoint
    const coursesResponse = await fetch(
      `https://api.webflow.com/v2/collections/${collectionId}/items`,
      { headers }
    );
    console.log('Courses Response Status:', coursesResponse.status);

    if (!coursesResponse.ok) {
      const error = await coursesResponse.text();
      throw new Error(`Courses API Error: ${error}`);
    }

    const data = await coursesResponse.json();
    console.log(`Found ${data.items?.length || 0} courses`);
    console.log('Success!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test(); 