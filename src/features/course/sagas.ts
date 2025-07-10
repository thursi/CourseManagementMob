import {call, put, takeLatest, select} from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import {
  loadCoursesRequest,
  loadCoursesSuccess,
  loadCoursesFailure,
  addCourseRequest,
  addCourseSuccess,
  addCourseFailure,
  enrollInCourseRequest,
  enrollInCourseSuccess,
  enrollInCourseFailure,
  updateCourseRequest,
  updateCourseSuccess,
  updateCourseFailure,
  deleteCourseRequest,
  deleteCourseSuccess,
  deleteCourseFailure,
  loadEnrolledCoursesRequest,
  loadEnrolledCoursesSuccess,
  loadEnrolledCoursesFailure,
  Course,
} from './courseSlice';

import {RootState} from 'store/reducer';
import {baseURL} from 'config';

const STORAGE_KEY = 'courseCompassCourses';

const initialCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to JavaScript',
    description: 'Learn the fundamentals of JavaScript programming language.',
    instructor: 'Jane Smith',
    instructorId: '2',
    content: 'This course covers variables, functions, objects, and more.',
    enrolledStudents: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'React Development',
    description: 'Build modern web applications with React.',
    instructor: 'Jane Smith',
    instructorId: '2',
    content: 'Learn components, hooks, state management, and more.',
    enrolledStudents: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Python for Beginners',
    description: 'Start your programming journey with Python.',
    instructor: 'Jane Smith',
    instructorId: '2',
    content: 'Learn Python syntax, data structures, and problem solving.',
    enrolledStudents: [],
    createdAt: new Date().toISOString(),
  },
];

function* loadCoursesSaga() {
  try {
    const response = yield call(axios.get, `${baseURL}courses`);
    yield put(loadCoursesSuccess(response.data));
  } catch (apiError) {
    try {
      const storedCoursesString: string | null = yield call(
        [AsyncStorage, 'getItem'],
        STORAGE_KEY,
      );

      let courses: Course[] = storedCoursesString
        ? JSON.parse(storedCoursesString)
        : initialCourses;

      if (!storedCoursesString) {
        yield call(
          [AsyncStorage, 'setItem'],
          STORAGE_KEY,
          JSON.stringify(initialCourses),
        );
      }

      yield put(loadCoursesSuccess(courses));
    } catch (error: any) {
      yield put(loadCoursesFailure(error.message || 'Failed to load courses'));
    }
  }
}

function* addCourseSaga(action: ReturnType<typeof addCourseRequest>) {
  try {
    const token = yield call([AsyncStorage, 'getItem'], 'token');
    const response = yield call(
      axios.post,
      `${baseURL}courses`,
      action.payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    yield put(addCourseSuccess(response.data));
  } catch (apiError) {
    try {
      const newCourse: Course = {
        ...action.payload,
        id: Date.now().toString(),
        enrolledStudents: [],
        createdAt: new Date().toISOString(),
      };

      const currentCourses: Course[] = yield select(
        (state: RootState) => state.course.courses,
      );
      const updatedCourses = [...currentCourses, newCourse];

      yield call(
        [AsyncStorage, 'setItem'],
        STORAGE_KEY,
        JSON.stringify(updatedCourses),
      );
      yield put(addCourseSuccess(newCourse));
    } catch (error: any) {
      yield put(addCourseFailure(error.message || 'Failed to add course'));
    }
  }
}

function* enrollInCourseSaga(action: ReturnType<typeof enrollInCourseRequest>) {
  try {
    const token = yield call([AsyncStorage, 'getItem'], 'token');
    yield call(
      axios.post,
      `${baseURL}courses/${action.payload.courseId}/enroll`,
      {studentId: action.payload.studentId},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    yield put(enrollInCourseSuccess(action.payload));
  } catch (apiError) {
    try {
      const {courseId, studentId} = action.payload;

      const currentCourses: Course[] = yield select(
        (state: RootState) => state.course.courses,
      );

      const updatedCourses = currentCourses.map(course =>
        course.id === courseId && !course.enrolledStudents.includes(studentId)
          ? {
              ...course,
              enrolledStudents: [...course.enrolledStudents, studentId],
            }
          : course,
      );

      yield call(
        [AsyncStorage, 'setItem'],
        STORAGE_KEY,
        JSON.stringify(updatedCourses),
      );
      yield put(enrollInCourseSuccess({courseId, studentId}));
    } catch (error: any) {
      yield put(
        enrollInCourseFailure(error.message || 'Failed to enroll in course'),
      );
    }
  }
}

function* updateCourseSaga(action: ReturnType<typeof updateCourseRequest>) {
  try {
    const token = yield call([AsyncStorage, 'getItem'], 'token');
    yield call(
      axios.put,
      `${baseURL}courses/${action.payload.courseId}`,
      action.payload.updates,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    yield put(updateCourseSuccess(action.payload));
  } catch (apiError) {
    try {
      const {courseId, updates} = action.payload;
      const currentCourses: Course[] = yield select(
        (state: RootState) => state.course.courses,
      );

      const updatedCourses = currentCourses.map(course =>
        course.id === courseId ? {...course, ...updates} : course,
      );

      yield call(
        [AsyncStorage, 'setItem'],
        STORAGE_KEY,
        JSON.stringify(updatedCourses),
      );
      yield put(updateCourseSuccess({courseId, updates}));
    } catch (error: any) {
      yield put(
        updateCourseFailure(error.message || 'Failed to update course'),
      );
    }
  }
}

function* deleteCourseSaga(action: ReturnType<typeof deleteCourseRequest>) {
  try {
    const token = yield call([AsyncStorage, 'getItem'], 'token');
    yield call(axios.delete, `${baseURL}courses/${action.payload}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    yield put(deleteCourseSuccess(action.payload));
  } catch (apiError) {
    try {
      const courseId = action.payload;
      const currentCourses: Course[] = yield select(
        (state: RootState) => state.course.courses,
      );

      const updatedCourses = currentCourses.filter(
        course => course.id !== courseId,
      );

      yield call(
        [AsyncStorage, 'setItem'],
        STORAGE_KEY,
        JSON.stringify(updatedCourses),
      );
      yield put(deleteCourseSuccess(courseId));
    } catch (error: any) {
      yield put(
        deleteCourseFailure(error.message || 'Failed to delete course'),
      );
    }
  }
}

function* loadEnrolledCoursesSaga(
  action: ReturnType<typeof loadEnrolledCoursesRequest>,
) {
  try {
    const studentId = action.payload;
    const currentCourses: Course[] = yield select(
      (state: RootState) => state.course.courses,
    );

    const enrolledCourses = currentCourses.filter(course =>
      course.enrolledStudents.includes(studentId),
    );

    yield put(loadEnrolledCoursesSuccess(enrolledCourses));
  } catch (error: any) {
    yield put(
      loadEnrolledCoursesFailure(
        error.message || 'Failed to load enrolled courses',
      ),
    );
  }
}

export function* courseSaga() {
  yield takeLatest(loadCoursesRequest.type, loadCoursesSaga);
  yield takeLatest(addCourseRequest.type, addCourseSaga);
  yield takeLatest(enrollInCourseRequest.type, enrollInCourseSaga);
  yield takeLatest(updateCourseRequest.type, updateCourseSaga);
  yield takeLatest(deleteCourseRequest.type, deleteCourseSaga);
  yield takeLatest(loadEnrolledCoursesRequest.type, loadEnrolledCoursesSaga);
}
