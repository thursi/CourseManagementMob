import {useSelector, useDispatch} from 'react-redux';
import {
  loadCoursesRequest,
  addCourseRequest,
  enrollInCourseRequest,
  updateCourseRequest,
  deleteCourseRequest,
  loadEnrolledCoursesRequest,
  clearCourseError,
  Course,
} from '../../features/course/courseSlice';
import {useCallback} from 'react';
import {RootState} from '../../store/reducer';

export function useCourses() {
  const dispatch = useDispatch();

  const enrolledCourses = useSelector(
    (state: RootState) => state.course.enrolledCourses,
  );

  const loadCourses = useCallback(() => {
    dispatch(loadCoursesRequest());
  }, [dispatch]);

  const addCourse = useCallback(
    (courseData: Omit<Course, 'id' | 'enrolledStudents' | 'createdAt'>) => {
      dispatch(addCourseRequest(courseData));
    },
    [dispatch],
  );

  const enrollInCourse = useCallback(
    (courseId: string, studentId: string) => {
      dispatch(enrollInCourseRequest({courseId, studentId}));
    },
    [dispatch],
  );

  const updateCourse = useCallback(
    (courseId: string, updates: Partial<Course>) => {
      dispatch(updateCourseRequest({courseId, updates}));
    },
    [dispatch],
  );

  const deleteCourse = useCallback(
    (courseId: string) => {
      dispatch(deleteCourseRequest(courseId));
    },
    [dispatch],
  );

  const loadEnrolledCourses = useCallback(
    (studentId: string) => {
      dispatch(loadEnrolledCoursesRequest(studentId));
    },
    [dispatch],
  );

  const clearError = useCallback(() => {
    dispatch(clearCourseError());
  }, [dispatch]);

  return {
    enrolledCourses,
    loadCourses,
    addCourse,
    enrollInCourse,
    updateCourse,
    deleteCourse,
    loadEnrolledCourses,
    clearError,
  };
}
