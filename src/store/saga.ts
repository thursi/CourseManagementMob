import {all} from 'redux-saga/effects';
import {authSaga} from '../features/login/sagas';
import {courseSaga} from '../features/course/sagas';

// export function* rootSaga() {
//   try {
//     yield all([
//       authSaga(),
//       courseSaga(),
//     ]);
//   } catch (e) {
//     console.error('Saga error:', e);
//   }
// }
export function* rootSaga() {
  try {
    yield all([authSaga(),
      courseSaga()]);
  } catch (e) {
    console.error('Saga error:', e);
  }
}
