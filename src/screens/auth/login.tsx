
// type ProcessingPaymentProps = NativeStackScreenProps<
//   RootStackParamList,
//   'Login'
// > & {};

// const LoginForm: React.FC<ProcessingPaymentProps> = ({navigation}) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   // const [loading, setLoading] = useState(false);
//   // const {login} = useAuth();
//   const user = useSelector((state: RootState) => state.login.user);

//   // const handleSubmit = async () => {
//   //   if (!email || !password) {
//   //     Alert.alert('Error', 'Please fill in all fields');
//   //     return;
//   //   }

//   //   setLoading(true);
//   //   try {
//   //     await login(email, password);
//   //     Alert.alert('Success', 'Login successful!');
//   //   } catch (error) {
//   //     Alert.alert(
//   //       'Error',
//   //       'Invalid credentials. Try: student@example.com / instructor@example.com with password: password',
//   //     );
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   useEffect(() => {
//     if (user) {
//       Alert.alert('Success', 'Login successful!');

//       if (user.role === 'student') {
//         navigation.navigate('StudentDashboard'); // Make sure this route exists in your navigation
//       } else if (user.role === 'instructor') {
//         navigation.navigate('InstructorDashboard'); // Make sure this route exists in your navigation
//       }
//     }
//   }, [user, navigation]);
//   console.log('user.....', user);

//   // const handleSubmit = async () => {
//   //   if (!email || !password) {
//   //     Alert.alert('Error', 'Please fill in all fields');
//   //     return;
//   //   }

//   //   // setLoading(true);
//   //   try {
//   //     await login(email, password);
//   //     // Navigation will be handled by useEffect when user state changes
//   //   } catch (error) {
//   //     // Error handling is done in useEffect
//   //   }
//   // };

//   // const handleSubmit = async () => {
//   //   if (!email || !password) {
//   //     Alert.alert('Error', 'Please fill in all fields');
//   //     return;
//   //   }

//   //   try {
//   //     const response = await fetch('http://192.168.8.142:5000/api/auth/login', {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify({email, password}),
//   //     });

//   //     const data = await response.json();
//   //     console.log('Login response:', data);

//   //     if (response.ok && data.role) {
//   //       Alert.alert('Success', 'Login successful!');

//   //       if (data.role === 'student') {
//   //         navigation.navigate('StudentDashboard');
//   //       } else if (data.role === 'instructor') {
//   //         navigation.navigate('InstructorDashboard');
//   //       } else {
//   //         Alert.alert('Error', 'Unknown user role');
//   //       }
//   //     } else {
//   //       Alert.alert('Error', data.message || 'Login failed');
//   //     }
//   //   } catch (error) {
//   //     console.log('Login error:', error);
//   //     Alert.alert('Error', 'Network error. Please try again.');
//   //   }
//   // };

//   const handleSubmit = async () => {
//     if (!email || !password) {
//       Alert.alert('Error', 'Please fill in all fields');
//       return;
//     }

//     try {
//       const response = await fetch('http://192.168.8.142:5000/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({email, password}),
//       });

//       const data = await response.json();
//       console.log('Login response:', data);

//       if (response.ok && data.token) {
//         // 🔐 Save token and user data
//         await AsyncStorage.setItem('user', JSON.stringify(data));

//         Alert.alert('Success', 'Login successful!');
//         if (data.role === 'student') {
//           navigation.navigate('StudentDashboard');
//         } else if (data.role === 'instructor') {
//           navigation.navigate('InstructorDashboard');
//         } else {
//           Alert.alert('Error', 'Unknown user role');
//         }
//       } else {
//         Alert.alert('Error', data.message || 'Login failed');
//       }
//     } catch (error) {
//       console.log('Login error:', error);
//       Alert.alert('Error', 'Network error. Please try again.');
//     }
//   };
  
  

import {RootStackParamList} from 'navigation';
import React, { useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
// import {RootState} from 'store/reducer';
// import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import {setUser} from '../../features/login/authSlice';


type ProcessingPaymentProps = NativeStackScreenProps<
  RootStackParamList,
  'Login'
> & {};

const LoginForm: React.FC<ProcessingPaymentProps> = ({navigation}) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // const user = useSelector((state: RootState) => state.login.user);

  // useEffect(() => {
  //   if (user) {
  //     Alert.alert('Success', 'Login successful!');
  //     if (user.role === 'student') {
  //       navigation.navigate('StudentDashboard');
  //     } else if (user.role === 'instructor') {
  //       navigation.navigate('InstructorDashboard');
  //     }
  //   }
  // }, [user, navigation]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.8.142:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.token) {
        await AsyncStorage.setItem('user', JSON.stringify(data));
         dispatch(setUser(data));
        Alert.alert('Success', 'Login successful!');

        if (data.role === 'student') {
          navigation.navigate('StudentDashboard');
        } else if (data.role === 'instructor') {
          navigation.navigate('InstructorDashboard');
        } else {
          Alert.alert('Error', 'Unknown user role');
        }
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <View style={styles.eyeIcon}>
      <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>📚</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[
                styles.inputContainer,
                emailFocused && styles.inputContainerFocused,
                email && styles.inputContainerFilled,
              ]}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputContainer,
                passwordFocused && styles.inputContainerFocused,
                password && styles.inputContainerFilled,
              ]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}>
                <EyeIcon />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[
              styles.submitButton,
              loading && styles.disabledButton,
              (!email || !password) && styles.disabledButton,
            ]}>
            <Text style={styles.submitButtonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>
              Don't have an account?{' '}
              <Text style={styles.registerLinkBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#EBF4FF',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '400',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
  },
  inputContainerFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainerFilled: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    paddingVertical: 12,
  },
  passwordInput: {
    paddingRight: 8,
  },
  eyeButton: {
    padding: 8,
    borderRadius: 8,
  },
  eyeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 18,
    opacity: 0.6,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  registerLink: {
    marginTop: 24,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  registerLinkBold: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  demoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  demoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  demoAccountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  demoAccount: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  demoAccountType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  demoAccountEmail: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  demoPassword: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  demoPasswordBold: {
    color: '#1F2937',
    fontWeight: '700',
  },
});
