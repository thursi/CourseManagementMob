import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useCourses} from '../../hooks/course';
import {RootStackParamList} from 'navigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type ProcessingPaymentProps = NativeStackScreenProps<
  RootStackParamList,
  'EnrolledCourses'
> & {};

const EnrolledCourses: React.FC<ProcessingPaymentProps> = ({}) => {
  const {enrolledCourses} = useCourses();

  if (enrolledCourses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {/* <BookOpen size={48} color="#9ca3af" /> */}
        <Text style={styles.emptyTitle}>No enrolled courses</Text>
        <Text style={styles.emptySubtitle}>
          Enroll in courses from the "All Courses" tab to get started.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {enrolledCourses.map(course => (
        <View key={course.id} style={styles.card}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>

          <View style={styles.metaRow}>
            {/* <User size={16} color="#6b7280" style={styles.icon} /> */}
            <Text style={styles.metaText}>{course.instructor}</Text>
          </View>

          <View style={styles.metaRow}>
            {/* <Clock size={16} color="#6b7280" style={styles.icon} /> */}
            <Text style={styles.metaText}>
              {new Date(course.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Course Content:</Text>
            <Text style={styles.sectionText}>{course.content}</Text>
          </View>

          <View style={styles.enrolledBadge}>
            <Text style={styles.enrolledText}>Enrolled ✓</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default EnrolledCourses;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 4,
    elevation: 2,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  courseDescription: {
    color: '#4b5563',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  icon: {
    marginRight: 6,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  sectionText: {
    fontSize: 14,
    color: '#374151',
  },
  enrolledBadge: {
    backgroundColor: '#d1fae5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  enrolledText: {
    color: '#047857',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
