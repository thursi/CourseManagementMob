import {call, put, takeLatest} from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  loadUserFromStorage,
  logoutAction,
  loadUserRequest,
} from './authSlice';
import {baseURL} from 'config';

const STORAGE_KEY = 'courseCompassUser';

// const mockUsers = [
//   {
//     id: '1',
//     name: 'John Doe',
//     email: 'student@example.com',
//     password: 'password',
//     role: 'student' as const,
//   },
//   {
//     id: '2',
//     name: 'Jane Smith',
//     email: 'instructor@example.com',
//     password: 'password',
//     role: 'instructor' as const,
//   },
// ];

// const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function* loginSaga(action: ReturnType<typeof loginRequest>) {
  const {email, password} = action.payload;

  try {
    const response = yield call(axios.post, `${baseURL}auth/login`, {
      email,
      password,
    });

    const user = response.data;

    yield call([AsyncStorage, 'setItem'], STORAGE_KEY, JSON.stringify(user));
    yield put(loginSuccess(user));
  } catch (apiError: any) {
    yield put(loginFailure(apiError.response?.data?.message || 'Login failed'));
  }
}

function* registerSaga(action: {
  type: string;
  payload: any;
}): Generator<any, void, any> {
  try {
    const {name, email, password, role} = action.payload;
    console.log('action.payload......................', action.payload);

    const response = yield call(axios.post, `${baseURL}auth/register`, {
      name,
      email,
      password,
      role,
    });
    console.log('response......................', response);

    const newUser = response.data;

    yield call([AsyncStorage, 'setItem'], STORAGE_KEY, JSON.stringify(newUser));
    yield put(registerSuccess(newUser));
  } catch (apiError: any) {
    yield put(
      registerFailure(
        apiError.response?.data?.message || 'Registration failed',
      ),
    );
  }
}

// function* registerSaga(action: {
//   type: string;
//   payload: any;
// }): Generator<any, void, any> {
//   try {
// // function* registerSaga(action: ReturnType<typeof registerRequest>) {
//   const {name, email, password, role} = action.payload;
//   console.log(' action.payload......................',  action.payload);

//     const response = yield call(axios.post, `${baseURL}auth/register`, {
//       name,
//       email,
//       password,
//       role,
//     });
//     console.log('response......................', response);

//     const newUser = response.data;

//     yield call([AsyncStorage, 'setItem'], STORAGE_KEY, JSON.stringify(newUser));
//     yield put(registerSuccess(newUser));
//   } catch (apiError: any) {
//     yield put(
//       registerFailure(
//         apiError.response?.data?.message || 'Registration failed',
//       ),
//     );
//   }
// }

// function* loginSaga(action: ReturnType<typeof loginRequest>) {
//   const {email, password} = action.payload; // ✅ FIXED

//   try {
//     const response = yield call(axios.post, `${baseURL}auth/login`, {
//       email,
//       password,
//     });

//     const user = response.data;

//     yield call([AsyncStorage, 'setItem'], STORAGE_KEY, JSON.stringify(user));
//     yield put(loginSuccess(user));
//   } catch (apiError: any) {
//     console.warn('API login failed, trying mock login...');

//     try {
//       yield call(delay, 1000);

//       const foundUser = mockUsers.find(
//         u => u.email === email && u.password === password, // ✅ No more error
//       );

//       if (!foundUser) {
//         throw new Error('Invalid credentials (mock)');
//       }

//       const userWithoutPassword = {
//         id: foundUser.id,
//         name: foundUser.name,
//         email: foundUser.email,
//         role: foundUser.role,
//       };

//       yield call(
//         [AsyncStorage, 'setItem'],
//         STORAGE_KEY,
//         JSON.stringify(userWithoutPassword),
//       );
//       yield put(loginSuccess(userWithoutPassword));
//     } catch (mockError: any) {
//       yield put(loginFailure(mockError.message));
//     }
//   }
// }

// function* registerSaga(action: ReturnType<typeof registerRequest>) {
//   console.log('name......................', action.payload);

//   const {name, email, password, role} = action.payload;
//   console.log('action.payload', action.payload);

//   try {
//     const response = yield call(axios.post, `${baseURL}auth/register`, {
//       name,
//       email,
//       password,
//       role,
//     });
// console.log('response', response);
//     const newUser = response.data;

//     yield call([AsyncStorage, 'setItem'], STORAGE_KEY, JSON.stringify(newUser));
//     yield put(registerSuccess(newUser));
//   } catch (apiError: any) {
//     console.warn('API register failed, trying mock register...');

//     try {
//       const existingUser = mockUsers.find(u => u.email === email);
//       if (existingUser) {
//         throw new Error('User with this email already exists (mock)');
//       }

//       const newUser = {
//         id: Date.now().toString(),
//         name,
//         email,
//         role,
//       };

//       mockUsers.push({
//         ...newUser,
//         password,
//       });

//       yield call(
//         [AsyncStorage, 'setItem'],
//         STORAGE_KEY,
//         JSON.stringify(newUser),
//       );
//       yield put(registerSuccess(newUser));
//     } catch (mockError: any) {
//       yield put(registerFailure(mockError.message));
//     }
//   }
// }

function* logoutSaga() {
  try {
    yield call([AsyncStorage, 'removeItem'], STORAGE_KEY);
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

function* loadUserSaga() {
  try {
    const storedUserString: string | null = yield call(
      [AsyncStorage, 'getItem'],
      STORAGE_KEY,
    );
    const user = storedUserString ? JSON.parse(storedUserString) : null;
    yield put(loadUserFromStorage(user));
  } catch (error) {
    console.error('Failed to load user from storage:', error);
    yield put(loadUserFromStorage(null));
  }
}

export function* authSaga(): Generator<any, void, any> {
  yield takeLatest(loginRequest, loginSaga);
  yield takeLatest(registerRequest, registerSaga);
  yield takeLatest(logoutAction, logoutSaga);
  yield takeLatest(loadUserRequest, loadUserSaga);
}
