import { WEBFLOW_ACCESS_TOKEN, WEBFLOW_COURSES_COLLECTION_ID, WEBFLOW_SITE_ID } from '../constants/env';

export interface WebflowCourse {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  location: string;
  price: string;
  holes: number;
  par: number;
  difficulty: number;
  rating: number;
  description?: string;
}

interface WebflowResponse<T> {
  items: Array<{
    id: string;
    fieldData: T;
  }>;
  pagination: {
    count: number;
    offset: number;
    total: number;
  };
}

interface WebflowFieldData {
  name: string;
  slug: string;
  'course-image': {
    url: string;
    alt: string | null;
  };
  location?: string;
  price?: string;
  'number-of-holes': number;
  par: number;
  difficulty: number;
  rating?: number;
  description?: string;
}

const headers = {
  'Authorization': `Bearer ${WEBFLOW_ACCESS_TOKEN}`,
  'accept-version': '2.0.0',
  'Content-Type': 'application/json'
};

function processWebflowCourse(id: string, fieldData: WebflowFieldData): WebflowCourse {
  const imageUrl = fieldData['course-image']?.url || '';
  // Add cdn.webflow.com to relative URLs
  const processedImageUrl = imageUrl.startsWith('/')
    ? `https://cdn.webflow.com${imageUrl}`
    : imageUrl;

  return {
    _id: id,
    name: fieldData.name,
    slug: fieldData.slug,
    imageUrl: processedImageUrl,
    location: fieldData.location || 'Location coming soon',
    price: fieldData.price || '$$$',
    holes: fieldData['number-of-holes'] || 18,
    par: fieldData.par || 72,
    difficulty: fieldData.difficulty || 3,
    rating: fieldData.rating || 0,
    description: fieldData.description
  };
}

export async function fetchCourses(): Promise<WebflowCourse[]> {
  try {
    if (!WEBFLOW_ACCESS_TOKEN || !WEBFLOW_COURSES_COLLECTION_ID || !WEBFLOW_SITE_ID) {
      throw new Error('Missing required environment variables');
    }

    console.log('Fetching courses with token:', WEBFLOW_ACCESS_TOKEN?.substring(0, 10) + '...');
    console.log('Site ID:', WEBFLOW_SITE_ID);
    console.log('Collection ID:', WEBFLOW_COURSES_COLLECTION_ID);

    // First verify API access by checking sites
    const sitesResponse = await fetch('https://api.webflow.com/v2/sites', { headers });
    if (!sitesResponse.ok) {
      const errorText = await sitesResponse.text();
      console.error('Webflow API Error (sites):', {
        status: sitesResponse.status,
        statusText: sitesResponse.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${sitesResponse.status}`);
    }

    // Then fetch courses from the collection
    const response = await fetch(
      `https://api.webflow.com/v2/collections/${WEBFLOW_COURSES_COLLECTION_ID}/items`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webflow API Error (courses):', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as WebflowResponse<WebflowFieldData>;
    console.log(`Found ${data.items.length} courses`);

    return data.items.map(item => processWebflowCourse(item.id, item.fieldData));
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}

export async function fetchCourseById(courseId: string): Promise<WebflowCourse | null> {
  try {
    const response = await fetch(
      `https://api.webflow.com/v2/collections/${WEBFLOW_COURSES_COLLECTION_ID}/items/${courseId}`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webflow API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return processWebflowCourse(data.id, data.fieldData);
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    throw error;
  }
} 