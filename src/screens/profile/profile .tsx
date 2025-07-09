import React from 'react';
import {Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Profile: {name: string};
};


type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<ProfileScreenProps> = ({route}) => {
  return (
    <View>
      <Text>This is {route.params.name}'s profile</Text>
    </View>
  );
};


export default ProfileScreen;
