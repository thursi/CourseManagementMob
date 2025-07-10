import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {NativeStackScreenProps} from '@react-navigation/native-stack';
// import {RootStackParamList} from 'navigation';

// type Props = NativeStackScreenProps<RootStackParamList, 'InstructorCourses'>;

interface Course {
  _id: string; // Changed from 'id' to '_id' to match MongoDB
  title: string;
  description: string;
  content: string;
  instructorId: string;
  enrolledStudents: string[];
}

const InstructorCourses = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    content: '',
  });

  const [viewingStudentsId, setViewingStudentsId] = useState<string | null>(
    null,
  );

  // Load user token and ID from AsyncStorage once
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setToken(parsed.token);
          setUserId(parsed.id);
        }
      } catch (error) {
        console.log('Failed to load user from storage:', error);
      }
    };
    loadUser();
  }, []);

  // Fetch courses from API
  const fetchCourses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('http://192.168.8.142:5000/api/courses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      const data = await res.json();
      setCourses(data);
      await AsyncStorage.setItem('courses', JSON.stringify(data)); // save for offline/fallback
    } catch (error) {
      console.log('Error fetching courses:', error);
      Alert.alert('Error', 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const instructorCourses = courses.filter(
    course => course.instructorId === userId,
  );

  const handleEdit = (course: Course) => {
    setEditingCourseId(course._id);
    setEditForm({
      title: course.title,
      description: course.description,
      content: course.content,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCourseId || !token) return;
    setLoading(true);

    try {
      const res = await fetch(
        `http://192.168.8.142:5000/api/courses/${editingCourseId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        },
      );

      const data = await res.json();

      if (res.ok) {
        Alert.alert('Success', 'Course updated successfully!');
        setEditingCourseId(null);
        await fetchCourses();
      } else {
        Alert.alert('Error', data.message || 'Failed to update course');
      }
    } catch (error) {
      console.log('Update error:', error);
      Alert.alert('Error', 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = (courseId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this course?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            setLoading(true);
            try {
              const res = await fetch(
                `http://192.168.8.142:5000/api/courses/${courseId}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );
              if (res.ok) {
                Alert.alert('Deleted', 'Course deleted successfully!');
                await fetchCourses(); // refresh list after delete
              } else {
                const data = await res.json();
                Alert.alert('Error', data.message || 'Failed to delete course');
              }
            } catch (error) {
              console.log('Delete error:', error);
              Alert.alert('Error', 'Failed to delete course');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading && courses.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (instructorCourses.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No courses created yet</Text>
        <Text style={styles.emptySubtitle}>
          Create your first course using the "Create Course" tab.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await fetchCourses();
            setRefreshing(false);
          }}
        />
      }>
      {instructorCourses.map(course => (
        <View key={course._id} style={styles.card}>
          {editingCourseId === course._id ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.input}
                value={editForm.title}
                onChangeText={text => setEditForm({...editForm, title: text})}
                placeholder="Course title"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editForm.description}
                onChangeText={text =>
                  setEditForm({...editForm, description: text})
                }
                placeholder="Course description"
                multiline
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editForm.content}
                onChangeText={text => setEditForm({...editForm, content: text})}
                placeholder="Course content"
                multiline
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveEdit} // Fixed: removed arrow function wrapper
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Save</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditingCourseId(null)}
                  disabled={loading}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.headerRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseDescription}>
                    {course.description}
                  </Text>
                </View>
                <View style={styles.iconRow}>
                  <TouchableOpacity
                    onPress={() => handleEdit(course)}
                    style={{marginRight: 10}}>
                    <Text style={{color: '#3b82f6'}}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setViewingStudentsId(
                        viewingStudentsId === course._id ? null : course._id,
                      )
                    }
                    style={{marginRight: 10}}>
                    <Text style={{color: '#10b981'}}>View Students</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(course._id)}>
                    <Text style={{color: '#ef4444'}}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  {course.enrolledStudents.length} enrolled students
                </Text>
              </View>

              <Text style={styles.contentTitle}>Course Content:</Text>
              <Text style={styles.contentText}>{course.content}</Text>

              {viewingStudentsId === course._id && (
                <View style={styles.studentList}>
                  <Text style={styles.studentHeader}>Enrolled Students:</Text>
                  {course.enrolledStudents.length > 0 ? (
                    course.enrolledStudents.map(studentId => (
                      <View key={studentId} style={styles.studentItem}>
                        <Text style={styles.studentText}>ID: {studentId}</Text>
                        <Text style={styles.studentDate}>
                          {new Date().toLocaleDateString()}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noStudentsText}>
                      No students enrolled yet.
                    </Text>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default InstructorCourses;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  courseDescription: {
    color: '#6b7280',
    marginTop: 4,
  },
  iconRow: {
    flexDirection: 'row',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  contentTitle: {
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 14,
    color: '#4b5563',
  },
  editContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9fafb',
    color: 'black',
  },
  textArea: {
    textAlignVertical: 'top',
    height: 100,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  studentList: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  studentHeader: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  studentText: {
    color: '#4b5563',
  },
  studentDate: {
    color: '#6b7280',
    fontSize: 12,
  },
  noStudentsText: {
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
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
  },
});
