
import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setUser} from '../features/login/authSlice'; 
import {RootState} from '../store'; 
import LoginScreen from '../screens/auth/login';
import RegisterScreen from '../screens/auth/register';
import CourseList from '../screens/course/courselist';
import CreateCourse from '../screens/course/createcourse';
import EnrolledCourses from '../screens/course/enrolledcourses';
import InstructorDashboard from '../screens/instructor/instructordashboard';
import InstructorCourses from '../screens/instructor/instructorcourses';
import StudentDashboard from '../screens/student/studentdashboard';
import Dashboard from '../screens/home/home';
import GPTRecommendations from '../screens/student/gptrecommendations';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  CourseList: undefined;
  CreateCourse: undefined;
  EnrolledCourses: undefined;
  InstructorDashboard: undefined;
  InstructorCourses: undefined;
  GPTRecommendations: undefined;
  StudentDashboard: undefined;
  Dashboard: undefined;
  Profile: {name: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true); // for AsyncStorage check

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          dispatch(setUser(JSON.parse(storedUser)));
        }
      } catch (error) {
        console.log('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, [dispatch]);

  if (loading) {
    return null; // You can return a <SplashScreen /> here if you want
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          {user.role === 'student' ? (
            <>
              <Stack.Screen
                name="StudentDashboard"
                component={StudentDashboard}
              />
              <Stack.Screen
                name="GPTRecommendations"
                component={GPTRecommendations}
              />
              <Stack.Screen
                name="EnrolledCourses"
                component={EnrolledCourses}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="InstructorDashboard"
                options={{headerShown: false}}
                component={InstructorDashboard}
              />
              <Stack.Screen
                name="InstructorCourses"
                options={{headerShown: false}}
                component={InstructorCourses}
              />
              <Stack.Screen name="CreateCourse" component={CreateCourse} />
            </>
          )}
          <Stack.Screen name="CourseList" component={CourseList} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Navigation;
