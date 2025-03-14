import { useQuery } from '@tanstack/react-query';
import { fetchCourseById } from '../lib/webflow';

export function useCourseDetails(courseId?: string) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseId ? fetchCourseById(courseId) : null,
    enabled: !!courseId,
  });
} 