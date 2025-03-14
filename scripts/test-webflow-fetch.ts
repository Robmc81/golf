import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const accessToken = process.env.EXPO_PUBLIC_WEBFLOW_ACCESS_TOKEN;
const collectionId = process.env.EXPO_PUBLIC_WEBFLOW_COURSES_COLLECTION_ID;
const siteId = process.env.EXPO_PUBLIC_WEBFLOW_SITE_ID;

async function testWebflowFetch() {
  try {
    console.log('Testing Webflow Integration');
    console.log('-------------------------');
    console.log('Environment Variables:');
    console.log(`Access Token: ${accessToken ? '✓ Present' : '✗ Missing'}`);
    console.log(`Site ID: ${siteId ? '✓ Present' : '✗ Missing'}`);
    console.log(`Collection ID: ${collectionId ? '✓ Present' : '✗ Missing'}`);
    console.log('-------------------------');

    if (!accessToken || !collectionId || !siteId) {
      throw new Error('Missing required environment variables');
    }

    // First test the sites endpoint
    console.log('Testing API access by listing sites...');
    const sitesUrl = 'https://api.webflow.com/v2/sites';
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'accept-version': '2.0.0',
      'Content-Type': 'application/json'
    };

    console.log('Request URL:', sitesUrl);
    console.log('Headers:', { 
      Authorization: `Bearer ${accessToken.substring(0, 10)}...`,
      'accept-version': headers['accept-version']
    });

    const sitesResponse = await fetch(sitesUrl, { headers });
    
    const sitesResponseHeaders: Record<string, string> = {};
    sitesResponse.headers.forEach((value: string, key: string) => {
      sitesResponseHeaders[key] = value;
    });

    console.log('\nSites Response:');
    console.log('Status:', sitesResponse.status);
    console.log('Headers:', sitesResponseHeaders);

    if (!sitesResponse.ok) {
      const errorBody = await sitesResponse.text();
      console.log('Error response body:', errorBody);
      throw new Error(`HTTP error! status: ${sitesResponse.status}`);
    }

    const sitesData = await sitesResponse.json();
    console.log('Sites found:', sitesData.sites?.length || 0);
    
    if (sitesData.sites?.length > 0) {
      console.log('\nAccessible sites:');
      sitesData.sites.forEach((site: any) => {
        console.log({
          id: site.id,
          name: site.displayName,
          lastUpdated: site.lastUpdated
        });
      });
      
      const ourSite = sitesData.sites.find((site: any) => site.id === siteId);
      if (ourSite) {
        console.log('\nFound our site:', {
          id: ourSite.id,
          name: ourSite.displayName,
          lastUpdated: ourSite.lastUpdated
        });
      } else {
        console.log('\n⚠️ Our site ID not found in accessible sites - please update EXPO_PUBLIC_WEBFLOW_SITE_ID');
      }
    }

    // If sites endpoint works, proceed to test collections
    console.log('\nFetching courses collection...');
    const url = `https://api.webflow.com/v2/collections/${collectionId}/items`;

    console.log('Request URL:', url);
    const response = await fetch(url, { headers });
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value: string, key: string) => {
      responseHeaders[key] = value;
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', responseHeaders);

    if (!response.ok) {
      const errorBody = await response.text();
      console.log('Error response body:', errorBody);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data structure:', Object.keys(data));
    console.log(`Found ${data.items?.length || 0} courses`);
    
    if (data.items?.length > 0) {
      console.log('\nSample Course Data:');
      const sample = data.items[0];
      console.log('Raw sample:', JSON.stringify(sample, null, 2));
      
      // Process the nested fieldData structure
      const { fieldData } = sample;
      console.log('Processed sample:', {
        name: fieldData.name,
        location: fieldData.location || 'Location coming soon',
        price: fieldData.price || '$$$',
        holes: fieldData['number-of-holes'] || 18,
        par: fieldData.par || 72,
        difficulty: fieldData.difficulty || 3,
        rating: fieldData.rating,
        hasImage: !!fieldData['course-image']?.url,
        imageUrl: fieldData['course-image']?.url,
        slug: fieldData.slug
      });
    }

    console.log('\n✓ Test completed successfully');
  } catch (error) {
    console.log('\n✗ Test failed:', error);
    if (error instanceof Error) {
      console.log('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    process.exit(1);
  }
}

// Ensure unhandled promise rejections are caught
process.on('unhandledRejection', (error) => {
  console.log('Unhandled Promise Rejection:', error);
  process.exit(1);
});

testWebflowFetch(); 