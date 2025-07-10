import {useSelector, useDispatch} from 'react-redux';
import {useCallback} from 'react';
import {
  clearError,
  loginRequest,
  logoutAction,
  registerRequest,
} from '../../features/login/authSlice';
import {RootState} from 'store/reducer';

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.login.user);
  const error = useSelector((state: RootState) => state.login.error);
  const loading = useSelector((state: RootState) => state.login.loading);

  const login = useCallback(
    (email: string, password: string) => {
      dispatch(loginRequest({email, password}));
    },
    [dispatch],
  );

  // const register = useCallback(
  //   (
  //     name: string,
  //     email: string,
  //     password: string,
  //     role: 'student' | 'instructor',
  //   ) => {
  //     console.log('name......................', name);
  //     dispatch(registerRequest({name, email, password, role}));
  //   },
  //   [dispatch],
  // );

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    error,
    loading,
    login,
    // register,
    logout,
    clearAuthError,
  };
}
export function useSignUp() {
  const dispatch = useDispatch();

  const register = useCallback(
    async (values: {
      name: string;
      email: string;
      password: string;
      role: string;
    }) => {
      console.log('values', values);
      const updatedData = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role as 'student' | 'instructor',
      };
      console.log('updatedData', updatedData);

      dispatch(registerRequest(updatedData));
    },
    [dispatch],
  );

  return {register};
}
