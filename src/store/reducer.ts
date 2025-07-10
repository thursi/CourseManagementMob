// import {combineReducers} from '@reduxjs/toolkit';
// import {PURGE} from 'redux-persist';
// import loginReducer from '../features/login/authSlice';
// import courseReducer from '../features/course/courseSlice';


// const appReducer = combineReducers({
//   login: loginReducer,
//   course: courseReducer,
// });

// const rootReducer = (state: any, action: any) => {
//   if (action.type === PURGE) {
//     return appReducer(undefined, action);
//   }

//   return appReducer(state, action);
// };

// export type RootState = ReturnType<typeof rootReducer>;

// export default rootReducer;
// store/index.ts
import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/login/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
