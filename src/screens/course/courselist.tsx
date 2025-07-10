// import React, {useEffect} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import {useSelector} from 'react-redux';
// import {useCourses} from '../../hooks/course';
// import {Course} from '../../features/course/courseSlice';
// import {NativeStackScreenProps} from '@react-navigation/native-stack';
// import { RootStackParamList } from 'navigation';
// import { RootState } from 'store/reducer';

// type CourseListProps = NativeStackScreenProps<RootStackParamList, 'CourseList'>;

// const CourseList: React.FC<CourseListProps> = ({navigation}) => {
//   const {loadCourses, enrollInCourse, loadEnrolledCourses} = useCourses();
//   const user = useSelector((state: RootState) => state.login.user);

//   const courses = useSelector((state: RootState) => state.course.courses);
//   const enrolledCourses = useSelector(
//     (state: RootState) => state.course.enrolledCourses,
//   );
//   const loading = useSelector((state: RootState) => state.course.loading);
//   const error = useSelector((state: RootState) => state.course.error);

//   useEffect(() => {
//     loadCourses();
//   }, [loadCourses]);

//   useEffect(() => {
//     if (user) {
//       loadEnrolledCourses(user.id);
//     }
//   }, [user, loadEnrolledCourses]);

//   const handleEnroll = (courseId: string) => {
//     if (!user) {
//       Alert.alert('Error', 'Please login to enroll in courses');
//       navigation.navigate('Login');
//       return;
//     }

//     const isAlreadyEnrolled = enrolledCourses.some(
//       course => course.id === courseId,
//     );

//     if (isAlreadyEnrolled) {
//       Alert.alert('Info', 'You are already enrolled in this course');
//       return;
//     }

//     enrollInCourse(courseId, user.id);
//     Alert.alert('Success', 'Successfully enrolled in the course!');
//   };

//   const renderCourseItem = ({item}: {item: Course}) => {
//     const isEnrolled = enrolledCourses.some(
//       enrolled => enrolled.id === item.id,
//     );


import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useCourses} from '../../hooks/course';
import {Course} from '../../features/course/courseSlice';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from 'navigation';
import {RootState} from 'store/reducer';

type CourseListProps = NativeStackScreenProps<RootStackParamList, 'CourseList'>;

const CourseList: React.FC<CourseListProps> = ({navigation}) => {
  const {loadCourses, enrollInCourse, loadEnrolledCourses} = useCourses();
  const user = useSelector((state: RootState) => state.login.user); // or auth.user
  const courses = useSelector((state: RootState) => state.course.courses);
  const enrolledCourses = useSelector(
    (state: RootState) => state.course.enrolledCourses,
  );
  const loading = useSelector((state: RootState) => state.course.loading);
  const error = useSelector((state: RootState) => state.course.error);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (user) {
      loadEnrolledCourses(user.id);
    }
  }, [user, loadEnrolledCourses]);

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      Alert.alert('Error', 'Please login to enroll in courses');
      navigation.navigate('Login');
      return;
    }

    const isAlreadyEnrolled = enrolledCourses.some(
      course => course.id === courseId,
    );

    if (isAlreadyEnrolled) {
      Alert.alert('Info', 'You are already enrolled in this course');
      return;
    }

    try {
      await enrollInCourse(courseId, user.id);
      Alert.alert('Success', 'Successfully enrolled in the course!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Enrollment failed');
    }
  };

  const renderCourseItem = ({item}: {item: Course}) => {
    const isEnrolled = enrolledCourses.some(
      enrolled => enrolled.id === item.id,
    );

    return (
      <View style={styles.courseCard}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.courseDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.courseDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👨‍🏫 Instructor:</Text>
            <Text style={styles.detailValue}>{item.instructor}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🕒 Created:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👥 Enrolled:</Text>
            <Text style={styles.detailValue}>
              {item.enrolledStudents.length} students
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.enrollButton,
            isEnrolled ? styles.enrolledButton : styles.enrollNowButton,
          ]}
          onPress={() => handleEnroll(item.id)}
          disabled={isEnrolled}>
          <Text
            style={[
              styles.enrollButtonText,
              isEnrolled
                ? styles.enrolledButtonText
                : styles.enrollNowButtonText,
            ]}>
            {isEnrolled ? '✅ Enrolled' : '📚 Enroll Now'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCourses}>
          <Text style={styles.retryButtonText}>🔄 Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>No courses available</Text>
        <Text style={styles.emptyDescription}>
          Check back later for new courses.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={courses}
      renderItem={renderCourseItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  courseDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  enrollButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrollNowButton: {
    backgroundColor: '#3B82F6',
  },
  enrolledButton: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  enrollButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  enrollNowButtonText: {
    color: '#FFFFFF',
  },
  enrolledButtonText: {
    color: '#059669',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default CourseList;
