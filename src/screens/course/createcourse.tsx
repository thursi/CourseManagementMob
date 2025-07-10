import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
// import {useCourses} from '../../hooks/course';

// import {Plus, BookOpen} from 'lucide-react-native';
// import { useAuth } from '../../hooks/login';
import {RootStackParamList} from 'navigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProcessingPaymentProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateCourse'
> & {};

const CreateCourse: React.FC<ProcessingPaymentProps> = ({}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  // const {addCourse} = useCourses();
  // const {user} = useAuth();

  // const handleSubmit = async () => {
  //   if (!formData.title || !formData.description || !formData.content) {
  //     Alert.alert('Validation Error', 'Please fill in all fields');
  //     return;
  //   }

  //   if (!user) {
  //     Alert.alert('Authentication Error', 'User not authenticated');
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     await addCourse({
  //       ...formData,
  //       instructor: user.name,
  //       instructorId: user.id,
  //     });

  //     Alert.alert('Success', 'Course created successfully!');
  //     setFormData({title: '', description: '', content: ''});
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to create course');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    const storedUser = await AsyncStorage.getItem('user');
    const token = storedUser ? JSON.parse(storedUser).token : null;
    const userName = storedUser ? JSON.parse(storedUser).name : null;
    const userId = storedUser ? JSON.parse(storedUser).id : null;

    const {title, description, content} = formData;

    if (!title || !description || !content) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    if (!storedUser) {
      Alert.alert('Authentication Error', 'User not authenticated');
      return;
    }

    setLoading(true);

    if (!token) {
      Alert.alert(
        'Authentication Error',
        'Token not found. Please login again.',
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://192.168.8.142:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // ✅ use token here
        },
        body: JSON.stringify({
          title,
          description,
          content,
          instructor: userName,
          instructorId: userId,
        }),
      });

      const data = await response.json();
      console.log('Course creation response:', data);

      if (response.ok) {
        await AsyncStorage.setItem('course', JSON.stringify(data));

        Alert.alert('Success', 'Course created successfully!');
        setFormData({title: '', description: '', content: ''});
      } else {
        Alert.alert('Error', data.message || 'Failed to create course');
      }
    } catch (error) {
      console.log('Course creation error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {/* <BookOpen size={48} color="#3b82f6" /> */}
        <Text style={styles.title}>Create New Course</Text>
        <Text style={styles.subtitle}>
          Share your knowledge with students around the world
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Course Title *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={text => setFormData({...formData, title: text})}
          placeholder="Enter course title"
        />

        <Text style={styles.label}>Course Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={text => setFormData({...formData, description: text})}
          placeholder="Describe what students will learn in this course"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Course Content *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.content}
          onChangeText={text => setFormData({...formData, content: text})}
          placeholder="Detailed course content, syllabus, and learning objectives"
          multiline
          numberOfLines={6}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={styles.buttonText}> Creating Course...</Text>
            </>
          ) : (
            <>
              {/* <Plus color="#fff" size={20} /> */}
              <Text style={styles.buttonText}> Create Course</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateCourse;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  form: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    color: 'black',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
