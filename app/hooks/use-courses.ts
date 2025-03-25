import { useQuery } from '@tanstack/react-query';
import { fetchCourses } from '../lib/webflow';
import { Platform } from 'react-native';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      try {
        console.log(`Fetching courses on ${Platform.OS}...`);
        const courses = await fetchCourses();
        console.log(`Successfully fetched ${courses.length} courses`);
        return courses;
      } catch (error) {
        console.error('Error in useCourses hook:', {
          error,
          platform: Platform.OS,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
} 