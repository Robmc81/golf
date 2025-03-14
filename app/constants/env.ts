// Access environment variables with their EXPO_PUBLIC_ prefix
export const WEBFLOW_ACCESS_TOKEN = process.env.EXPO_PUBLIC_WEBFLOW_ACCESS_TOKEN || '';
export const WEBFLOW_SITE_ID = process.env.EXPO_PUBLIC_WEBFLOW_SITE_ID || '';
export const WEBFLOW_COURSES_COLLECTION_ID = process.env.EXPO_PUBLIC_WEBFLOW_COURSES_COLLECTION_ID || '';

// Validate environment variables are set
if (!WEBFLOW_ACCESS_TOKEN || !WEBFLOW_SITE_ID || !WEBFLOW_COURSES_COLLECTION_ID) {
  console.error('Missing required environment variables:', {
    WEBFLOW_ACCESS_TOKEN: !!WEBFLOW_ACCESS_TOKEN,
    WEBFLOW_SITE_ID: !!WEBFLOW_SITE_ID,
    WEBFLOW_COURSES_COLLECTION_ID: !!WEBFLOW_COURSES_COLLECTION_ID
  });
} 