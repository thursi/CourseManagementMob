import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from 'navigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useDispatch} from 'react-redux';
import {logout} from '../../features/login/authSlice';

type TabType = 'courses' | 'create' | 'users';

type Props = NativeStackScreenProps<RootStackParamList, 'InstructorDashboard'>;

interface Course {
  _id: string;
  title: string;
  description: string;
  content: string;
  instructorId: string;
  enrolledStudents: string[];
}

const InstructorDashboard: React.FC<Props> = ({navigation}) => {
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [users, setUsers] = useState<
    {id: string; name: string; email: string; role: string}[]
  >([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    content: '',
  });
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  const [viewingStudentsId, setViewingStudentsId] = useState<string | null>(
    null,
  );
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    dispatch(logout());
  };
  const tabs = [
    {id: 'courses' as TabType, label: 'My Courses'},
    {id: 'create' as TabType, label: 'Create Course'},
    {id: 'users' as TabType, label: 'Users'},
  ];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setToken(parsed.token);
          setUserId(parsed.id);
          setUser({
            id: parsed.id,
            name: parsed.name,
            email: parsed.email,
          });
        }
      } catch (error) {
        console.log('Failed to load user from storage:', error);
      }
    };
    loadUser();
  }, []);

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
      await AsyncStorage.setItem('courses', JSON.stringify(data));
    } catch (error) {
      console.log('Error fetching courses:', error);
      Alert.alert('Error', 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const res = await fetch('http://192.168.8.142:5000/api/auth/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.log('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCourses();
      fetchUsers();
    }
  }, [fetchCourses, fetchUsers, token]);

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

  // Delete a course
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
                await fetchCourses();
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

  useEffect(() => {
    if (activeTab === 'create') {
      navigation.navigate('CreateCourse');
      setActiveTab('courses');
    }
  }, [activeTab, navigation]);
  const renderCourses = () => {
    if (loading && courses.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading courses...</Text>
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
        style={styles.coursesList}
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
          <View key={course._id} style={styles.courseCard}>
            {editingCourseId === course._id ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.input}
                  value={editForm.title}
                  onChangeText={text => setEditForm({...editForm, title: text})}
                  placeholder="Course title"
                  placeholderTextColor="#9ca3af"
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editForm.description}
                  onChangeText={text =>
                    setEditForm({...editForm, description: text})
                  }
                  placeholder="Course description"
                  placeholderTextColor="#9ca3af"
                  multiline
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editForm.content}
                  onChangeText={text =>
                    setEditForm({...editForm, content: text})
                  }
                  placeholder="Course content"
                  placeholderTextColor="#9ca3af"
                  multiline
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveEdit}
                    disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
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
                <View style={styles.courseHeader}>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseDescription}>
                      {course.description}
                    </Text>
                  </View>
                  <View style={styles.courseActions}>
                    <TouchableOpacity
                      onPress={() => handleEdit(course)}
                      style={styles.actionButton}>
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        setViewingStudentsId(
                          viewingStudentsId === course._id ? null : course._id,
                        )
                      }
                      style={styles.actionButton}>
                      <Text style={styles.studentsText}>Students</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(course._id)}
                      style={styles.actionButton}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.courseStats}>
                  <Text style={styles.statsText}>
                    {course.enrolledStudents.length} enrolled students
                  </Text>
                </View>

                <View style={styles.courseContent}>
                  <Text style={styles.contentLabel}>Course Content:</Text>
                  <Text style={styles.contentText}>{course.content}</Text>
                </View>

                {viewingStudentsId === course._id && (
                  <View style={styles.studentsList}>
                    <Text style={styles.studentsHeader}>
                      Enrolled Students:
                    </Text>
                    {course.enrolledStudents.length > 0 ? (
                      course.enrolledStudents.map(studentId => (
                        <View key={studentId} style={styles.studentItem}>
                          <Text style={styles.studentId}>ID: {studentId}</Text>
                          <Text style={styles.enrollDate}>
                            {new Date().toLocaleDateString()}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noStudents}>
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
  const renderUsers = () => {
    if (loadingUsers) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      );
    }

    if (users.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No users found.</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.usersList}>
        {users.map(user => (
          <View key={user.id} style={styles.userCard}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userName}>{user.role}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userId}>ID: {user.id}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Instructor Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>⚙️</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>
          Manage your courses and track student enrollments
        </Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userText}>Name: {user.name}</Text>
            <Text style={styles.userText}>ID: {user.id}</Text>
            <Text style={styles.userText}>Email: {user.email}</Text>
          </View>
        )}
      </View>

      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}>
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        {activeTab === 'courses' && renderCourses()}
        {activeTab === 'users' && renderUsers()}
      </View>
    </View>
  );
};

export default InstructorDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  logout: {
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    textAlign: 'right',
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    margin: 16,
    marginBottom: 0,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#eff6ff',
    borderBottomColor: '#3b82f6',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#2563eb',
  },
  inactiveTabLabel: {
    color: '#6b7280',
  },
  content: {
    flex: 1,
    margin: 16,
    marginTop: 8,
  },
  coursesList: {
    flex: 1,
  },
  courseCard: {
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
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
    marginRight: 12,
  },
  userInfo: {
    marginTop: 8,
  },
  userText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },

  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  courseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  editText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  studentsText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  courseStats: {
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  courseContent: {
    marginBottom: 12,
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  studentsList: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  studentsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  studentId: {
    fontSize: 14,
    color: '#4b5563',
  },
  enrollDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  noStudents: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  editContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  usersList: {
    flex: 1,
  },

  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 4,
    elevation: 2,
  },

  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },

  userId: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
