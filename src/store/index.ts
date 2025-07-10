// import {configureStore} from '@reduxjs/toolkit';
// import {
//   persistStore,
//   FLUSH,
//   REHYDRATE,
//   PAUSE,
//   PERSIST,
//   PURGE,
//   REGISTER,
// } from 'redux-persist';
// import createSagaMiddleware from 'redux-saga';
// import {createLogger} from 'redux-logger';
// import rootReducer from './reducer';
// import {rootSaga} from './saga';

// const sagaMiddleware = createSagaMiddleware();

// const loggerMiddleware = createLogger({
//   collapsed: true,
//   diff: true,
//   duration: true,
//   timestamp: false,
// });

// const store = configureStore({
//   reducer: rootReducer,
//   middleware: getDefaultMiddleware => {
//     const middleware = getDefaultMiddleware({
//       thunk: false,
//       serializableCheck: {
//         ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//       },
//     });

//     return middleware.concat([sagaMiddleware, loggerMiddleware]);
//   },
// });

// sagaMiddleware.run(rootSaga);
// export type State = ReturnType<typeof store.getState>;

// export const persistor = persistStore(store);
// // createAxios(store);

// export default store;
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
