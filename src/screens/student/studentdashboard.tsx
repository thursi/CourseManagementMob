import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from 'navigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import { logout } from '../../features/login/authSlice';
import { useDispatch } from 'react-redux';

type TabType = 'courses' | 'enrolled' | 'recommendations';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentDashboard'>;

interface Course {
  _id: string;
  title: string;
  description: string;
  content: string;
  instructor: string;
  instructorId: string;
  enrolledStudents: string[];
  createdAt: string;
}

interface GPTRecommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  matchScore: number;
  isAvailable: boolean;
  courseId?: string;
}

const StudentDashboard: React.FC<Props> = ({}) => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recommendations, setRecommendations] = useState<GPTRecommendation[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showGPTModal, setShowGPTModal] = useState(false);
  const [gptPrompt, setGptPrompt] = useState('');
  const [gptLoading, setGptLoading] = useState(false);

  const tabs = [
    {id: 'courses' as TabType, label: 'All Courses', icon: 'BookOpen'},
    {id: 'enrolled' as TabType, label: 'My Courses', icon: 'GraduationCap'},
    {
      id: 'recommendations' as TabType,
      label: 'AI Recommendations',
      icon: 'MessageSquare',
    },
  ];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setToken(parsed.token);
          setUser({
            id: parsed.id,
            name: parsed.name,
            email: parsed.email,
          });
          setUserId(parsed.id);
        }
        // ... rest of your code
      } catch (error) {
        console.log('Failed to load user from storage:', error);
      }
    };
    loadUser();
  }, []);

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

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    if (!token) return;

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

      // Filter enrolled courses based on current user
      if (userId) {
        const enrolled = data.filter((course: Course) =>
          course.enrolledStudents.includes(userId),
        );
        setEnrolledCourses(enrolled);
      }

      await AsyncStorage.setItem('allCourses', JSON.stringify(data));
    } catch (error) {
      console.log('Error fetching courses:', error);
      Alert.alert('Error', 'Failed to fetch courses');
    }
  }, [token, userId]);

  const generateGPTRecommendations = useCallback(
    async (prompt: string) => {
      const apiKey = `sk-proj-H6_FQ14mw3AR9fi7ptg0yPMGLgWG2qijxII3_Te-H6uwrvC_8m9 6MJbp12G4FT62behEkCMhFaT3BlbkFJHD8S63qcN8B9VexAtKN6zDq64igZ eqNd8bFT_1PKogAOq2JM4c-2NvoCYsFs5qQmj2eRCloLcA `;

      if (!prompt.trim()) {
        Alert.alert(
          'Error',
          'Please enter a prompt describing your learning goals',
        );
        return;
      }

      setGptLoading(true);
      try {
        const availableCourses = courses.map(course => ({
          id: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          enrolled: course.enrolledStudents.length,
        }));

        const systemPrompt = `You are an AI course recommendation assistant. Based on the user's learning goals and the available courses, provide personalized course recommendations.

Available courses in our database:
${JSON.stringify(availableCourses, null, 2)}

User's enrolled courses:
${enrolledCourses.map(course => `- ${course.title}`).join('\n')}

Please provide recommendations in the following JSON format:
{
  "recommendations": [
    {
      "title": "Course Title",
      "description": "Brief description of why this course is recommended",
      "reason": "Specific reason based on user's goal",
      "matchScore": 85,
      "isAvailable": true,
      "courseId": "actual_course_id_if_available"
    }
  ]
}

Include both available courses from our database (with courseId) and suggest additional courses that might be beneficial (without courseId). Provide 3-5 recommendations total.`;

        const response = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                {role: 'system', content: systemPrompt},
                {role: 'user', content: prompt},
              ],
              max_tokens: 1000,
              temperature: 0.7,
            }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.error?.message || 'Failed to get recommendations',
          );
        }

        const data = await response.json();
        const gptResponse = data.choices[0]?.message?.content || '';

        try {
          const parsedResponse = JSON.parse(gptResponse);
          const gptRecommendations = parsedResponse.recommendations.map(
            (rec: any, index: number) => ({
              id: `gpt-${index}`,
              title: rec.title,
              description: rec.description,
              reason: rec.reason,
              matchScore: rec.matchScore || 80,
              isAvailable: rec.isAvailable || false,
              courseId: rec.courseId || null,
            }),
          );

          setRecommendations(gptRecommendations);
          await AsyncStorage.setItem(
            'gpt_recommendations',
            JSON.stringify(gptRecommendations),
          );
          setShowGPTModal(false);
          setGptPrompt('');
          Alert.alert('Success', 'AI recommendations generated successfully!');
        } catch (parseError) {
          console.error('Error parsing GPT response:', parseError);
          Alert.alert('Error', 'Failed to parse AI recommendations');
        }
      } catch (error: any) {
        console.error('GPT API error:', error);
        Alert.alert(
          'Error',
          error.message || 'Failed to get AI recommendations',
        );
      } finally {
        setGptLoading(false);
      }
    },
    [courses, enrolledCourses],
  );

  const loadCachedRecommendations = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem('gpt_recommendations');
      if (cached) {
        setRecommendations(JSON.parse(cached));
      }
    } catch (error) {
      console.log('Error loading cached recommendations:', error);
    }
  }, []);

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      switch (activeTab) {
        case 'courses':
          await fetchCourses();
          break;
        case 'enrolled':
          await fetchCourses();
          break;
        case 'recommendations':
          await loadCachedRecommendations();
          break;
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, token, fetchCourses, loadCachedRecommendations]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [fetchData, token]);

  const handleEnrollment = async (courseId: string) => {
    if (!token || !userId) return;

    setLoading(true);
    try {
      const res = await fetch(
        `http://192.168.8.142:5000/api/courses/${courseId}/enroll`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: userId,
          }),
        },
      );

      if (res.ok) {
        Alert.alert('Success', 'Successfully enrolled in the course!');
        await fetchCourses();
      } else {
        const data = await res.json();
        Alert.alert('Error', data.message || 'Failed to enroll in course');
      }
    } catch (error) {
      console.log('Enrollment error:', error);
      Alert.alert('Error', 'Failed to enroll in course');
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some(course => course._id === courseId);
  };

  const renderAllCourses = () => {
    if (loading && courses.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      );
    }

    if (courses.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No courses available</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for new courses.
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
        {courses.map(course => (
          <View key={course._id} style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseDescription}>
                  {course.description}
                </Text>
                <Text style={styles.instructorText}>
                  Instructor: {course.instructor}
                </Text>
              </View>
              <View style={styles.courseActions}>
                {isEnrolled(course._id) ? (
                  <View style={styles.enrolledBadge}>
                    <Text style={styles.enrolledText}>Enrolled</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.enrollButton}
                    onPress={() => handleEnrollment(course._id)}
                    disabled={loading}>
                    <Text style={styles.enrollButtonText}>Enroll</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.courseStats}>
              <Text style={styles.statsText}>
                {course.enrolledStudents.length} students enrolled
              </Text>
              <Text style={styles.statsText}>
                Created: {new Date(course.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.courseContent}>
              <Text style={styles.contentLabel}>Course Content:</Text>
              <Text style={styles.contentText}>{course.content}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderEnrolledCourses = () => {
    if (loading && enrolledCourses.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading enrolled courses...</Text>
        </View>
      );
    }

    if (enrolledCourses.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No enrolled courses</Text>
          <Text style={styles.emptySubtitle}>
            Browse all courses to find something interesting to enroll in.
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
        {enrolledCourses.map(course => (
          <View key={course._id} style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseDescription}>
                  {course.description}
                </Text>
                <Text style={styles.instructorText}>
                  Instructor: {course.instructor}
                </Text>
              </View>
              <View style={styles.courseActions}>
                <View style={styles.enrolledBadge}>
                  <Text style={styles.enrolledText}>Enrolled</Text>
                </View>
              </View>
            </View>

            <View style={styles.courseStats}>
              <Text style={styles.statsText}>
                {course.enrolledStudents.length} students enrolled
              </Text>
            </View>

            <View style={styles.courseContent}>
              <Text style={styles.contentLabel}>Course Content:</Text>
              <Text style={styles.contentText}>{course.content}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderRecommendations = () => {
    return (
      <View style={styles.recommendationsContainer}>
        <View style={styles.recommendationsHeader}>
          <Text style={styles.recommendationsTitle}>
            AI Course Recommendations
          </Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => setShowGPTModal(true)}>
            <Text style={styles.generateButtonText}>Generate New</Text>
          </TouchableOpacity>
        </View>

        {recommendations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No recommendations yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap "Generate New" to get personalized course recommendations
              based on your goals.
            </Text>
            <View style={styles.examplePrompts}>
              <Text style={styles.exampleTitle}>Example prompts:</Text>
              <Text style={styles.exampleText}>
                • I want to be a software engineer
              </Text>
              <Text style={styles.exampleText}>
                • Help me learn data science
              </Text>
              <Text style={styles.exampleText}>
                • I'm interested in web development
              </Text>
              <Text style={styles.exampleText}>
                • I want to learn mobile app development
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView
            style={styles.coursesList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  setRefreshing(true);
                  await loadCachedRecommendations();
                  setRefreshing(false);
                }}
              />
            }>
            {recommendations.map(recommendation => (
              <View key={recommendation.id} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>
                      {recommendation.title}
                    </Text>
                    <Text style={styles.courseDescription}>
                      {recommendation.description}
                    </Text>
                    {recommendation.isAvailable && (
                      <Text style={styles.availableText}>
                        ✓ Available in our catalog
                      </Text>
                    )}
                  </View>
                  <View style={styles.matchScore}>
                    <Text style={styles.matchScoreText}>
                      {recommendation.matchScore}%
                    </Text>
                    <Text style={styles.matchLabel}>Match</Text>
                  </View>
                </View>

                <View style={styles.recommendationReason}>
                  <Text style={styles.reasonLabel}>Why this course:</Text>
                  <Text style={styles.reasonText}>{recommendation.reason}</Text>
                </View>

                {recommendation.isAvailable && recommendation.courseId ? (
                  <TouchableOpacity
                    style={styles.enrollButton}
                    onPress={() => handleEnrollment(recommendation.courseId!)}
                    disabled={loading}>
                    <Text style={styles.enrollButtonText}>
                      {isEnrolled(recommendation.courseId)
                        ? 'Already Enrolled'
                        : 'Enroll Now'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.notAvailableContainer}>
                    <Text style={styles.notAvailableText}>
                      This course is not currently available in our catalog
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return renderAllCourses();
      case 'enrolled':
        return renderEnrolledCourses();
      case 'recommendations':
        return renderRecommendations();
      default:
        return renderAllCourses();
    }
  };
  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Student Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>⚙️</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>
          Explore courses and get AI-powered recommendations
        </Text>

        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userText}>Name: {user.name}</Text>
            <Text style={styles.userText}>ID: {user.id}</Text>
            <Text style={styles.userText}>Email: {user.email}</Text>
          </View>
        )}
      </View>

      <View style={styles.tabContainer}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabButton, isActive && styles.activeTabButton]}>
              <Text
                style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.contentContainer}>{renderContent()}</View>

      <Modal
        visible={showGPTModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGPTModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI Course Recommendations</Text>
            <Text style={styles.modalDescription}>
              Describe your learning goals to get personalized course
              recommendations from AI.
            </Text>

            <TextInput
              multiline
              placeholder="E.g., I want to become a full-stack developer"
              value={gptPrompt}
              onChangeText={setGptPrompt}
              style={styles.modalTextInput}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowGPTModal(false);
                  setGptPrompt('');
                }}
                disabled={gptLoading}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  (!gptPrompt || gptLoading) && styles.disabledButton,
                ]}
                onPress={() => generateGPTRecommendations(gptPrompt)}
                disabled={!gptPrompt || gptLoading}>
                {gptLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Generate</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9fafb'},
  header: {paddingHorizontal: 16, marginBottom: 8},
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
  subtitle: {fontSize: 16, color: '#6b7280', marginTop: 4},
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tabButton: {paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6},
  activeTabButton: {backgroundColor: '#2563eb'},
  tabLabel: {fontSize: 16, color: '#374151'},
  activeTabLabel: {color: '#fff', fontWeight: '600'},
  contentContainer: {flex: 1, paddingHorizontal: 16},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 12, fontSize: 16, color: '#2563eb'},
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  coursesList: {flex: 1},
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  courseHeader: {flexDirection: 'row', justifyContent: 'space-between'},
  courseInfo: {flex: 1, paddingRight: 12},
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  courseDescription: {fontSize: 14, color: '#4b5563', marginBottom: 6},
  instructorText: {fontSize: 12, fontStyle: 'italic', color: '#6b7280'},
  courseActions: {justifyContent: 'center'},
  enrollButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  enrollButtonText: {color: '#fff', fontWeight: '600', fontSize: 14},
  enrolledBadge: {
    backgroundColor: '#10b981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  enrolledText: {color: '#fff', fontWeight: '600'},
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statsText: {fontSize: 12, color: '#6b7280'},
  courseContent: {marginTop: 10},
  contentLabel: {fontWeight: '600', color: '#374151', marginBottom: 4},
  contentText: {fontSize: 14, color: '#4b5563'},

  // Recommendations
  recommendationsContainer: {flex: 1},
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  recommendationsTitle: {fontSize: 16, fontWeight: '700', color: '#111827'},
  generateButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  generateButtonText: {color: '#fff', fontWeight: '600', fontSize: 16},
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 1},
  },
  recommendationHeader: {flexDirection: 'row', justifyContent: 'space-between'},
  availableText: {color: '#10b981', fontWeight: '600', marginTop: 4},
  matchScore: {justifyContent: 'center', alignItems: 'center'},
  matchScoreText: {fontSize: 22, fontWeight: '700', color: '#2563eb'},
  matchLabel: {fontSize: 12, color: '#6b7280'},
  recommendationReason: {marginTop: 10},
  reasonLabel: {fontWeight: '600', color: '#374151', marginBottom: 4},
  reasonText: {fontSize: 14, color: '#4b5563'},
  notAvailableContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
  },
  notAvailableText: {color: '#b45309', fontWeight: '600', fontSize: 13},

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  modalDescription: {fontSize: 14, color: '#6b7280', marginBottom: 16},
  modalTextInput: {
    height: 100,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: '#111827',
  },
  modalButtons: {flexDirection: 'row', justifyContent: 'flex-end'},
  modalButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {backgroundColor: '#6b7280'},
  modalButtonText: {color: '#fff', fontWeight: '700', fontSize: 16},
  disabledButton: {backgroundColor: '#9ca3af'},
  examplePrompts: {marginTop: 16, paddingHorizontal: 8},
  exampleTitle: {fontWeight: '700', marginBottom: 8, color: '#374151'},
  exampleText: {fontSize: 14, color: '#4b5563', marginBottom: 4},
  userInfo: {
    marginTop: 12,
  },
  userText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
});

export default StudentDashboard;
