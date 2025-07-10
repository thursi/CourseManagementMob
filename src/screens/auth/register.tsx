// //   type ProcessingPaymentProps = NativeStackScreenProps<
// //     RootStackParamList,
// //     'Register'
// //   > & {};

// // const RegisterScreen: React.FC<ProcessingPaymentProps> = ({navigation}) => {
// //   const [name, setName] = useState('');
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [role, setRole] = useState<'student' | 'instructor'>('student');
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   // const handleSubmit = async () => {
// //   //   if (!name || !email || !password) {
// //   //     Alert.alert('Error', 'Please fill in all fields');
// //   //     return;
// //   //   }

// //   //   setLoading(true);
// //   //   try {
// //   //     await register(name, email, password,role);
// //   //     Alert.alert('Success', 'Registration successful!');
// //   //   } catch (error) {
// //   //     Alert.alert('Error', 'Registration failed. Please try again.');
// //   //   } finally {
// //   //     setLoading(false);
// //   //   }
// //   // };

// //   const { user, error} = useAuth();
// //   const {register} = useSignUp();



// //   useEffect(() => {
// //     if (user) {
// //       Alert.alert('Success', 'Registration successful!');
// //       if (user.role === 'student') {
// //         navigation.navigate('StudentDashboard');
// //       } else if (user.role === 'instructor') {
// //         navigation.navigate('InstructorDashboard');
// //       }
// //     }
// //   }, [user, navigation]);

// //   // Handle errors
// //   useEffect(() => {
// //     if (error) {
// //       Alert.alert('Error', 'Registration failed. Please try again.');
// //       setLoading(false);
// //     }
// //   }, [error]);

// //   const handleSubmit = async () => {
// //     if (!name || !email || !password) {
// //       Alert.alert('Error', 'Please fill in all fields');
// //       return;
// //     }

// //     setLoading(true);
// //     console.log(
// //       'name, email, password, role.....',
// //       name,
// //       email,
// //       password,
// //       role,
// //     );
// //     try {
// //       await register({
// //         name,
// //         email,
// //         password,
// //         role,
// //       });
// //     } catch (error) {console.log(error);
// //     }
// //   };

import {RootStackParamList} from 'navigation';
import React, {useState} from 'react';
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
  StatusBar,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser } from '../../features/login/authSlice';
import { useDispatch } from 'react-redux';

type ProcessingPaymentProps = NativeStackScreenProps<
  RootStackParamList,
  'Register'
> & {};

const RegisterScreen: React.FC<ProcessingPaymentProps> = ({navigation}) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://192.168.8.142:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({name, email, password, role}),
        },
      );

      const data = await response.json();
      console.log('Register response:', data);

      if (response.ok && data.token) {
        await AsyncStorage.setItem('user', JSON.stringify(data));
        dispatch(setUser(data));
        Alert.alert('Success', 'Registration successful!');
        if (role === 'student') {
          navigation.navigate('StudentDashboard');
        } else if (role === 'instructor') {
          navigation.navigate('InstructorDashboard');
        }
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error) {
      console.log('Registration error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <View style={styles.brandContainer}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoText}>L</Text>
              </View>
              <Text style={styles.brandName}>LearnPro</Text>
            </View>

            <View style={styles.headerText}>
              <Text style={styles.title}>Create Your Account</Text>
              <Text style={styles.subtitle}>
                Join thousands of learners and educators worldwide
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Registration Details</Text>
              <Text style={styles.formSubtitle}>
                Please fill in your information to get started
              </Text>
            </View>

            <View style={styles.formContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === 'name' && styles.inputFocused,
                  ]}>
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === 'email' && styles.inputFocused,
                  ]}>
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === 'password' && styles.inputFocused,
                  ]}>
                  <TextInput
                    style={[styles.textInput, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a secure password"
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}>
                    <Text style={styles.passwordToggleText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Role Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Type *</Text>
                <Text style={styles.inputHelperText}>
                  Choose your role to personalize your experience
                </Text>

                <View style={styles.roleGrid}>
                  <TouchableOpacity
                    style={[
                      styles.roleCard,
                      role === 'student' && styles.roleCardSelected,
                    ]}
                    onPress={() => setRole('student')}>
                    <View style={styles.roleCardContent}>
                      <View
                        style={[
                          styles.roleIcon,
                          role === 'student' && styles.roleIconSelected,
                        ]}>
                        <Text style={styles.roleIconText}>👨‍🎓</Text>
                      </View>
                      <Text
                        style={[
                          styles.roleTitle,
                          role === 'student' && styles.roleTitleSelected,
                        ]}>
                        Student
                      </Text>
                      <Text
                        style={[
                          styles.roleDescription,
                          role === 'student' && styles.roleDescriptionSelected,
                        ]}>
                        Learn and explore courses
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.roleRadio,
                        role === 'student' && styles.roleRadioSelected,
                      ]}>
                      {role === 'student' && (
                        <View style={styles.roleRadioInner} />
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleCard,
                      role === 'instructor' && styles.roleCardSelected,
                    ]}
                    onPress={() => setRole('instructor')}>
                    <View style={styles.roleCardContent}>
                      <View
                        style={[
                          styles.roleIcon,
                          role === 'instructor' && styles.roleIconSelected,
                        ]}>
                        <Text style={styles.roleIconText}>👩‍🏫</Text>
                      </View>
                      <Text
                        style={[
                          styles.roleTitle,
                          role === 'instructor' && styles.roleTitleSelected,
                        ]}>
                        Instructor
                      </Text>
                      <Text
                        style={[
                          styles.roleDescription,
                          role === 'instructor' &&
                            styles.roleDescriptionSelected,
                        ]}>
                        Teach and create courses
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.roleRadio,
                        role === 'instructor' && styles.roleRadioSelected,
                      ]}>
                      {role === 'instructor' && (
                        <View style={styles.roleRadioInner} />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                activeOpacity={0.9}>
                <Text style={styles.submitButtonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

                       <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },


  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerText: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  formHeader: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  formContent: {
    padding: 24,
  },

  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputHelperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 16,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
    position: 'relative',
  },
  inputFocused: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  textInput: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  passwordInput: {
    paddingRight: 60,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  passwordToggleText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },

  roleGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    backgroundColor: '#F0F9FF',
  },
  roleCardContent: {
    alignItems: 'center',
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleIconSelected: {
    backgroundColor: '#DBEAFE',
  },
  roleIconText: {
    fontSize: 24,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  roleTitleSelected: {
    color: '#1D4ED8',
  },
  roleDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  roleDescriptionSelected: {
    color: '#3B82F6',
  },
  roleRadio: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleRadioSelected: {
    borderColor: '#3B82F6',
  },
  roleRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  submitButton: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  footerLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  footerLinkText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
