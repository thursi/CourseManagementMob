import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useAuth} from '../../hooks/login';
import {RootStackParamList} from 'navigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type DashboardProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const Dashboard: React.FC<DashboardProps> = ({navigation}) => {
  const {user, logout} = useAuth();

  useEffect(() => {
    if (user?.role === 'student') {
      navigation.replace('StudentDashboard');
    } else if (user?.role === 'instructor') {
      navigation.replace('InstructorDashboard');
    }
  }, [user, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Course Compass</Text>
        <View style={styles.headerRight}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>({user?.role})</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Optionally show a loading indicator here while redirecting */}
      <View style={styles.content}>
        <Text style={{textAlign: 'center', color: '#6b7280'}}>
          Redirecting to your dashboard...
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginRight: 10,
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  userRole: {
    fontSize: 12,
    color: '#6b7280',
  },
  logoutButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});
