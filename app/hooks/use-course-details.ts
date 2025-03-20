import { useState, useEffect } from 'react';
import { fetchCourseById } from '../lib/webflow';

export interface Course {
  _id: string;
  name: string;
  location: string;
  description?: string;
  imageUrl: string;
  holes: number;
  par: number;
  difficulty: number;
  price: string;
}

interface CourseDetailsHook {
  data: Course | null;
  isLoading: boolean;
  isError: boolean;
}

export function useCourseDetails(courseId?: string): CourseDetailsHook {
  const [data, setData] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setIsError(false);

        const course = await fetchCourseById(courseId);
        setData(course);
      } catch (error) {
        console.error('Error fetching course details:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  return { data, isLoading, isError };
} 