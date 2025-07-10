// import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: 'student' | 'instructor';
// }

// interface AuthState {
//   user: User | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: AuthState = {
//   user: null,
//   loading: false,
//   error: null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     loginRequest(
//       state,
//       _action: PayloadAction<{email: string; password: string}>,
//     ) {
//       state.loading = true;
//       state.error = null;
//     },
//     loginSuccess(state, action: PayloadAction<User>) {
//       state.user = action.payload;
//       state.loading = false;
//       state.error = null;
//     },
//     loginFailure(state, action: PayloadAction<string>) {
//       state.loading = false;
//       state.error = action.payload;
//     },
//     registerRequest(
//       state,
//       _action: PayloadAction<{
//         name: string;
//         email: string;
//         password: string;
//         role: 'student' | 'instructor';
//       }>,
//     ) {
//       state.loading = true;
//       state.error = null;
//     },
//     registerSuccess(state, action: PayloadAction<User>) {
//       state.user = action.payload;
//       state.loading = false;
//       state.error = null;
//     },
//     registerFailure(state, action: PayloadAction<string>) {
//       state.loading = false;
//       state.error = action.payload;
//     },
//     logoutAction(state) {
//       state.user = null;
//       state.loading = false;
//       state.error = null;
//     },
//     loadUserFromStorage(state, action: PayloadAction<User | null>) {
//       state.user = action.payload;
//     },
//     loadUserRequest(state) {
//       state.loading = true;
//       state.error = null;
//     },
//     clearError(state) {
//       state.error = null;
//     },
//   },
// });

// export const {
//   loginRequest,
//   loginSuccess,
//   loginFailure,
//   registerRequest,
//   registerSuccess,
//   registerFailure,
//   logoutAction,
//   loadUserFromStorage,
//   loadUserRequest,
//   clearError,
// } = authSlice.actions;

// export default authSlice.reducer;

// store/slices/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface User {
  name: string;
  email: string;
  token: string;
  role: 'student' | 'instructor';
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
});

export const {setUser, logout} = authSlice.actions;
export default authSlice.reducer;
