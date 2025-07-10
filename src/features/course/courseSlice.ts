// import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// export interface Course {
//   id: string;
//   title: string;
//   description: string;
//   instructor: string;
//   instructorId: string;
//   content: string;
//   enrolledStudents: string[];
//   createdAt: string;
// }

// interface CourseState {
//   courses: Course[];
//   enrolledCourses: Course[];
//   loading: boolean;
//   error: string | null;
// }

// const initialState: CourseState = {
//   courses: [],
//   enrolledCourses: [],
//   loading: false,
//   error: null,
// };

// const courseSlice = createSlice({
//   name: 'course',
//   initialState,
//   reducers: {
//     // Load courses
//     loadCoursesRequest(state) {
//       state.loading = true;
//       state.error = null;
//     },
//     loadCoursesSuccess(state, action: PayloadAction<Course[]>) {
//       state.courses = action.payload;
//       state.loading = false;
//       state.error = null;
//     },
//     loadCoursesFailure(state, action: PayloadAction<string>) {
//       state.loading = false;
//       state.error = action.payload;
//     },

//     addCourseRequest(
//       state,
//       _action: PayloadAction<
//         Omit<Course, 'id' | 'enrolledStudents' | 'createdAt'>
//       >,
//     ) {
//       state.loading = true;
//       state.error = null;
//     },
//     addCourseSuccess(state, action: PayloadAction<Course>) {
//       state.courses.push(action.payload);
//       state.loading = false;
//       state.error = null;
//     },
//     addCourseFailure(state, action: PayloadAction<string>) {
//       state.loading = false;
//       state.error = action.payload;
//     },

//     enrollInCourseRequest(
//       state,
//       _action: PayloadAction<{courseId: string; studentId: string}>,
//     ) {
//       state.loading = true;
//       state.error = null;
//     },
//     enrollInCourseSuccess(
//       state,
//       action: PayloadAction<{courseId: string; studentId: string}>,
//     ) {
//       const {courseId, studentId} = action.payload;
//       const course = state.courses.find(c => c.id === courseId);
//       if (course && !course.enrolledStudents.includes(studentId)) {
//         course.enrolledStudents.push(studentId);
//       }
//       state.loading = false;
//       state.error = null;
//     },
//     enrollInCourseFailure(state, action: PayloadAction<string>) {
//       state.loading = false;
//       state.error = action.payload;
//     },

//     updateCourseRequest(
//       state,
//       _action: PayloadAction<{courseId: string; updates: Partial<Course>}>,
//     ) {
//       state.loading = true;
//       state.error = null;
//     },
//     updateCourseSuccess(
//       state,
//       action: PayloadAction<{courseId: string; updates: Partial<Course>}>,
//     ) {
//       const {courseId, updates} = action.payload;
//       const courseIndex = state.courses.findIndex(c => c.id === courseId);
//       if (courseIndex !== -1) {
//         state.courses[courseIndex] = {
//           ...state.courses[courseIndex],
//           ...updates,
//         };
//       }
//       state.loading = false;
//       state.error = null;
//     },
//     updateCourseFailure(state, action: PayloadAction<string>) {
//       state.loading = false;
//       state.error = action.payload;
//     },

//     deleteCourseRequest(state, _action: PayloadAction<string>) {
//       state.loading = true;
//       state.error = null;
//     },
//     deleteCourseSuccess(state, action: PayloadAction<string>) {
//       state.courses = state.courses.filter(c => c.id !== action.payload);
//       state.loading = false;
//       state.error = null;
//     },
//     deleteCourseFailure(state, action: PayloadAction<string>) {
//       state.loading = false;
//       state.error = action.payload;
//     },

//     loadEnrolledCoursesRequest(state, _action: PayloadAction<string>) {
//       state.loading = true;
//       state.error = null;
//     },
//     loadEnrolledCoursesSuccess(state, action: PayloadAction<Course[]>) {
//       state.enrolledCourses = action.payload;
//       state.loading = false;
//       state.error = null;
//     },
//     loadEnrolledCoursesFailure(state, action: PayloadAction<string>) {
//       state.loading = false;
//       state.error = action.payload;
//     },

//     clearCourseError(state) {
//       state.error = null;
//     },
//   },
// });

// export const {
//   loadCoursesRequest,
//   loadCoursesSuccess,
//   loadCoursesFailure,
//   addCourseRequest,
//   addCourseSuccess,
//   addCourseFailure,
//   enrollInCourseRequest,
//   enrollInCourseSuccess,
//   enrollInCourseFailure,
//   updateCourseRequest,
//   updateCourseSuccess,
//   updateCourseFailure,
//   deleteCourseRequest,
//   deleteCourseSuccess,
//   deleteCourseFailure,
//   loadEnrolledCoursesRequest,
//   loadEnrolledCoursesSuccess,
//   loadEnrolledCoursesFailure,
//   clearCourseError,
// } = courseSlice.actions;

// export default courseSlice.reducer;
// features/course/courseSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Course {
  id: string;
  title: string;
  description: string;
  content?: string;
  instructor: string;
  instructorId: string;
  createdAt: string;
  enrolledStudents: string[];
}

interface CourseState {
  courses: Course[];
  enrolledCourses: Course[];
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  enrolledCourses: [],
  loading: false,
  error: null,
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    loadCoursesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    loadCoursesSuccess(state, action: PayloadAction<Course[]>) {
      state.courses = action.payload;
      state.loading = false;
    },
    loadCoursesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    // other reducers...
  },
});

export const {loadCoursesRequest, loadCoursesSuccess, loadCoursesFailure} =
  courseSlice.actions;

export default courseSlice.reducer;
