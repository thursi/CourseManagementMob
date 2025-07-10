import { OPENAI_API_KEY } from 'config';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';


const GPTRecommendations = () => {
  const [prompt, setPrompt] = useState('');
  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content:
                  'You are a helpful assistant that recommends courses based on career goals. Provide specific course recommendations with explanations.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 500,
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
      const recommendation =
        data.choices[0]?.message?.content || 'No recommendations available';
      setRecommendations(recommendation);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Course Recommendations</Text>
        <Text style={styles.subtitle}>
          Get personalized course recommendations based on your career goals
        </Text>
      </View>

      <View style={styles.inputBox}>
        <Text style={styles.inputLabel}>
          What do you want to learn or achieve?
        </Text>
        <TextInput
          multiline
          numberOfLines={4}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Example: I want to be a software engineer..."
          style={[styles.textInput, styles.textArea]}
        />

        <TouchableOpacity
          disabled={loading}
          onPress={handleSubmit}
          style={[styles.submitButton, loading && styles.disabledButton]}>
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.submitButtonText}>
                {' '}
                Getting recommendations...
              </Text>
            </>
          ) : (
            <Text style={styles.submitButtonText}>Get Recommendations</Text>
          )}
        </TouchableOpacity>
      </View>

      {recommendations.length > 0 && (
        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationTitle}>AI Recommendations</Text>
          <Text style={styles.recommendationText}>{recommendations}</Text>
        </View>
      )}

      <View style={styles.examples}>
        <Text style={styles.examplesTitle}>Example Prompts:</Text>
        <Text style={styles.exampleItem}>
          • I want to be a software engineer, what courses should I follow?
        </Text>
        <Text style={styles.exampleItem}>
          • I'm interested in data science and machine learning
        </Text>
        <Text style={styles.exampleItem}>
          • Help me become a full-stack web developer
        </Text>
        <Text style={styles.exampleItem}>
          • I want to learn about cybersecurity
        </Text>
      </View>
    </ScrollView>
  );
};

export default GPTRecommendations;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  inputLabel: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  recommendationBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    elevation: 1,
  },
  recommendationTitle: {
    fontWeight: '700',
    color: '#1F2937',
    fontSize: 16,
    marginBottom: 8,
  },
  recommendationText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
  },
  examples: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  examplesTitle: {
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  exampleItem: {
    fontSize: 13,
    color: '#78350F',
    marginBottom: 4,
  },
});
